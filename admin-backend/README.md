# Admin Backend — Enterprise CRM

Laravel 11 REST API for the Admin panel of the Enterprise CRM.

## Overview

This application handles all **admin-facing** operations:
- Admin authentication (Sanctum tokens)
- User management
- Organization management
- Roles & Permissions (spatie/laravel-permission)
- Audit logs
- System settings
- Platform reporting

**This application must NEVER be called by `customer-frontend`.**

## Architecture

```
app/
├── Domain/           # Pure business entities & repository interfaces
├── Application/      # Use cases, commands, queries, DTOs
├── Infrastructure/   # Eloquent models, repository implementations
├── Http/             # Controllers, Form Requests, Resources, Middleware
└── Shared/           # Traits, exceptions, base classes
```

## API Prefix

All routes: `/api/v1/admin/*`

## Setup

```bash
# Install dependencies
composer install

# Copy environment
cp .env.example .env
php artisan key:generate

# Configure database in .env (PostgreSQL: crm_admin)

# Run migrations
php artisan migrate

# Seed initial data (super admin + roles + permissions)
php artisan db:seed

# Serve
php artisan serve --port=8001
```

## API Documentation

After seeding, visit: http://localhost:8001/api/documentation

## Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@crm.example.com | Admin@12345 |
| Admin | admin@crm.example.com | Admin@12345 |

> ⚠️ Change these immediately in production!

## Testing

```bash
php artisan test
```

## Docker

```bash
docker build -t crm-admin-backend .
docker run -p 8001:8001 --env-file .env crm-admin-backend
```

## Dependencies

| Package | Purpose |
|---------|---------|
| laravel/sanctum | API token authentication |
| spatie/laravel-permission | Role & permission management |
| darkaonline/l5-swagger | OpenAPI documentation |
| sentry/sentry-laravel | Error monitoring |
| predis/predis | Redis client |
