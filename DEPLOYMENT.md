# GDM Church — Deployment Guide

## Architecture

```
Vercel  (React SPA)
   │  HTTPS
   ▼
Render / Railway  (Spring Boot JAR)
   │
   ├── Cloudinary  (image storage)
   └── Managed MySQL  (PlanetScale / Clever Cloud / AWS RDS)
```

---

## 1 — Database

Use any managed MySQL 8+ provider.

```sql
CREATE DATABASE gdm_church CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Note the connection string, username and password for the backend env vars.

---

## 2 — Backend (Render / Railway)

### Build command
```bash
cd backend && mvn package -DskipTests
```

### Start command
```bash
java -jar backend/target/church-backend-1.0.0.jar
```

### Environment variables (set in provider dashboard)

```
DB_URL=jdbc:mysql://<host>:3306/gdm_church?useSSL=true&serverTimezone=UTC
DB_USERNAME=<db_user>
DB_PASSWORD=<db_password>
JWT_SECRET=<min-32-char-random-string>
JWT_EXPIRATION_MS=86400000
FRONTEND_URL=https://your-app.vercel.app
ADMIN_SEED_EMAIL=admin@gdmchurch.org
ADMIN_SEED_PASSWORD=<strong-password>
CLOUDINARY_CLOUD_NAME=<your_cloud>
CLOUDINARY_API_KEY=<your_key>
CLOUDINARY_API_SECRET=<your_secret>
PORT=8080
```

Set `spring.jpa.hibernate.ddl-auto` to `update` for first deploy, then `validate` afterwards.

---

## 3 — Frontend (Vercel)

### Import project
Point Vercel at the `frontend/` directory.

### Build settings
| Setting | Value |
|---|---|
| Framework Preset | Vite |
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

### Environment variables

```
VITE_API_URL=https://your-backend.onrender.com/api/v1
```

### SPA routing
Create `frontend/public/_redirects`:
```
/*  /index.html  200
```

Or add `vercel.json` in the project root:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## 4 — Post-deploy checklist

- [ ] Visit the app and verify the home page loads
- [ ] Test admin login at `/admin/login`
- [ ] Create a test event via admin
- [ ] Upload an event photo
- [ ] Submit a prayer request and verify it's private
- [ ] Submit a contact message
- [ ] Verify HTTPS is active on both domains
- [ ] Change the default admin password
- [ ] Set `ddl-auto: validate` in production
