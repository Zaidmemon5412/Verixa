#!/bin/sh

# Exit immediately if a command exits with a non-zero status
set -e

echo "Verifying database connection..."
# Wait for PostgreSQL database container to be ready
if [ "$DB_HOST" = "db" ]; then
    while ! nc -z db 5432; do
      echo "PostgreSQL is unavailable - sleeping..."
      sleep 1
    done
    echo "PostgreSQL is up and running!"
fi

# Apply database migrations
echo "Applying database migrations..."
python manage.py migrate --noinput

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput --clear || true

# Start server based on environment mode
if [ "$DJANGO_SETTINGS_MODULE" = "verixa_core.settings.production" ]; then
    echo "Starting Verixa Production WSGI Server (Gunicorn)..."
    exec gunicorn verixa_core.wsgi:application \
        --bind "0.0.0.0:${PORT:-8000}" \
        --workers "${GUNICORN_WORKERS:-2}" \
        --timeout 120 \
        --access-logfile - \
        --error-logfile -
else
    echo "Starting Django REST Framework Development Server..."
    exec python manage.py runserver "0.0.0.0:${PORT:-8000}"
fi
