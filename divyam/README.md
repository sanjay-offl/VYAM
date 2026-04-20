
# DIVYAM – Digital Innovation for Visionary Young Accessible Minds

Accessible education platform prototype for visually impaired students (India), built as a full-stack app:

- Frontend: React (Vite) + Tailwind + Framer Motion
- Backend: Spring Boot + Spring Security (JWT) + PostgreSQL

## 1) Backend (Spring Boot)

### Prerequisites

- Java 17+ (Java 21 also works)
- Maven (`mvn`) installed
- PostgreSQL running locally (or use Docker Compose below)

### Configure (optional)

The backend reads environment variables (defaults shown):

- `DIVYAM_DB_URL` (default `jdbc:postgresql://localhost:5432/divyam`)
- `DIVYAM_DB_USER` (default `divyam`)
- `DIVYAM_DB_PASSWORD` (default `divyam`)
- `DIVYAM_JWT_SECRET` (default is a safe-length placeholder; set a strong secret for real deployments)
- `DIVYAM_CORS_ORIGINS` (default `http://127.0.0.1:5173,http://localhost:5173`)

### Run

From the project root:

1. Start Postgres (see section 3)
2. Start the backend:

```bash
cd backend
mvn spring-boot:run
```

Backend runs at `http://localhost:8080`.

### Seeded demo users

On first run, the backend seeds:

- Student: `student@divyam.local` / `student123`
- Teacher: `teacher@divyam.local` / `teacher123`

### Key API routes

- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/users/me` (JWT required)
- `GET /api/videos` (JWT required)
- `POST /api/videos` (JWT + role TEACHER, multipart: `title`, `description?`, `file`)
- `GET /api/analytics/summary` (JWT required)
- `GET /api/analytics/ai/emotion` (mock)
- `GET /api/analytics/ai/engagement` (mock)
- `GET /api/health`

Uploads are served at `http://localhost:8080/uploads/<filename>`.

## 2) Frontend (React + Vite)

### Run

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://127.0.0.1:5173`.

Notes:

- The frontend uses a Vite proxy so requests to `/api/*` go to `http://localhost:8080`.
- Recorded lectures and teacher panel are protected routes; log in first.

## 3) Database (PostgreSQL)

### Option A: Docker Compose (recommended)

From the project root:

```bash
docker compose up -d
```

This starts Postgres with:

- DB: `divyam`
- User: `divyam`
- Password: `divyam`

### Option B: Local PostgreSQL

Create a DB/user matching the defaults in [backend/src/main/resources/application.properties](backend/src/main/resources/application.properties).

## 4) Minimal schema (JPA)

JPA auto-creates tables with `spring.jpa.hibernate.ddl-auto=update`.
Core entities:

- `users`: name, email (unique), password (BCrypt), role (STUDENT/TEACHER)
- `lectures`: title, description, url, teacher_id
- `progress`: user_id, lecture_id, completion (0..1), unique(user_id, lecture_id)

## 5) Demo walkthrough

1. Start Postgres (Docker Compose) and backend.
2. Start frontend.
3. Log in as:
	- Teacher → upload a lecture video in “Teacher Panel”
	- Student → open “Recorded Lectures” and play videos
4. Try voice navigation (browser-dependent SpeechRecognition support).

## Troubleshooting

- If backend won’t start: verify Postgres is running and reachable on `localhost:5432`.
- If CORS errors appear: set `DIVYAM_CORS_ORIGINS` to match your frontend URL.
- If you don’t have Maven installed: install Maven or use an IDE that bundles it.
