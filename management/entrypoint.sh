#!/bin/sh
set -e

# Wait for Postgres to be ready
if [ -n "$POSTGRES_HOST" ]; then
  echo "Waiting for postgres at $POSTGRES_HOST:$POSTGRES_PORT..."
  until pg_isready -h "$POSTGRES_HOST" -p "${POSTGRES_PORT:-5432}" -U "${POSTGRES_USER:-postgres}"; do
    >&2 echo "Postgres is unavailable - sleeping"
    sleep 1
  done
fi

# Run migrations
echo "Running migrations..."
python manage.py migrate --noinput


# If first arg looks like 'bash' or a command (for debugging), exec it
if [ "${1#-}" != "$1" ]; then
  # if first arg starts with '-', append CMD
  set -- "$@" "$@"
fi

exec "$@"