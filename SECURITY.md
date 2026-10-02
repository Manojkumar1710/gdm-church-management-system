# GDM Church — Security Notes

## Authentication

- Admin login via `POST /api/v1/auth/login` with email + password
- Passwords hashed with BCrypt (strength 12)
- JWT access token (HS256, 24 h default, configurable via `JWT_EXPIRATION_MS`)
- Token validated on every request via `JwtAuthFilter` (Spring `OncePerRequestFilter`)
- No password hash ever returned in any response DTO

## Authorisation

- All `/api/v1/admin/**` endpoints require `ROLE_ADMIN`
- All mutation endpoints (POST/PUT/PATCH/DELETE) outside `/api/v1/auth/login` require `ROLE_ADMIN`
- Public GET endpoints are explicitly open — no auth token needed
- Public submission endpoints (`/prayer-requests`, `/contact-messages`, `/offerings`) are open POST

## Private Data

| Data | Access |
|---|---|
| Offering records (donor, amount) | Admin only — never on public endpoints |
| Prayer requests | Admin only — never on public endpoints |
| Children's PII (name, DOB, parent contact) | Admin only |
| Pastor contact number | Only shown publicly if `contactPublic = true` |
| Pastor email | Never shown publicly |

## CORS

- Restricted to the origin set in `FRONTEND_URL` env variable
- Credentials allowed only from that origin

## Image Uploads

- File type validated server-side (JPG, PNG, WebP only)
- Max size: 10 MB per file
- Images stored in Cloudinary — no binaries in MySQL

## Payments (Phase 13)

- Payment success is **never** trusted from the frontend
- Backend verifies payment via provider webhook + signature
- No card or payment credentials ever stored
- Monetary values stored as `DECIMAL(12,2)` / `BigDecimal`

## Production Checklist

- [ ] Change default admin password (`ADMIN_SEED_PASSWORD`)
- [ ] Set a strong `JWT_SECRET` (32+ random characters)
- [ ] Set `FRONTEND_URL` to production domain only
- [ ] Use HTTPS for both frontend and backend
- [ ] Use a managed MySQL instance with restricted access
- [ ] Set `spring.jpa.hibernate.ddl-auto=validate` in production
- [ ] Rotate Cloudinary API secret regularly
- [ ] Never commit `.env`, `application-local.yml` or secrets to Git
