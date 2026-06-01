#!/usr/bin/env bash
# seed.sh — Load sample data into all running Campus Event Hub databases
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SQL="$SCRIPT_DIR/seed-data.sql"

seed_db() {
  local container="$1"
  local db="$2"
  echo "  Seeding $db via $container..."
  docker exec -i "$container" psql -U postgres -d "$db" -v ON_ERROR_STOP=1 \
    -c "\i /dev/stdin" < <(grep -A 9999 "\\\\c $db" "$SQL" | tail -n +2 | sed '/^\\\\c /Q')
}

echo "Seeding Campus Event Hub databases..."

seed_db venue-db        venue_db
seed_db event-db        event_db
seed_db registration-db registration_db
seed_db attendance-db   attendance_db
seed_db ticket-db       ticket_db
seed_db certificate-db  certificate_db
seed_db feedback-db     feedback_db
seed_db leaderboard-db  leaderboard_db
seed_db announcement-db announcement_db
seed_db notification-db notification_db
seed_db resource-db     resource_db
seed_db sponsor-db      sponsor_db

echo "Done. All databases seeded."
