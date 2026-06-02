#!/usr/bin/env sh
set -e

php artisan storage:link || true
php artisan migrate --force
php artisan db:seed --force
php artisan config:cache

exec php artisan serve --host 0.0.0.0 --port "${PORT:-10000}"
