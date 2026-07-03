# Transcendence

A 42 school web project built as a multiplayer online gaming platform.

The project is currently in its bootstrap phase.
The current setup includes a React frontend, an Express backend, TypeScript, Tailwind CSS, and a basic frontend/backend healthcheck.

## Tech stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS

### Backend

* Node.js
* Express
* TypeScript

### Planned

* PostgreSQL
* Prisma
* WebSockets
* Docker
* HTTPS reverse proxy

## Project structure

```txt
Transcendence/
├── backend/
│   ├── src/
│   │   └── server.ts
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
├── README.md
└── .gitignore
```

## Requirements

Before running the project, make sure you have:

* Node.js
* npm

## Environment variables

Environment files are required locally, but must not be committed.

### Backend

Create:

```txt
backend/.env
```

Example:

```env
BACKEND_PORT=1414
```

### Frontend

Create:

```txt
frontend/.env
```

Example:

```env
VITE_API_URL=http://localhost:1414
```

The frontend uses `VITE_API_URL` to contact the backend API.

## Installation

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd frontend
npm install
```

## Run the project in development

Start the backend:

```bash
cd backend
npm run dev
```

The backend should run on:

```txt
http://localhost:1414
```

Start the frontend in another terminal:

```bash
cd frontend
npm run dev
```

The frontend should run on:

```txt
http://localhost:5173
```

## Healthcheck

The backend exposes a healthcheck endpoint:

```txt
GET /health
```

Expected response:

```json
{
  "status": "ok"
}
```

The frontend calls this endpoint and displays the backend status on the homepage.

If the backend is running, the frontend should display:

```txt
Backend status: ok
```

If the backend is stopped or unreachable, the frontend should display:

```txt
Backend status: unreachable
```

## Build

Build the backend:

```bash
cd backend
npm run build
```

Build the frontend:

```bash
cd frontend
npm run build
```

Generated `dist/` folders are ignored by Git and should not be committed.

## Git workflow

We use the following branch workflow:

```txt
main = stable branch
dev = integration branch
feature branches = temporary development branches
```

New work should be done from an up-to-date `dev` branch:

```bash
git checkout dev
git pull origin dev
git checkout -b feature-branch-name
```

After the work is done:

```bash
git add .
git commit -m "type(scope): short description"
git push -u origin feature-branch-name
```

Then open a pull request into `dev`.

Branches should be deleted after they are merged.

## Commit examples

```txt
chore(frontend): add Tailwind CSS
feat(frontend): add backend healthcheck
chore(backend): update TypeScript config
docs: update README setup instructions
```

## Current status

Implemented:

* frontend bootstrap with React, Vite and TypeScript
* Tailwind CSS setup
* backend bootstrap with Express and TypeScript
* backend `/health` endpoint
* frontend healthcheck call to the backend

Next steps:

* add PostgreSQL
* add Prisma
* create the first database models
* add backend database healthcheck
* prepare authentication and user management
* prepare WebSocket architecture for multiplayer games
