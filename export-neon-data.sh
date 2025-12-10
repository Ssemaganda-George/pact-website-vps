#!/bin/bash

# Export data from Neon database
# This script will create a SQL dump of your current database

NEON_URL="postgresql://neondb_owner:npg_aTqvez1r0bkA@ep-holy-sea-ahwpuzyd-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"

echo "🔄 Exporting data from Neon database..."

# Export schema and data
pg_dump "$NEON_URL" \
  --no-owner \
  --no-acl \
  --clean \
  --if-exists \
  -f neon-backup.sql

if [ $? -eq 0 ]; then
  echo "✅ Export successful! File saved as: neon-backup.sql"
  echo "📊 File size: $(du -h neon-backup.sql | cut -f1)"
else
  echo "❌ Export failed. Make sure pg_dump is installed:"
  echo "   brew install postgresql"
fi
