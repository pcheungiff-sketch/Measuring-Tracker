// Run once: node scripts/migrate.js
// Requires POSTGRES_URL in your environment

const { sql } = require('@vercel/postgres')

async function migrate() {
  console.log('Running migrations...')

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      reminder_time TEXT DEFAULT '21:00',
      reminder_enabled BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS magic_links (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      used BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS entries (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      date DATE NOT NULL,
      happiness INTEGER NOT NULL CHECK (happiness BETWEEN 1 AND 10),
      energy INTEGER NOT NULL CHECK (energy BETWEEN 1 AND 10),
      anxiety INTEGER NOT NULL CHECK (anxiety BETWEEN 1 AND 10),
      journal TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, date)
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS entry_activities (
      id SERIAL PRIMARY KEY,
      entry_id INTEGER REFERENCES entries(id) ON DELETE CASCADE,
      activity_id TEXT NOT NULL,
      category TEXT NOT NULL
    )
  `

  await sql`
    CREATE INDEX IF NOT EXISTS idx_entries_user_date ON entries(user_id, date DESC)
  `

  await sql`
    CREATE INDEX IF NOT EXISTS idx_entry_activities_entry ON entry_activities(entry_id)
  `

  console.log('Migrations complete.')
  process.exit(0)
}

migrate().catch(err => {
  console.error('Migration failed:', err)
  process.exit(1)
})
