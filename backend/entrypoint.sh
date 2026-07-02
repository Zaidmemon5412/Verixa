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

# Start server
echo "Starting Django REST Framework Development Server..."
exec python manage.py runserver 0.0.0.0:8000
