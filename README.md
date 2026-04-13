# 🐧 Sturdy Waddle PM

> **The PM platform that understands your work.**

AI-native, context-aware project management built for technical and creative product teams. Knowledge graphs, living documentation, and an AI copilot — from solo projects to enterprise scale.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 📌 Repository Overview

This repository uses a **branch-based development model**. The `main` branch serves as the project's landing page and guide, while feature work and the full codebase live on dedicated branches.

### Branches

| Branch | Purpose | Link |
|--------|---------|------|
| [`main`](https://github.com/arcboundlogic/sturdy-waddle-PM/tree/main) | Project guide and README (you are here) | — |
| [`copilot/plan-design-project-management-platform`](https://github.com/arcboundlogic/sturdy-waddle-PM/tree/copilot/plan-design-project-management-platform) | **Full codebase** — monorepo with apps, packages, services, and infrastructure | [Browse →](https://github.com/arcboundlogic/sturdy-waddle-PM/tree/copilot/plan-design-project-management-platform) |

> **Getting started?** Switch to the [`copilot/plan-design-project-management-platform`](https://github.com/arcboundlogic/sturdy-waddle-PM/tree/copilot/plan-design-project-management-platform) branch for the source code and development setup.

---

## ✨ Key Features

- **🧠 Knowledge Graph** — Every task, decision, and artifact connected in a queryable graph
- **🤖 AI Copilot ("Waddle AI")** — Draft plans, predict risks, generate reports, and answer "why?" questions
- **⚡ Developer Native** — Git integration, CI/CD awareness, CLI tool, and API-first design
- **📊 Real-Time Dashboards** — Burndown, velocity, cycle time, and live analytics
- **🔒 Enterprise Ready** — SSO, SCIM, audit logs, data residency, and compliance modules
- **🔄 Flexible Workflows** — Kanban, Gantt, table, calendar, and graph views

---

## 🏗️ Architecture

The platform is structured as a **Turborepo monorepo** with npm workspaces:

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
├── services/         → Microservice extractions
│   ├── ai-copilot/   → AI copilot service
│   ├── analytics/    → Analytics & reporting
│   ├── integrations/ → Third-party integrations
│   ├── notifications/→ Notification delivery
│   ├── realtime/     → WebSocket & real-time updates
│   ├── search/       → Full-text & semantic search
│   └── work-management/ → Core work-item engine
├── infra/
│   ├── terraform/    → AWS infrastructure as code
│   ├── k8s/          → Kubernetes manifests
│   └── docker/       → Dockerfiles
└── docker-compose.yml → Local development services
```

---

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

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 20.0.0
- **npm** ≥ 10.0.0
- **Docker** & Docker Compose (for local databases)

### Quick Start

```bash
# 1. Clone the repository and switch to the codebase branch
git clone https://github.com/arcboundlogic/sturdy-waddle-PM.git
cd sturdy-waddle-PM
git checkout copilot/plan-design-project-management-platform

# 2. Copy environment variables
cp .env.example .env.local

# 3. Start infrastructure services (PostgreSQL, Redis, MinIO)
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
| `npm run db:studio` | Open Drizzle Studio (database GUI) |

> **Tip:** Build a specific package with `npx turbo run build --filter=@waddle/api`.

---

## 📐 API Endpoints

All API routes are served under `/api/v1/`.

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/health` | Health check |
| `GET` | `/api/v1/health/ready` | Readiness probe |
| `GET` | `/api/v1/health/live` | Liveness probe |

### Workspaces

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/workspaces` | List workspaces |
| `POST` | `/api/v1/workspaces` | Create workspace |
| `GET` | `/api/v1/workspaces/:id` | Get workspace |
| `PATCH` | `/api/v1/workspaces/:id` | Update workspace |
| `DELETE` | `/api/v1/workspaces/:id` | Delete workspace |

### Projects

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/projects` | List projects |
| `POST` | `/api/v1/projects` | Create project |
| `GET` | `/api/v1/projects/:id` | Get project |
| `PATCH` | `/api/v1/projects/:id` | Update project |
| `DELETE` | `/api/v1/projects/:id` | Delete project |

### Work Items

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/work-items` | List work items (with filtering) |
| `POST` | `/api/v1/work-items` | Create work item |
| `GET` | `/api/v1/work-items/:id` | Get work item |
| `PATCH` | `/api/v1/work-items/:id` | Update work item |
| `DELETE` | `/api/v1/work-items/:id` | Delete work item |

---

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

---

## 🎯 Scaling Strategy

| Phase | Users | Architecture |
|-------|-------|-------------|
| Phase 1 | 0 – 1K | Modular monolith, single PostgreSQL |
| Phase 2 | 1K – 50K | Extract high-load services, add Kafka & read replicas |
| Phase 3 | 50K+ | Full microservices, multi-region, dedicated enterprise infra |

---

## 🔒 Security

- **Authentication:** OAuth 2.0 / OIDC, SAML SSO, MFA (TOTP + WebAuthn)
- **Authorization:** RBAC (Owner, Admin, Member, Guest) + ABAC for enterprise
- **Encryption:** TLS 1.3 in transit, AES-256 at rest
- **Tenant Isolation:** PostgreSQL RLS, application middleware, dedicated DB option
- **Audit:** Append-only, hash-chained audit log

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch from `copilot/plan-design-project-management-platform`
3. Make your changes and add tests
4. Run `npm run lint && npm run test && npm run typecheck`
5. Open a pull request targeting the appropriate branch

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

*Built with ❤️ for teams that build.*
