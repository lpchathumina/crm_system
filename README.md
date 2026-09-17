# Enterprise CRM — Monorepo

A production-grade enterprise CRM built as **four completely separate applications**, each independently deployable with its own CI/CD pipeline.

```
crm/
├── admin-backend/       Laravel 11 API — Admin management
├── admin-frontend/      Next.js 15 — Admin panel UI
├── customer-backend/    Laravel 11 API — CRM functionality
└── customer-frontend/   Next.js 15 — Customer CRM UI
```

---

## Architecture

```
                         INTERNET
                             │
             ┌───────────────┴───────────────┐
             │                               │
             ▼                               ▼
    ┌─────────────────┐             ┌─────────────────┐
    │ admin-frontend  │             │customer-frontend│
    │    Next.js      │             │    Next.js      │
    └────────┬────────┘             └────────┬────────┘
             │                               │
             ▼                               ▼
    ┌─────────────────┐             ┌─────────────────┐
    │ admin-backend   │             │customer-backend │
    │    Laravel      │             │    Laravel      │
    └────────┬────────┘             └────────┬────────┘
             │                               │
             └───────────────┬───────────────┘
                             │
                  ┌──────────┴──────────┐
                  │                     │
                  ▼                     ▼
             PostgreSQL               Redis
```

### Strict Boundaries

| ✅ Allowed | ❌ Never Allowed |
|-----------|----------------|
| `admin-frontend` → `admin-backend` | `admin-frontend` → `customer-backend` |
| `customer-frontend` → `customer-backend` | `customer-frontend` → `admin-backend` |

---

## Applications

| App | Port (dev) | Tech | Docs |
|-----|-----------|------|------|
| admin-backend | 8001 | Laravel 11, PHP 8.4 | [README](./admin-backend/README.md) |
| admin-frontend | 3001 | Next.js 15, TypeScript | [README](./admin-frontend/README.md) |
| customer-backend | 8002 | Laravel 11, PHP 8.4 | [README](./customer-backend/README.md) |
| customer-frontend | 3002 | Next.js 15, TypeScript | [README](./customer-frontend/README.md) |

---

## Quick Start (Docker Compose)

```bash
# Copy environment files
cp admin-backend/.env.example admin-backend/.env
cp customer-backend/.env.example customer-backend/.env
cp admin-frontend/.env.example admin-frontend/.env.local
cp customer-frontend/.env.example customer-frontend/.env.local

# Start all services
docker compose up -d

# Run migrations
docker compose exec admin-backend php artisan migrate --seed
docker compose exec customer-backend php artisan migrate --seed
```

### Access

| Service | URL |
|---------|-----|
| Admin Panel | http://localhost:3001 |
| Customer CRM | http://localhost:3002 |
| Admin API | http://localhost:8001/api/v1/admin |
| Customer API | http://localhost:8002/api/v1/customer |
| Admin API Docs | http://localhost:8001/api/documentation |
| Customer API Docs | http://localhost:8002/api/documentation |

---

## Development (Individual Apps)

```bash
# admin-backend
cd admin-backend && composer install && php artisan serve --port=8001

# customer-backend
cd customer-backend && composer install && php artisan serve --port=8002

# admin-frontend
cd admin-frontend && npm install && npm run dev -- --port 3001

# customer-frontend
cd customer-frontend && npm install && npm run dev -- --port 3002
```

---

## Infrastructure

- **PostgreSQL**: Two databases — `crm_admin` (admin-backend) and `crm_customer` (customer-backend)
- **Redis**: Shared instance, namespaced by application prefix
- **Queue Workers**: Laravel Horizon — `admin-worker` and `customer-worker`
- **Schedulers**: Separate scheduler containers per backend

---

## CI/CD

Four independent GitHub Actions pipelines:

| Pipeline | Trigger |
|----------|---------|
| Admin Backend CI | Push to `admin-backend/**` |
| Customer Backend CI | Push to `customer-backend/**` |
| Admin Frontend CI | Push to `admin-frontend/**` |
| Customer Frontend CI | Push to `customer-frontend/**` |

Each pipeline runs: **Lint → Tests → Build → Docker → Deploy**

---

## License

Private — All rights reserved.
