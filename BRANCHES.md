# 🌿 Branch Guide — Sturdy Waddle PM

This document describes every branch in the repository: what it contains, its status, and when you should look at it.

---

## Quick Reference

| Branch | Status | Purpose |
|--------|--------|---------|
| [`main`](#main--stable--production) | 🟢 **Stable / Production** | Full reviewed codebase — start here |
| [`copilot/sturdy-waddle-pm-expansion`](#copilotstrurdy-waddle-pm-expansion) | 🔵 Merged → main | Phase 1–3 feature expansion |
| [`copilot/plan-design-project-management-platform`](#copilotplan-design-project-management-platform) | 🏛️ Archive | Initial scaffold & architecture design |
| [`copilot/edit-readme-guide`](#copilotedit-readme-guide) | 🔵 Merged → main | Early README and branch navigation docs |

---

## `main` — Stable / Production

🟢 **This is the branch to clone and run.**

`main` is the default branch and represents the latest stable, production-ready state of Sturdy Waddle PM. All reviewed and merged work lands here. Security patches are applied directly to this branch.

**What's here:**
- Full Turborepo monorepo (apps, packages, services, infra)
- Next.js 15 web app + Hono REST API
- Drizzle ORM schema, auth, AI copilot SDK, knowledge graph client, event bus
- 7 microservice stubs (ai-copilot, analytics, integrations, notifications, realtime, search, work-management)
- Kubernetes manifests, Terraform, Docker configurations
- GitHub Actions CI/CD pipeline

**Getting started:**
```bash
git clone https://github.com/arcboundlogic/sturdy-waddle-PM.git
cd sturdy-waddle-PM
cp .env.example .env.local
docker compose up -d
npm install
npm run db:migrate
npm run dev
```

---

## `copilot/sturdy-waddle-pm-expansion`

🔵 **Merged into `main`.** Kept for reference.

This branch delivered the full Phase 1–3 platform expansion on top of the initial scaffold. It is where the bulk of the codebase was built out.

**What was added:**
- Phase 1 — Core services and API routes (workspaces, projects, work items, sprints, labels, comments, activity)
- Phase 2 — Real-time service (WebSocket), search service, notification adapters (email, Slack, in-app), integration service (GitHub)
- Phase 3 — Analytics service, AI copilot service, Kubernetes manifests, Terraform modules
- Security patches: nodemailer CVE fix, drizzle-orm SQL injection patch

**When to look here:** If you want to see the full diff of the expansion work, or trace how a particular feature was introduced.

---

## `copilot/plan-design-project-management-platform`

🏛️ **Archive — initial scaffold.**

This is where the project was first designed and built. It contains the initial monorepo scaffold, package structure, database schema, and Hono API skeleton. It predates the full expansion.

**What's here:**
- First-pass Turborepo setup with npm workspaces
- Base package stubs (`@waddle/ui`, `@waddle/db`, `@waddle/auth`, `@waddle/types`, etc.)
- Initial Drizzle schema (users, workspaces, projects, work items)
- Basic Hono API routes and health checks
- CI workflow and Docker Compose for local dev

**When to look here:** If you want to understand the original architectural decisions and project structure before expansion, or use it as a reference for a minimal starting point.

---

## `copilot/edit-readme-guide`

🔵 **Merged into `main`.** Kept for reference.

A short-lived documentation branch that rewrote the README to include branch navigation and a project guide. Its changes have since been superseded by this comprehensive branch documentation.

**When to look here:** Rarely. The changes from this branch are already part of `main`.

---

## Development Workflow

```
copilot/plan-design-project-management-platform  ← initial scaffold
         │
         ▼
copilot/sturdy-waddle-pm-expansion               ← Phase 1–3 feature work
         │
         ▼
       main                                       ← stable production ✅
```

New feature branches should be cut from `main` and merged back via pull request after review.

---

*For project setup and full documentation, see [README.md](README.md).*
