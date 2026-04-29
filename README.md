# Job Tracker

Simple React + Spring Boot app to track jobs you applied for and update status as recruiters respond.

## Tech

- Frontend: React + Vite
- Backend: Spring Boot
- Database: Supabase PostgreSQL

## Supabase Setup

Create a Supabase project, then get your PostgreSQL connection string from:

`Project Settings -> Database -> Connection string -> URI`

Run the backend with these environment variables:

```bash
export DB_URL="jdbc:postgresql://YOUR_SUPABASE_HOST:5432/postgres?sslmode=require"
export DB_USERNAME="postgres"
export DB_PASSWORD="YOUR_SUPABASE_DB_PASSWORD"
```

The app creates/updates the `job_application` table automatically when the backend starts.

## Run Backend

```bash
cd backend
mvn spring-boot:run
```

Backend runs at:

`http://localhost:8080`

## Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:

`http://localhost:5173`

## API

- `GET /api/jobs` - list jobs
- `POST /api/jobs` - add a job
- `PUT /api/jobs/{id}` - update a job
- `DELETE /api/jobs/{id}` - delete a job
