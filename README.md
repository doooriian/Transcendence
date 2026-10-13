# ft_transcendence

## Chess bot (Stockfish)

On the chess page, choose Easy, Medium or Hard and click **Play against bot**.
The human plays white; Stockfish plays black. Difficulty is fixed when the game
is created. These levels use Stockfish Skill Level 0, 8 and 20 respectively,
with bounded thinking times; they do not represent calibrated Elo ratings.

Stockfish runs locally in the backend container. The backend image now uses
Debian and installs the distribution's Stockfish package. Rebuild with `make`
or `make dev` after pulling this change. No database reset is needed.
For a backend running outside Docker, install Stockfish and set `STOCKFISH_PATH`
to its executable path if it is not available as `stockfish` on PATH.

The backend asks Stockfish to choose a move through UCI, then validates that
move with the existing chess.js engine. Searches have a timeout and are cancelled
when the game ends. If the engine is unavailable or busy, use **Retry bot turn**
or resign. Existing multiplayer games continue to use the same events.
Games remain in memory and do not survive a backend restart.

Run backend checks with `cd backend && npm test`.
Stockfish source and license: https://stockfishchess.org/ and
https://github.com/official-stockfish/Stockfish (GPLv3).

A full-stack multiplayer gaming platform developed as part of the **42 curriculum**.

The project brings together a modern React frontend, an Express API,
PostgreSQL persistence and a fully Dockerized development environment.

---

## ✨ Features

* User registration and login
* JWT-based authentication
* User profiles
* Frontend navigation
* Persistent PostgreSQL database
* Frontend and backend hot reload
* Dockerized development environment

More social and multiplayer features will be added as the project evolves.


## 🛠️ Tech Stack

| Frontend     | Backend      | Database   | Tools          |
| ------------ | ------------ | ---------- | -------------- |
| React        | Node.js      | PostgreSQL | Docker         |
| TypeScript   | Express      | Prisma     | Docker Compose |
| Vite         | JavaScript   |            | Makefile       |
| Tailwind CSS | JWT / Argon2 |            |                |


## 🏗️ Architecture

```text
        ┌──────────────────┐
        │     Frontend     │
        │   React + Vite   │
        │      :5173       │
        └────────┬─────────┘
                 │
                 │ HTTP
                 ▼
        ┌──────────────────┐
        │     Backend      │
        │ Node.js + Express│
        │      :3000       │
        └────────┬─────────┘
                 │
                 │ Prisma
                 ▼
        ┌──────────────────┐
        │    PostgreSQL    │
        │      :5432       │
        └──────────────────┘
```

The application is split into three Docker services:

* **frontend** — user interface
* **backend** — API and application logic
* **db** — persistent PostgreSQL database


## 📁 Project Structure

```text
Transcendence/
├── backend/
│   ├── prisma/               # Database schema and migrations
│   ├── src/                  # Backend application source code
│   └── Dockerfile
│
├── frontend/
│   ├── src/                  # React application source code
│   └── Dockerfile
│
├── docker-compose.yaml       # Main Docker environment
├── docker-compose.dev.yaml   # Development and hot reload overrides
├── Makefile                  # Project commands
├── .env.example              # Environment variables template
└── README.md
```


## 🚀 Getting Started

### Requirements

You only need:

* Docker
* Docker Compose
* Make

### Environment

Create your local environment file:

```bash
cp .env.example .env
```

Then update the values if needed.


## ▶️ Run the Project

### Standard mode

```bash
make
```

The application will be available at:

```text
Frontend  → http://localhost:5173
Backend   → http://localhost:3000
```

### Development mode

```bash
make dev
```

Development mode enables hot reload for both the frontend and backend.

Changes to React files are immediately reflected by Vite, while backend changes automatically restart the Node.js server.

No Docker rebuild is required after each source code modification.


## 🔧 Makefile Commands

The project provides shortcuts for the most common Docker operations:

```bash
make               # Build and start the project
make up            # Same as make
make dev           # Start the development environment with hot reload

make build         # Build Docker images
make start         # Start existing stopped containers
make stop          # Stop containers without removing them
make restart       # Recreate and restart the standard environment
make down          # Stop and remove containers

make ps            # Show container status

make logs          # Follow logs from all services
make logs-frontend # Follow frontend logs
make logs-backend  # Follow backend logs
make logs-db       # Follow PostgreSQL logs

make db            # Start PostgreSQL only

make clean         # Remove containers and orphan containers
make fclean        # Remove containers, images, volumes and database data
make re            # Full clean rebuild
```



## 🔐 Authentication

Authentication is handled by the backend using **JWT**.

Passwords are never stored directly in the database and are hashed using **Argon2**.

The authentication system supports two entry points:

```text
Register ──┐
           ├──> JWT token ──> Authenticated session ──> User profile
Login ─────┘
```


Protected API routes require:

```text
Authorization: Bearer <token>
```

## 🗄️ Database

The project uses **PostgreSQL** with **Prisma ORM**.

Database changes are versioned through Prisma migrations and are automatically applied when the backend starts.

The PostgreSQL data is persisted in a Docker volume and therefore survives normal container restarts.


## 🌿 Git Workflow

Development is done from the `dev` branch.

```text
main
 └── stable milestones

dev
 └── integration branch

feature / fix / chore / docs branches
 └── individual tasks
```

Typical workflow:

```bash
git checkout dev
git pull
git checkout -b feature/my-feature
```

Once the task is ready, a Pull Request is opened into `dev`.

Stable versions of `dev` are then merged into `main`.


## 🎮 What's Next

The current foundation provides authentication, profiles, frontend navigation, database persistence and the development environment required for the rest of the project.

Next development phases will focus on the multiplayer and social aspects of the platform.
