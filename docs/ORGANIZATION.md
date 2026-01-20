# Documentation Organization

This document explains the documentation structure and guidelines for organizing `.md` files.

## 📁 Structure

```
docs/
├── guides/              # User & admin guides
├── setup/               # Setup & configuration
├── features/            # Feature documentation
├── architecture/        # Technical architecture
├── troubleshooting/     # Troubleshooting guides
└── planning/            # Planning documents
```

## 🎯 Where to Put Documentation

### ✅ Root Directory
**ONLY `README.md`** should be in the root directory.

All other `.md` files must go in `docs/` subdirectories.

### 📘 Guides (`docs/guides/`)
User and admin guides:
- User-facing guides
- Admin guides
- How-to guides
- Workflows

**Examples:**
- `ADMIN_QUICK_REFERENCE.md`
- `MODERATION_GUIDE.md`

### ⚙️ Setup (`docs/setup/`)
Setup and configuration:
- Setup instructions
- Configuration guides
- Installation guides
- Environment setup
- Deployment guides
- Checklists

**Examples:**
- `DEPLOYMENT.md`
- `DEVELOPMENT.md`
- `AUTH_SETUP.md`
- `RESEND_SETUP.md`
- `PRODUCTION_DEPLOYMENT_CHECKLIST.md`

### 🎯 Features (`docs/features/`)
Feature documentation:
- Feature documentation
- Implementation guides
- Feature-specific setup
- Integration guides
- Service documentation

**Examples:**
- `POSTHOG_SETUP.md`
- `POSTHOG_DEVELOPER_GUIDE.md`
- `SENTRY_SETUP.md`
- `PRODUCT_SEEDING_QUALITY_RULES.md`
- `IMAGE_OPTIMIZATION_IMPLEMENTATION.md`

### 🏗️ Architecture (`docs/architecture/`)
Technical architecture:
- Technical documentation
- System design
- Architecture decisions
- Code organization
- Performance documentation
- Build documentation

**Examples:**
- `DESIGN_SYSTEM.md`
- `PERFORMANCE_OPTIMIZATIONS.md`
- `build-documentation/` (comprehensive build docs)

### 🔧 Troubleshooting (`docs/troubleshooting/`)
Troubleshooting guides:
- Troubleshooting guides
- Fix documentation
- Error resolution
- Debug guides

**Examples:**
- `DATABASE_CONNECTION_FIX.md`
- `TROUBLESHOOTING_DATABASE.md`

### 📋 Planning (`docs/planning/`)
Planning documents:
- Roadmaps
- Project plans
- Future features
- Strategy documents

**Examples:**
- `ROADMAP.md`

### 📜 Script-Specific (`scripts/*.md`)
Script-specific documentation stays with scripts.

**Examples:**
- `scripts/SEED_PRODUCT_INSTRUCTIONS.md`

### 🔷 GitHub-Specific (`.github/*.md`)
GitHub-specific documentation stays in `.github/`.

**Examples:**
- `.github/copilot-instructions.md`

## 📝 Guidelines

### File Naming
- Use **kebab-case**: `feature-name.md`
- Be descriptive: `product-url-migration.md`
- Match category: `setup/`, `features/`, etc.

### Creating New Documentation

1. **Choose the right category** (see structure above)
2. **Place in correct subdirectory** (`docs/[category]/`)
3. **Use descriptive filename** (kebab-case)
4. **Update relevant README** (category README or main `docs/README.md`)
5. **Link from main README** if it's important

### Updating Documentation

1. **Keep it organized** - Use subdirectories
2. **Update indexes** - Update relevant README files
3. **Maintain links** - Update references when moving files
4. **Use categories** - Don't mix categories

## 🚫 What NOT to Do

❌ **Never put `.md` files in root** (except `README.md`)  
❌ **Don't create random `.md` files** - use the structure  
❌ **Don't mix categories** - keep related docs together  
❌ **Don't ignore README files** - update them when adding docs  

## 📖 Quick Reference

- **Main index**: `docs/README.md`
- **Category indexes**: Each subdirectory has `README.md`
- **Guidelines**: `.documentation-guidelines.md` (root)
- **Archived docs**: `.archive/` (historical reference)

---

**Remember**: Keep the root directory clean! All documentation goes in `docs/` subdirectories.
