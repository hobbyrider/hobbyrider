# PART 4 — Data Model and Flows

**Previous:** [Project Structure ←](03-PROJECT-STRUCTURE.md) | **Next:** [Frontend UI →](05-FRONTEND-UI.md)

## Core Entities

Based on `prisma/schema.prisma`:

### 1. Software (Products)

**Location:** `prisma/schema.prisma` lines 13-39

```prisma
model Software {
  id          String   @id @default(cuid())
  name        String
  tagline     String
  description String?  @db.Text
  url         String   @unique
  maker       String?  // Legacy field (backward compatibility)
  makerId     String?  // Current field (FK to User)
  thumbnail   String?
  embedHtml   String?  @db.Text
  upvotes     Int      @default(0)
  viewCount   Int      @default(0)
  isHidden    Boolean  @default(false)
  createdAt   DateTime @default(now())
  lastViewedAt DateTime?
  
  // Relations
  makerUser   User?    @relation("MadeProducts")
  comments    Comment[]
  categories  Category[]
  images      ProductImage[]
  upvotedBy   Upvote[]
  reports     Report[]
}
```

**Key fields:**
- `maker` vs `makerId`: Legacy `maker` (string) and current `makerId` (FK) coexist for compatibility
- `upvotes`: Denormalized count (updated via `increment()`)
- `viewCount`: Denormalized count (incremented on view)
- `isHidden`: Moderation flag (hidden products excluded from feeds)

**Indexes:**
- `@@index([upvotes, createdAt])` - Homepage sorting
- `@@index([viewCount, createdAt])` - Popular products
- `@@index([makerId])` - User's products lookup
- `@@index([isHidden])` - Moderation filtering

### 2. User

**Location:** `prisma/schema.prisma` lines 80-112

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  username      String?   @unique
  password      String?   // Hashed (bcrypt)
  image         String?
  bio           String?   @db.Text
  website       String?
  linkedin      String?
  twitter       String?
  notifyOnUpvotes Boolean @default(true)
  notifyOnComments Boolean @default(true)
  isAdmin       Boolean   @default(false)
  
  // Relations
  madeProducts  Software[] @relation("MadeProducts")
  comments      Comment[]
  upvotes       Upvote[]
  reportsMade   Report[]
  followers     Follow[]
  following     Follow[]
}
```

**Key fields:**
- `username`: Auto-generated for OAuth users (from email), mandatory
- `password`: bcrypt-hashed (credentials provider only)
- `isAdmin`: Admin flag (for moderation access)
- `notifyOnUpvotes` / `notifyOnComments`: Email notification preferences

### 3. Comment

**Location:** `prisma/schema.prisma` lines 63-78

```prisma
model Comment {
  id        String   @id @default(cuid())
  content   String
  author    String?  // Legacy field
  authorId  String?  // Current field (FK to User)
  productId String
  isHidden  Boolean  @default(false)
  createdAt DateTime @default(now())
  
  // Relations
  authorUser User?    @relation("Comments")
  product    Software @relation(...)
  reports    Report[]
}
```

**Key fields:**
- `isHidden`: Moderation flag
- `author` vs `authorId`: Legacy string and current FK coexist

### 4. Upvote

**Location:** `prisma/schema.prisma` lines 152-163

```prisma
model Upvote {
  id        String   @id @default(cuid())
  userId    String
  productId String
  createdAt DateTime @default(now())
  
  // Relations
  user      User     @relation(...)
  product   Software @relation(...)
  
  @@unique([userId, productId]) // One upvote per user per product
}
```

**Key constraint:** `@@unique([userId, productId])` prevents duplicate upvotes.

### 5. Category

**Location:** `prisma/schema.prisma` lines 52-61

```prisma
model Category {
  id          String     @id @default(cuid())
  name        String     @unique
  slug        String     @unique
  description String?
  createdAt   DateTime   @default(now())
  products    Software[] // Many-to-many
}
```

**Relationships:** Many-to-many with `Software` (Prisma handles join table).

## Entity Relationships Diagram

```
User
 ├── has many Software (madeProducts)
 ├── has many Comment (comments)
 ├── has many Upvote (upvotes)
 ├── has many Report (reportsMade)
 ├── has many Follow (followers/following)
 └── has many Account (accounts - NextAuth)

Software
 ├── belongs to User (makerUser)
 ├── has many Comment (comments)
 ├── has many ProductImage (images)
 ├── has many Upvote (upvotedBy)
 ├── has many Report (reports)
 └── has many Category (categories - many-to-many)

Comment
 ├── belongs to User (authorUser)
 ├── belongs to Software (product)
 └── has many Report (reports)

Upvote
 ├── belongs to User (user)
 └── belongs to Software (product)
```

## Read/Write Paths

### Creating a Product

**Flow:**
1. User fills form at `/submit`
2. Form submits to Server Action `createSoftware()`
3. Server Action validates:
   - Authentication (`getSession()`)
   - Rate limit (`checkRateLimit()` - 5/day)
   - Input sanitization (`sanitizeInput()`)
   - URL validation (must start with `https://`, no shorteners)
   - Duplicate URL check
4. Create product: `prisma.software.create()`
5. Link categories (if selected)
6. `revalidatePath("/")` - Invalidate homepage cache
7. `redirect("/")` - Redirect to homepage

**Files involved:**
- `app/(main)/submit/page.tsx` - Submission form
- `app/actions/software.ts` - `createSoftware()` function
- `lib/rate-limit.ts` - Rate limiting
- `lib/utils.ts` - Input sanitization

**Code excerpt:**
```typescript
// app/actions/software.ts
export async function createSoftware(formData: FormData) {
  const session = await getSession()
  if (!session?.user?.id) throw new Error("You must be logged in")
  
  // Rate limit check
  const rateLimit = await checkRateLimit(session.user.id, "submission", RATE_LIMITS.submission)
  if (!rateLimit.allowed) throw new Error(rateLimit.error)
  
  // Input sanitization
  const name = sanitizeInput(String(formData.get("name") ?? ""), 40)
  const tagline = sanitizeInput(String(formData.get("tagline") ?? ""), 70)
  
  // Validation
  if (!name || !tagline || !url) throw new Error("Missing fields")
  
  // Create product
  await prisma.software.create({ data: { name, tagline, url, ... } })
  
  revalidatePath("/")
  redirect("/")
}
```

### Voting/Upvoting

**Flow:**
1. User clicks upvote button
2. Client component calls Server Action `upvoteSoftware()`
3. Server Action:
   - Checks authentication
   - Checks for existing upvote (`prisma.upvote.findUnique()`)
   - If exists: delete upvote, decrement count
   - If not exists: create upvote, increment count
   - Update denormalized `upvotes` count
4. `revalidatePath("/")` - Refresh UI
5. UI updates via `router.refresh()`

**Files involved:**
- `app/components/upvote-button.tsx` - Upvote UI component
- `app/actions/software.ts` - `upvoteSoftware()` function

**Code excerpt:**
```typescript
// app/actions/software.ts
export async function upvoteSoftware(id: string) {
  const session = await getSession()
  if (!session?.user?.id) throw new Error("You must be logged in")
  
  // Check existing upvote
  const existing = await prisma.upvote.findUnique({
    where: { userId_productId: { userId: session.user.id, productId: id } },
  })
  
  if (existing) {
    // Remove upvote
    await prisma.upvote.delete({ where: { id: existing.id } })
    await prisma.software.update({ where: { id }, data: { upvotes: { decrement: 1 } } })
  } else {
    // Add upvote
    await prisma.upvote.create({ data: { userId: session.user.id, productId: id } })
    await prisma.software.update({ where: { id }, data: { upvotes: { increment: 1 } } })
  }
  
  revalidatePath("/")
}
```

**Denormalization:** `Software.upvotes` is stored (not computed) and updated with `increment()`/`decrement()`.

### Listing / Ranking Logic

**Location:** `app/(main)/page.tsx` lines 82-185

**Sorting options:**
1. **Upvotes** (default) - Database order: `orderBy: [{ upvotes: "desc" }, { createdAt: "desc" }]`
2. **Newest** - Database order: `orderBy: [{ createdAt: "desc" }]`
3. **Comments** - In-memory sort (fetches 500 items, sorts by `commentCount`)
4. **Trending** - In-memory sort (fetches 500 items, calculates score)

**Trending algorithm:**
```typescript
// lib/filters.ts
function calculateTrendingScore(upvotes: number, createdAt: Date): number {
  const hoursSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60)
  const denominator = Math.pow(hoursSinceCreation + 2, 1.5)
  return upvotes / denominator
}
```

**Formula:** `upvotes / (hours_since_creation + 2)^1.5`

**Pagination:**
- 20 items per page (`itemsPerPage = 20`)
- Database pagination for "upvotes" and "newest" (`skip`, `take`)
- In-memory pagination for "trending" and "comments" (slice after sort)

**Performance concern:**
- Trending/comments: Fetches up to 500 products, sorts in memory, then paginates
- This works for small datasets but won't scale

### Moderation Status Fields

**Location:** `prisma/schema.prisma`

**Moderation flags:**
- `Software.isHidden` - Hidden products excluded from feeds
- `Comment.isHidden` - Hidden comments excluded from display

**Moderation flow:**
1. User reports content → `Report` record created
2. Admin reviews at `/admin/moderation`
3. Admin can hide content → Set `isHidden = true`
4. Hidden content filtered out in queries: `where: { isHidden: false }`

**Report model:**
```prisma
model Report {
  id            String   @id
  reporterId    String
  productId     String?
  commentId     String?
  reportedUserId String?
  reason        String   @db.Text
  status        String   @default("pending") // pending, reviewed, dismissed, resolved
  isArchived    Boolean  @default(false)
  reviewedAt    DateTime?
}
```

---

**Previous:** [Project Structure ←](03-PROJECT-STRUCTURE.md) | **Next:** [Frontend UI →](05-FRONTEND-UI.md)
