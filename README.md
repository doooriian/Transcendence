<div align="center">

<a href="https://42.fr/"><img src="https://raw.githubusercontent.com/doooriian/42-Badges/main/badges/ft_transcendencem.png" alt="Transcendence 42 badge" width="125" /></a>

# ft_transcendence

**42 School project · Real-time multiplayer chess**

<img src="https://img.shields.io/badge/42_Project-Full--stack%20%7C%20Real--time-2563EB?style=flat-square" alt="Transcendence technology" />
<img src="https://img.shields.io/badge/Documentation-Project_Overview-334155?style=flat-square" alt="Project documentation" />

</div>

An online chess platform built around authenticated accounts, real-time interactions and a containerized web infrastructure.

## 🔎 Overview

This application brings together several backend engineering challenges: account security, persistent relational data, live messaging, multiplayer synchronization, reconnection handling and HTTPS deployment.

It was developed as a **four-person 42 project**. The chess rules and game engine, frontend experience, backend services and visual design were implemented collaboratively by different team members.

## ✨ Features

- Registration, login and profile management using JWT and Argon2
- Friends, requests and online presence
- Real-time chat and chess matches using Socket.IO
- Multiplayer session and reconnection handling
- Chess rules powered by `chess.js` and an AI opponent using Stockfish
- Responsive React frontend and HTTPS reverse proxy

## 🧩 Technical approach

```text
                   HTTPS / WSS
                       |
                     Caddy
                    /     \
             React UI   Express + Socket.IO
                              |
                            Prisma
                              |
                          PostgreSQL
```

| Layer | Technologies |
| --- | --- |
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| Backend | Node.js, Express, JavaScript, Socket.IO |
| Auth | JWT, Argon2 |
| Database | PostgreSQL, Prisma ORM |
| Chess | chess.js, Stockfish |
| Infrastructure | Docker Compose, Caddy, Make |

PostgreSQL persists users, profiles and social relationships. Active games and chat messages are held in backend memory rather than being stored as history.

## 🚀 Build and usage

**Requirements:** Docker, Docker Compose, Make and a recent browser.

```bash
git clone https://github.com/doooriian/Transcendence.git
cd Transcendence
cp .env.example .env
```

Edit `.env` and replace placeholder values such as `JWT_SECRET` and `POSTGRES_PASSWORD` with suitable local secrets.

```bash
make          # build and run
make ps       # status
make logs     # all service logs
make down     # stop without deleting persistent volumes
```

Open **https://localhost:8443** by default. Caddy uses a local certificate authority, so the browser may require local certificate trust or acceptance.

`make fclean` removes application images and persistent Docker volumes, including database data.

## 🧪 Verification

The project was tested manually as a team through user registration, authentication, friends, chat, local and remote chess games, connection loss and recovery, AI games and browser compatibility.

The repository currently has **no automated CI test suite**. The frontend provides `npm run lint` and `npm run build` scripts, which can be used for local checks.

## 👥 Team and contributions

| Member | Primary contribution |
| --- | --- |
| **Dorian · `doley`** | Backend, API, PostgreSQL/Prisma, authentication, Socket.IO integration, Docker and Caddy |
| **Yacine · `yel-mens`** | React frontend, state and integration of backend and real-time features |
| **Ayoube · `amairia`** | Chess engine, rules, game state and Stockfish AI |
| **Alexandre · `alexfuen`** | UI design, visual identity, CSS and chess interface |

My primary responsibility was building and integrating the backend and infrastructure. I **did not implement the chess engine itself**: my work included integrating its functionality with the backend and multiplayer systems.

The team used feature branches, pull requests and a shared `dev` integration branch.

## ⚠️ Notes and limitations

- Active chess games are lost when the backend restarts
- Chat history and match history are not persisted
- Local HTTPS certificate trust may require manual configuration
- The implementation is a 42 learning project rather than a production-operated service

## 📚 Further documentation

[Detailed project documentation](docs/PROJECT_DETAILS.md) includes the original architecture breakdown, database models, 42 module mapping, individual contribution details, testing notes, references and AI usage disclosure.

## 📚 Resources and AI usage

Documentation and technical references include [React](https://react.dev/), [Express](https://expressjs.com/), [Socket.IO](https://socket.io/docs/v4/), [Prisma](https://www.prisma.io/docs), [Docker](https://docs.docker.com/) and [Caddy](https://caddyserver.com/docs/).

AI tools were used as supplementary resources for research, troubleshooting, edge-case review and documentation. The team remained responsible for implementation and validation; see the detailed documentation for context.

---

<div align="center">

<sub>Part of the <a href="https://42.fr/">42 curriculum</a> · <a href="https://github.com/doooriian">Back to my GitHub profile</a></sub>

</div>
