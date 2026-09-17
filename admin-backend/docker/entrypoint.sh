#!/bin/sh
set -e

# Wait for PostgreSQL
until pg_isready -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USERNAME}"; do
    echo "Waiting for PostgreSQL..."
    sleep 2
done

# Run migrations
php artisan migrate --force

# Optimize
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Start supervisor (manages PHP-FPM, Nginx, Horizon, Scheduler)
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
