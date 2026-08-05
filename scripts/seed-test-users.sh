#!/usr/bin/env bash
# Idempotent local admin account seeding for the Supabase Auth service.
#
# supabase/seed.sql cannot create auth.users rows (Supabase Auth owns that
# table and its password hashing), so every `supabase db reset` wipes all
# accounts. Run this script afterward to restore the local admin test
# account. Safe to re-run any time - an existing account is left untouched.
#
# Usage: ./scripts/seed-test-users.sh
# Requires: local Supabase running (`supabase start`), curl, jq, and either
# a local `psql` or Docker (it falls back to `docker exec` into the
# Supabase Postgres container when `psql` isn't installed on the host).

set -euo pipefail

# Fixed values for local Supabase (from supabase/config.toml), stable across resets.
API_URL="http://127.0.0.1:54321"
PUBLISHABLE_KEY="sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH"
DB_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"
PASSWORD="testpass123"

if ! command -v jq >/dev/null 2>&1; then
  echo "This script requires jq. Install with: brew install jq" >&2
  exit 1
fi

# run_sql: reads a SQL script on stdin, runs it against local Supabase Postgres.
# Prefers a local `psql`; falls back to `docker exec` into the Supabase DB
# container (matched by name) if `psql` isn't installed on the host.
run_sql() {
  if command -v psql >/dev/null 2>&1; then
    psql "$DB_URL" -v ON_ERROR_STOP=1 -tA "$@"
  else
    local container
    container=$(docker ps --filter "name=supabase_db" --format "{{.Names}}" | head -n1)
    if [ -z "$container" ]; then
      echo "No local 'psql' found and no supabase_db_* Docker container running." >&2
      echo "Install psql, or run 'supabase start' first." >&2
      exit 1
    fi
    docker exec -i "$container" psql -U postgres -d postgres -v ON_ERROR_STOP=1 -tA "$@"
  fi
}

if ! echo "select 1;" | run_sql >/dev/null 2>&1; then
  echo "Cannot reach local Supabase Postgres. Run 'supabase start' first." >&2
  exit 1
fi

# signup_or_get EMAIL FIRST LAST
# Prints the user id on stdout. Creates the account if missing; if it
# already exists, looks up its id instead of failing.
signup_or_get() {
  local email="$1" first="$2" last="$3"
  local resp user_id

  resp=$(curl -s -X POST "$API_URL/auth/v1/signup" \
    -H "apikey: $PUBLISHABLE_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$email\",\"password\":\"$PASSWORD\",\"data\":{\"first_name\":\"$first\",\"last_name\":\"$last\"}}")

  user_id=$(echo "$resp" | jq -r '.user.id // empty')

  if [ -z "$user_id" ]; then
    user_id=$(echo "select id from auth.users where email = '$email';" | run_sql)
  fi

  if [ -z "$user_id" ]; then
    echo "Failed to create or find user $email:" >&2
    echo "$resp" >&2
    exit 1
  fi

  echo "$user_id"
}

echo "Seeding local admin test account (password: $PASSWORD)..."

ADMIN=$(signup_or_get check-select@test.local Check Select)

run_sql <<SQL
update public.profiles set role = 'admin' where id = '$ADMIN';
SQL

cat <<EOF

Done. Admin test account (password: $PASSWORD):

  check-select@test.local   admin

Re-run this script any time after 'supabase db reset' to restore this account.
EOF
