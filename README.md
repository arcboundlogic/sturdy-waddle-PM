# 🐧 Sturdy Waddle PM

> **The PM platform that understands your work.**

AI-native, context-aware project management built for technical and creative product teams. Knowledge graphs, living documentation, and an AI copilot — from solo projects to enterprise scale.

[![CI](https://github.com/arcboundlogic/sturdy-waddle-PM/actions/workflows/ci.yml/badge.svg)](https://github.com/arcboundlogic/sturdy-waddle-PM/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Branch: main (stable)](https://img.shields.io/badge/branch-main%20%E2%80%94%20stable%20%2F%20production-brightgreen)](https://github.com/arcboundlogic/sturdy-waddle-PM/tree/main)

---

## 🌿 Branch Guide

> **You are on `main` — the stable, production-ready branch.** This branch contains the full, reviewed codebase and is the recommended starting point for contributors and users.

For a detailed breakdown of every branch, see [**BRANCHES.md**](BRANCHES.md).

| Branch | Status | Description |
|--------|--------|-------------|
| [`main`](https://github.com/arcboundlogic/sturdy-waddle-PM/tree/main) | 🟢 **Stable / Production** | Full codebase — start here |
| [`copilot/sturdy-waddle-pm-expansion`](https://github.com/arcboundlogic/sturdy-waddle-PM/tree/copilot/sturdy-waddle-pm-expansion) | 🔵 Merged → main | Phase 1–3 feature expansion (services, auth, AI, infra) |
| [`copilot/plan-design-project-management-platform`](https://github.com/arcboundlogic/sturdy-waddle-PM/tree/copilot/plan-design-project-management-platform) | 🏛️ Archive | Initial scaffold & architecture design |
| [`copilot/edit-readme-guide`](https://github.com/arcboundlogic/sturdy-waddle-PM/tree/copilot/edit-readme-guide) | 🔵 Merged → main | Early README and branch navigation docs |

---

## ✨ Key Features

- **🧠 Knowledge Graph** — Every task, decision, and artifact connected in a queryable graph
- **🤖 AI Copilot ("Waddle AI")** — Draft plans, predict risks, generate reports, and answer "why?" questions
- **⚡ Developer Native** — Git integration, CI/CD awareness, CLI tool, and API-first design
- **📊 Real-Time Dashboards** — Burndown, velocity, cycle time, and live analytics
- **🔒 Enterprise Ready** — SSO, SCIM, audit logs, data residency, and compliance modules
- **🔄 Flexible Workflows** — Kanban, Gantt, table, calendar, and graph views

## 🏗️ Architecture

```
sturdy-waddle-PM/
├── apps/
│   ├── web/          → Next.js 15 frontend (React 19, Tailwind CSS)
│   ├── api/          → Hono REST API (Node.js, TypeScript)
│   └── docs/         → Documentation site
├── packages/
│   ├── ui/           → Shared design system (Radix UI + Tailwind)
│   ├── db/           → Database schema & ORM (Drizzle + PostgreSQL)
│   ├── auth/         → Authentication & RBAC/ABAC engine
│   ├── types/        → Shared TypeScript type definitions
│   ├── config/       → Environment validation (Zod)
│   ├── utils/        → Shared utilities
│   ├── ai/           → AI copilot SDK & prompt library
│   ├── graph/        → Knowledge graph client
│   └── events/       → Event bus (Kafka) client
├── services/         → Future microservice extractions
├── infra/
│   ├── terraform/    → AWS infrastructure as code
│   ├── k8s/          → Kubernetes manifests
│   └── docker/       → Dockerfiles
└── docker-compose.yml → Local development services
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 20.0.0
- **npm** ≥ 10.0.0
- **Docker** & Docker Compose (for local databases)

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/arcboundlogic/sturdy-waddle-PM.git
cd sturdy-waddle-PM

# 2. Copy environment variables
cp .env.example .env.local

# 3. Start infrastructure services
docker compose up -d

# 4. Install dependencies
npm install

# 5. Run database migrations
npm run db:migrate

# 6. Start development servers
npm run dev
```

The web app will be available at `http://localhost:3000` and the API at `http://localhost:4000`.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start all apps in development mode |
| `npm run build` | Build all packages and apps |
| `npm run test` | Run all tests |
| `npm run typecheck` | TypeScript type checking |
| `npm run lint` | Lint all packages |
| `npm run format` | Format code with Prettier |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate` | Run database migrations |
| `npm run db:studio` | Open Drizzle Studio |

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15, React 19, TypeScript, Tailwind CSS |
| **UI Components** | Radix UI, class-variance-authority |
| **API** | Hono (REST), Node.js |
| **Database** | PostgreSQL 16 + Drizzle ORM |
| **Cache** | Redis |
| **File Storage** | S3-compatible (MinIO for local dev) |
| **Auth** | RBAC + ABAC permission engine |
| **AI** | OpenAI API + local embeddings |
| **Monorepo** | Turborepo + npm workspaces |
| **CI/CD** | GitHub Actions |
| **Infrastructure** | Docker, Kubernetes, Terraform |

## 📐 API Endpoints

### Health
- `GET /api/v1/health` — Health check
- `GET /api/v1/health/ready` — Readiness probe
- `GET /api/v1/health/live` — Liveness probe

### Workspaces
- `GET /api/v1/workspaces` — List workspaces
- `POST /api/v1/workspaces` — Create workspace
- `GET /api/v1/workspaces/:id` — Get workspace
- `PATCH /api/v1/workspaces/:id` — Update workspace
- `DELETE /api/v1/workspaces/:id` — Delete workspace

### Projects
- `GET /api/v1/projects` — List projects
- `POST /api/v1/projects` — Create project
- `GET /api/v1/projects/:id` — Get project
- `PATCH /api/v1/projects/:id` — Update project
- `DELETE /api/v1/projects/:id` — Delete project

### Work Items
- `GET /api/v1/work-items` — List work items (with filtering)
- `POST /api/v1/work-items` — Create work item
- `GET /api/v1/work-items/:id` — Get work item
- `PATCH /api/v1/work-items/:id` — Update work item
- `DELETE /api/v1/work-items/:id` — Delete work item

## 🗃️ Data Model

```
Workspace (tenant)
├── Members (users, roles, permissions)
├── Portfolios
│   └── Projects
│       ├── Workflows (status definitions & transitions)
│       ├── Work Items (tasks, stories, bugs, epics)
│       │   ├── Comments / Threads
│       │   ├── Attachments
│       │   ├── Relations (blocks, relates-to, parent-of)
│       │   └── Activity Log
│       ├── Sprints / Iterations
│       └── Labels / Tags
├── Integrations
├── Automations
└── Audit Log
```

## 🎯 Scaling Strategy

| Phase | Users | Architecture |
|-------|-------|-------------|
| Phase 1 | 0–1K | Modular monolith, single PostgreSQL |
| Phase 2 | 1K–50K | Extract high-load services, add Kafka & read replicas |
| Phase 3 | 50K+ | Full microservices, multi-region, dedicated enterprise infra |

## 🔒 Security

- **Authentication:** OAuth 2.0 / OIDC, SAML SSO, MFA (TOTP + WebAuthn)
- **Authorization:** RBAC (Owner, Admin, Member, Guest) + ABAC for enterprise
- **Encryption:** TLS 1.3 in transit, AES-256 at rest
- **Tenant Isolation:** PostgreSQL RLS, application middleware, dedicated DB option
- **Audit:** Append-only, hash-chained audit log

## 📄 License

[MIT](LICENSE)

---

*Built with ❤️ for teams that build.*
