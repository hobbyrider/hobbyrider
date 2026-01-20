# Documentation

This directory contains all project documentation organized by category.

## 📁 Documentation Structure

### 📘 [Guides](guides/) - User & Admin Guides
Practical guides for using and managing the application:
- **`ADMIN_QUICK_REFERENCE.md`** - Quick reference for admin features
- **`MODERATION_GUIDE.md`** - Content moderation guide

### ⚙️ [Setup](setup/) - Setup & Configuration
Setup instructions and configuration guides:
- **`DEPLOYMENT.md`** - Production deployment guide
- **`DEVELOPMENT.md`** - Development environment setup
- **`AUTH_SETUP.md`** - Authentication setup (OAuth, Email)
- **`RESEND_SETUP.md`** - Email service (Resend) configuration
- **`PRODUCTION_DEPLOYMENT_CHECKLIST.md`** - Production deployment checklist

### 🎯 [Features](features/) - Feature Documentation
Documentation for implemented features:
- **Analytics & Monitoring**:
  - `POSTHOG_SETUP.md` - PostHog analytics setup
  - `POSTHOG_DEVELOPER_GUIDE.md` - PostHog integration guide for developers
  - `POSTHOG_INTEGRATION_CHECKLIST.md` - Quick checklist for PostHog integration
  - `ANALYTICS_IMPLEMENTATION.md` - Analytics implementation details
  - `SENTRY_SETUP.md` - Sentry error tracking setup

- **Product Features**:
  - `PRODUCT_SEEDING_QUALITY_RULES.md` - Rules for seeding products
  - `PRODUCT_URL_COMPLETE.md` - Product URL migration audit
  - `IMAGE_OPTIMIZATION_IMPLEMENTATION.md` - Image optimization guide
  - `SOCIAL_SHARING_IMPLEMENTATION.md` - Social sharing setup

### 🏗️ [Architecture](architecture/) - Technical Architecture
Technical architecture and build documentation:
- **`DESIGN_SYSTEM.md`** - Design system documentation
- **`PERFORMANCE_OPTIMIZATIONS.md`** - Performance optimization details
- **`build-documentation/`** - Comprehensive build documentation
  - See `build-documentation/00-INDEX.md` for navigation

### 🔧 [Troubleshooting](troubleshooting/) - Troubleshooting Guides
Guides for resolving common issues:
- **`DATABASE_CONNECTION_FIX.md`** - Database connection troubleshooting
- **`TROUBLESHOOTING_DATABASE.md`** - Database troubleshooting guide

### 📋 [Planning](planning/) - Planning Documents
Project planning and roadmap:
- **`ROADMAP.md`** - Project roadmap

---

## 📝 Documentation Guidelines

### Where to Put New Documentation

**Use this structure for all new `.md` files:**

#### Root Directory
- ✅ **`README.md`** - Main project readme (ONLY this file should be in root)

#### `docs/guides/`
- User-facing guides
- Admin guides
- How-to guides
- Workflows

#### `docs/setup/`
- Setup instructions
- Configuration guides
- Installation guides
- Environment setup

#### `docs/features/`
- Feature documentation
- Implementation guides
- Feature-specific setup
- Integration guides

#### `docs/architecture/`
- Technical documentation
- System design
- Architecture decisions
- Code organization

#### `docs/troubleshooting/`
- Troubleshooting guides
- Fix documentation
- Error resolution
- Debug guides

#### `docs/planning/`
- Roadmaps
- Project plans
- Future features
- Strategy documents

#### `docs/build-documentation/`
- Comprehensive build docs
- Executive summaries
- Technical deep-dives
- Project overviews

#### Scripts
- **`scripts/*.md`** - Script-specific documentation (keep with scripts)

#### GitHub
- **`.github/*.md`** - GitHub-specific documentation (keep in .github)

---

## 🚫 What NOT to Put in Root

**Never put documentation files in the root directory except:**
- `README.md` - Main project readme

**All other `.md` files should go in:**
- `docs/` subdirectories
- Script folders (if script-specific)
- `.github/` (if GitHub-specific)

---

## 📖 Quick Links

### For Developers
- **Setup**: See `setup/DEVELOPMENT.md`
- **Analytics Integration**: See `features/POSTHOG_DEVELOPER_GUIDE.md`
- **Architecture**: See `architecture/build-documentation/`

### For Deployment
- **Production**: See `setup/DEPLOYMENT.md`
- **Checklist**: See `setup/PRODUCTION_DEPLOYMENT_CHECKLIST.md`

### For Admins
- **Admin Guide**: See `guides/ADMIN_QUICK_REFERENCE.md`
- **Moderation**: See `guides/MODERATION_GUIDE.md`

### For Troubleshooting
- **Database Issues**: See `troubleshooting/`
- **General**: Check relevant feature docs in `features/`

---

**Remember**: Keep the root directory clean! All documentation goes in `docs/` subdirectories.
