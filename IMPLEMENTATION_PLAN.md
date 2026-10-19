# GDM Church — Implementation Plan
Version: 2.0 (updated after Phase 1–16 completion)
Date: September 2026
Author: Manoj Kumar Akula (Lead Full-Stack Engineer)

---

## 1. Repository Inspection Summary

**Status at inspection:** Empty workspace — greenfield implementation.  
All modules built from scratch following BRD v1.0 and TDD v1.0.

---

## 2. Target Architecture

```
Frontend (React 18 + Vite + Tailwind CSS + React Router)
  │  HTTPS REST/JSON
  ▼
Backend (Java 21 + Spring Boot 3.3 + Spring Security + JWT)
  │
  ├── Spring Data JPA + Hibernate
  ├── MySQL 8+  (H2 for tests)
  ├── Cloudinary (image storage)
  └── Razorpay (Phase 13 — payment gateway, not yet implemented)
```

**Project layout:**

```
gdm-church/
  backend/                   Spring Boot Maven project
    src/main/java/com/gdm/church/
      auth/                  User entity, JWT, login API
      security/              JwtTokenProvider, JwtAuthFilter, SecurityConfig
      church/                ChurchInformation, HeroSection
      events/                Event CRUD
      eventphotos/           EventPhoto upload (Cloudinary)
      pastors/               Pastor + PastorSchedule
      sermons/               Sermon CRUD
      youtube/               YoutubeVideo CRUD
      gallery/               GalleryItem CRUD (Cloudinary)
      offerings/             Offering + OfferingPurpose
      prayers/               PrayerRequest
      contact/               ContactMessage
      sundayschool/          children/ teachers/ programs/
      config/                Cloudinary, CORS, OpenAPI, AdminDashboard
      common/                BaseEntity, ApiResponse, PageResponse, exceptions
    src/test/java/com/gdm/church/
      security/              SecurityEndpointTest (20 tests)
    src/main/resources/
      application.yml        Main config (uses env vars)
    src/test/resources/
      application-test.yml   H2 in-memory for tests

  frontend/                  React + Vite SPA
    src/
      App.jsx                Full React Router setup
      main.jsx               React 18 entry point
      index.css              Tailwind + custom design tokens
      context/AuthContext    JWT auth state
      routes/ProtectedRoute  Admin route guard
      services/              API service layer (axios)
      pages/                 Public pages (14 pages)
      admin/                 Admin pages (12 pages) + AdminLayout
      components/            Navbar, Footer, Modal, Skeleton, EmptyState, etc.
    vite.config.js           React plugin + dev proxy
    tailwind.config.js       Church design tokens (navy, gold, cream)

  README.md
  API.md
  SECURITY.md
  DEPLOYMENT.md
  IMPLEMENTATION_PLAN.md
  .gitignore
```

---

## 3. Module Inventory

| Module | Backend | Frontend (Public) | Frontend (Admin) | Status |
|---|---|---|---|---|
| Authentication | JWT + Spring Security | — | /admin/login | ✅ Done |
| Church Info / Hero | CRUD API | Home hero, About | /admin/church | ✅ Done |
| Events | CRUD API | /events, /events/:id | /admin/events | ✅ Done |
| Event Photos | Upload + Cloudinary | /photos | /admin/event-photos | ✅ Done |
| Pastors | CRUD API | /pastors | /admin/pastors | ✅ Done |
| Pastor Schedule | CRUD API | /schedule | /admin/pastor-schedule | ✅ Done |
| Sermons | CRUD API | /sermons | /admin/sermons | ✅ Done |
| YouTube | CRUD API | /youtube | /admin/youtube | ✅ Done |
| Gallery | CRUD + Cloudinary | /gallery | /admin/gallery | ✅ Done |
| Prayer Requests | API (private) | /prayer (submit) | /admin/prayer-requests | ✅ Done |
| Contact | API | /contact | /admin/contact-messages | ✅ Done |
| Sunday School | CRUD API | /sunday-school | /admin/sunday-school/* | ✅ Done |
| Offerings | CRUD API (private) | /offerings (submit) | /admin/offerings | ✅ Done |
| Online Payments | — | — | — | ⏳ Phase 13 |
| Admin Dashboard | Stats API | — | /admin/dashboard | ✅ Done |

---

## 4. Database Schema

All tables implemented via JPA entities with `ddl-auto: update`:

| Table | Entity | Notes |
|---|---|---|
| `users` | `User` | BCrypt hash, ADMIN role |
| `church_information` | `ChurchInformation` | Singleton row, seeded on startup |
| `hero_sections` | `HeroSection` | One active hero, seeded on startup |
| `events` | `Event` | Status enum, indexes on date/status |
| `event_photos` | `EventPhoto` | FK → events, Cloudinary URL |
| `pastors` | `Pastor` | contactPublic flag |
| `pastor_schedule` | `PastorSchedule` | FK → pastors, conflict check |
| `sermons` | `Sermon` | published flag |
| `youtube_videos` | `YoutubeVideo` | URL validation in DTO |
| `gallery` | `GalleryItem` | Cloudinary URL |
| `offering_purposes` | `OfferingPurpose` | Seeded with 7 default purposes |
| `offerings` | `Offering` | DECIMAL(12,2), FK → purposes, PRIVATE |
| `prayer_requests` | `PrayerRequest` | Status enum (NEW/IN_PROGRESS/PRAYED/ARCHIVED), PRIVATE |
| `contact_messages` | `ContactMessage` | Status enum (NEW/READ/RESOLVED) |
| `sunday_school_children` | `SundaySchoolChild` | PII — admin only, NEVER public |
| `sunday_school_teachers` | `SundaySchoolTeacher` | contactPublic flag |
| `sunday_school_programs` | `SundaySchoolProgram` | published flag |

---

## 5. API Summary

Base: `/api/v1` — see `API.md` for the full endpoint table.

Standard success envelope:
```json
{ "success": true, "message": "OK", "data": {} }
```

Standard error envelope:
```json
{ "timestamp": "…", "status": 400, "code": "VALIDATION_ERROR", "message": "…", "fieldErrors": {} }
```

---

## 6. Security Implementation

- BCrypt password hashing (strength 12)
- JWT HS256 access token, 24 h expiry (configurable)
- `JwtAuthFilter` — `OncePerRequestFilter`, attaches `ROLE_ADMIN` authority
- `JwtAuthEntryPoint` — returns JSON 401 (not HTML redirect)
- CORS restricted to `FRONTEND_URL` env variable
- No password hash ever in any DTO
- Offering records, prayer requests, children PII — admin-only at service + security layer
- Pastor `contactPublic` flag controls public visibility of contact number

---

## 7. Frontend Architecture

```
src/
  App.jsx            BrowserRouter — all 30+ routes
  main.jsx           React 18 createRoot entry
  context/
    AuthContext.jsx  login/logout/isAdmin, token in localStorage
  routes/
    ProtectedRoute   redirects to /admin/login if unauthenticated
  services/          axios wrappers — one file per domain
  pages/             14 public pages
  admin/             AdminLayout + 12 admin pages
    components/      AdminTable, Pagination, ConfirmDialog
  components/        Navbar, Footer, Modal, Skeleton, EmptyState, ErrorState,
                     SectionHeader
```

Design tokens: `church-blue #1e3a5f`, `church-gold #c9a84c`, `church-cream #fdfaf3`

---

## 8. Testing

### Backend tests — `SecurityEndpointTest.java`

20 integration tests with H2 + `@SpringBootTest`:

| Category | Tests |
|---|---|
| Public GET endpoints open without token | 6 |
| Admin endpoints return 401 without token | 5 |
| Login valid credentials → JWT | 1 |
| Login wrong password → 401 | 1 |
| Login unknown email → 401 | 1 |
| Login blank email → 400 validation | 1 |
| Admin dashboard accessible with token | 1 |
| Offerings accessible with token | 1 |
| Prayer requests accessible with token | 1 |
| Children PII accessible with token | 1 |
| Invalid/tampered token → 401 | 1 |

**Result: 20/20 passed, 0 failures, 0 errors**

---

## 9. Implementation Phases — Status

| Phase | Description | Status |
|---|---|---|
| 1 | Repository inspection + IMPLEMENTATION_PLAN.md | ✅ Complete |
| 2 | Backend foundation — pom.xml, application.yml, common response/error, Cloudinary config | ✅ Complete |
| 3 | Authentication — User entity, JWT provider, security filter, login API, seed admin | ✅ Complete |
| 4 | Church information + Hero section — entity, service, controller, seed data | ✅ Complete |
| 5 | Events — CRUD API, image upload, public + admin endpoints | ✅ Complete |
| 6 | Event photos — multi-file Cloudinary upload, publish/unpublish | ✅ Complete |
| 7 | Pastors + pastor schedule — contactPublic, conflict check | ✅ Complete |
| 8 | Sermons + YouTube — URL validation, published flag | ✅ Complete |
| 9 | Gallery — Cloudinary upload, lightbox on frontend | ✅ Complete |
| 10 | Prayer requests + Contact — private, status workflow | ✅ Complete |
| 11 | Sunday School — children (PII-private), teachers, programs | ✅ Complete |
| 12 | Offerings — manual records, purposes seeded, PRIVATE | ✅ Complete |
| 13 | Online payment integration (Razorpay) | ⏳ Pending |
| 14 | Admin dashboard — stats API + quick links | ✅ Complete |
| 15 | Responsive UI — Tailwind, mobile nav, lightbox, loading/empty/error states | ✅ Complete |
| 16 | Testing — 20 security integration tests passing | ✅ Complete |
| 17 | Deployment preparation — README, API.md, SECURITY.md, DEPLOYMENT.md, .gitignore, .env.example files | ✅ Complete |

---

## 10. Build Verification

| Artefact | Command | Result |
|---|---|---|
| Backend JAR | `mvn package -DskipTests` | ✅ `church-backend-1.0.0.jar` 56.8 MB |
| Backend tests | `mvn test -Dspring.profiles.active=test` | ✅ 20/20 passed |
| Frontend bundle | `npm run build` | ✅ 455 modules, 461 kB JS (128 kB gzip) |

---

## 11. What Needs to Happen Before Going Live

1. **MySQL database** — provision a managed MySQL 8+ instance
2. **Cloudinary account** — add real `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
3. **Change admin password** — set a strong `ADMIN_SEED_PASSWORD` in env
4. **Change JWT secret** — set a 32+ character random `JWT_SECRET`
5. **Set FRONTEND_URL** — point to the production Vercel domain
6. **Phase 13** — Razorpay integration if online offerings are required
7. **Seed real church data** — church info, at least one hero section, initial events
8. **HTTPS** — both frontend (Vercel handles this) and backend must use HTTPS
9. **Set `ddl-auto: validate`** — after first deploy stabilises the schema

---

## 12. Open Decisions / Ambiguities

| Decision | Choice Made | Rationale |
|---|---|---|
| Image storage | Cloudinary | Free tier sufficient, CDN delivery |
| Payment provider | Razorpay (Phase 13 only) | Explicitly named in TDD |
| JWT expiry | 24 h access token | Standard admin workflow |
| BCrypt strength | 12 | Security best practice |
| Admin seed | From env vars | Never hardcoded |
| Pagination default | 20 items | Standard |
| Latest event photos limit | 15 (configurable via `?limit=`) | Per BRD |
| CORS | `FRONTEND_URL` env variable | Security |

**Items that require input before Phase 13 (online payments):**
1. Razorpay account credentials
2. Webhook URL configuration at Razorpay dashboard
3. Decision on whether Phase 13 is needed for V1 launch

---

*Last updated: September 2026 — all phases through 17 complete except Phase 13 (online payments).*
