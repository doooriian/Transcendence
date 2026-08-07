# Transcendence

A 42 school web project built as a multiplayer online gaming platform.

The project is currently in its backend setup phase.
It includes a React frontend bootstrap, an Express backend, PostgreSQL, Prisma, Docker, and a first authentication flow.

## Tech Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS

### Backend

* Node.js
* Express
* JavaScript ESM
* Prisma 7
* PostgreSQL
* argon2
* jsonwebtoken

### DevOps

* Docker
* Docker Compose
* Makefile

## Project Structure

```txt
Transcendence/
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   └── healthRoutes.js
│   │   ├── generated/
│   │   ├── prismaClient.js
│   │   └── server.js
│   ├── Dockerfile
│   ├── package.json
│   └── prisma.config.ts
├── frontend/
│   ├── src/
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yaml
├── Makefile
├── .env.example
└── README.md
```

## Requirements

Before running the project, make sure you have:

* Docker
* Docker Compose
* Make

Node.js and npm are only required if you want to run the frontend, the backend, or Prisma commands outside Docker.

## Environment Variables

Create a `.env` file at the root of the project:

```bash
cp .env.example .env
```

Example:

```env
JWT_SECRET="change_me"

VITE_API_URL=http://localhost:3000

POSTGRES_PORT=5432
POSTGRES_DB=transcendence_dev
POSTGRES_USER=transcendence_user
POSTGRES_PASSWORD=change_me
```

The backend receives its Docker database URL from `docker-compose.yaml`.

Inside Docker, the backend connects to PostgreSQL through:

```txt
db:5432
```

If you want to run Prisma commands from your machine, you can use a local database URL like this:

```env
DATABASE_URL="postgresql://transcendence_user:change_me@localhost:5432/transcendence_dev?schema=public"
```

## Run With Docker

Start the backend and database:

```bash
make up
```

Or directly:

```bash
docker compose up -d --build
```

The backend runs on:

```txt
http://localhost:3000
```

The database is exposed on:

```txt
localhost:5432
```

## Makefile Commands

```bash
make up             # build and start containers
make build          # build Docker images
make down           # stop and remove containers
make stop           # stop containers
make restart        # restart containers
make ps             # show services status
make logs           # follow all logs
make logs-backend   # follow backend logs
make logs-db        # follow database logs
make db             # start only the database
make clean          # remove containers and orphans
make fclean         # remove containers, images, volumes and orphans
make re             # full clean rebuild
```

## Backend

The backend is an Express API using JavaScript ESM.

It listens on port `3000`.

Main middlewares:

* `cors`
* `express.json()`

CORS currently allows:

```txt
http://localhost:5173
```

## API Endpoints

### Healthcheck

```txt
GET /health
```

Expected response:

```json
{
  "status": "ok",
  "service": "backend"
}
```

### Register

```txt
POST /api/auth/register
```

Body:

```json
{
  "username": "john",
  "password": "doe"
}
```

Expected success response:

```json
{
  "token": "jwt_token"
}
```

Possible errors:

* `400` if username or password is missing
* `409` if username already exists
* `500` on server error

### Login

```txt
POST /api/auth/login
```

Body:

```json
{
  "username": "john",
  "password": "doe"
}
```

Expected success response:

```json
{
  "token": "jwt_token"
}
```

Possible errors:

* `400` if username or password is missing
* `404` if user does not exist
* `401` if password is invalid
* `500` on server error

## Database

The database uses PostgreSQL with Prisma.

Current Prisma model:

```prisma
model User {
  id           Int      @id @default(autoincrement())
  username     String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

Passwords are hashed with `argon2`.

Authentication tokens are generated with `jsonwebtoken`.

## Prisma Migrations

Prisma migrations are stored in:

```txt
backend/prisma/migrations/
```

They must be committed to Git.

When the backend container starts, `npm start` automatically runs:

```bash
npx prisma migrate deploy
```

This is done through the `prestart` script in `backend/package.json`.

So when someone runs:

```bash
docker compose up -d --build
```

Docker starts PostgreSQL, starts the backend, applies pending Prisma migrations, then launches the server.

To create a new migration after editing `schema.prisma`, start the database first:

```bash
make db
```

Then run Prisma locally from the backend folder:

```bash
cd backend
DATABASE_URL="postgresql://transcendence_user:change_me@localhost:5432/transcendence_dev?schema=public" npx prisma migrate dev --name migration_name
```

Then commit both:

```txt
backend/prisma/schema.prisma
backend/prisma/migrations/
```

## Frontend

The frontend is a Vite React app.

Install dependencies:

```bash
cd frontend
npm install
```

Start the frontend:

```bash
npm run dev
```

The frontend runs on:

```txt
http://localhost:5173
```

It calls the backend healthcheck endpoint using:

```txt
VITE_API_URL
```

## Local Backend Development

Install backend dependencies:

```bash
cd backend
npm install
```

Start the backend locally:

```bash
npm run dev
```

The dev script loads the root `.env` file with:

```txt
--env-file=../.env
```

## Git Workflow

Main branches:

```txt
main = stable branch
dev = integration branch
feature branches = temporary development branches
```

Create a branch from `dev`:

```bash
git checkout dev
git pull origin dev
git checkout -b feature-branch-name
```

Commit format examples:

```txt
feat(backend): add authentication routes
feat(db): add initial Prisma migration
chore(devops): add Docker workflow
docs: update README setup instructions
```

Open pull requests into `dev`.

Branches should be deleted after they are merged.

## Current Status

Implemented:

* React frontend bootstrap
* Tailwind CSS setup
* frontend/backend healthcheck display
* Express backend setup
* PostgreSQL Docker service
* Prisma 7 setup
* initial User model
* Prisma migration workflow
* user registration route
* user login route
* password hashing with argon2
* JWT generation
* Dockerfile for backend
* Docker Compose setup for backend and database
* Makefile Docker workflow

Next steps:

* add frontend authentication pages
* add authentication middleware
* protect private backend routes
* improve backend error handling
* add database healthcheck endpoint
* prepare WebSocket architecture for multiplayer games
* add game and match history models
