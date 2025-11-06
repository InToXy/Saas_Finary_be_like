#!/bin/sh
set -e

echo "🚀 Starting backend initialization..."

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL..."
until npx prisma db push --skip-generate 2>/dev/null || [ $? -eq 1 ]; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done

echo "✅ PostgreSQL is ready!"

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
npx prisma generate

# Push schema to database (for development)
echo "🔄 Pushing database schema..."
npx prisma db push --accept-data-loss

# Optional: Seed database if seed script exists
if [ -f "prisma/seed.ts" ]; then
  echo "🌱 Seeding database..."
  npm run prisma:seed || echo "⚠️  Seeding failed or not configured"
fi

echo "✨ Backend initialization complete!"

# Start the application
echo "🎯 Starting development server..."
exec npm run start:dev
