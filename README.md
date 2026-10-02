# GDM Church — Full-Stack Web Application

**Grace, Devotion and Mercy** — a responsive church website with a secure admin management platform.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS + React Router |
| Backend | Java 21 + Spring Boot 3 + Spring Security + JWT |
| Database | MySQL 8+ |
| Image Storage | Cloudinary |
| Build | Maven 3.9 (backend) · npm / Vite (frontend) |

---

## Prerequisites

- Java 21+ (Temurin recommended)
- Maven 3.9+
- Node.js 18+ and npm 9+
- MySQL 8+
- A Cloudinary account (free tier works)

---

## Project Structure

```
gdm-church/
  backend/          Spring Boot REST API
  frontend/         React + Vite SPA
  IMPLEMENTATION_PLAN.md
  README.md
  DATABASE.md
  API.md
  SECURITY.md
  DEPLOYMENT.md
  .gitignore
```

---

## Setup

### 1 — Database

```sql
CREATE DATABASE gdm_church CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

The application creates tables automatically on first run (`ddl-auto: update`).

---

### 2 — Backend environment

Create `backend/src/main/resources/application-local.yml` **or** set environment variables.  
See `backend/.env.example` for the full variable list.

Minimum required:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/gdm_church?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
    username: root
    password: your_password

app:
  jwt:
    secret: your-secret-min-32-chars-change-this
  cors:
    allowed-origins: http://localhost:5173
  admin:
    seed-email: admin@gdmchurch.org
    seed-password: YourStrongPassword@123

cloudinary:
  cloud-name: your_cloud_name
  api-key: your_api_key
  api-secret: your_api_secret
```

---

### 3 — Start the backend

```bash
cd backend
mvn spring-boot:run
# or
mvn package -DskipTests && java -jar target/church-backend-1.0.0.jar
```

API available at `http://localhost:8080`  
Swagger UI: `http://localhost:8080/swagger-ui.html`

---

### 4 — Frontend environment

```bash
cp frontend/.env.example frontend/.env.local
# Edit .env.local — set VITE_API_URL if backend is not on localhost:8080
```

---

### 5 — Start the frontend

```bash
cd frontend
npm install
npm run dev
```

App available at `http://localhost:5173`

---

## Default Admin Account

On first startup the backend seeds an admin account using the env values:

| Field | Default (change immediately) |
|---|---|
| Email | `admin@gdmchurch.org` |
| Password | `ChangeMe@123` |

**Change the password via the env variables before deploying to production.**

---

## Running Tests

### Backend

```bash
cd backend
mvn test
```

Tests use H2 in-memory database (no MySQL required for tests).

### Frontend

```bash
cd frontend
npm test          # if test runner is configured
npm run build     # verify production build
```

---

## API Documentation

Swagger UI is available at `/swagger-ui.html` when the backend is running.

See `API.md` for a summary of all endpoints.

---

## Environment Variables Reference

See `backend/.env.example` and `frontend/.env.example` for the complete list.  
**Never commit real credentials to version control.**

---

## Deployment

See `DEPLOYMENT.md` for step-by-step deployment to Vercel (frontend) + Render/Railway (backend) + managed MySQL.

---

## Modules

| Module | Public URL | Admin URL |
|---|---|---|
| Home | `/` | — |
| About | `/about` | `/admin/dashboard` → church info |
| Events | `/events`, `/events/:id` | `/admin/events` |
| Event Photos | `/photos` | `/admin/event-photos` |
| Pastors | `/pastors` | `/admin/pastors` |
| Schedule | `/schedule` | `/admin/pastor-schedule` |
| Sermons | `/sermons` | `/admin/sermons` |
| YouTube | `/youtube` | `/admin/youtube` |
| Gallery | `/gallery` | `/admin/gallery` |
| Offerings | `/offerings` | `/admin/offerings` |
| Prayer Requests | `/prayer` (submit only) | `/admin/prayer-requests` |
| Contact | `/contact` | `/admin/contact-messages` |
| Sunday School | `/sunday-school` | `/admin/sunday-school/*` |
| Admin Login | — | `/admin/login` |
