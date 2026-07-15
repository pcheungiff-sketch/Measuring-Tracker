# Evening — Personal Happiness Tracker

A private daily check-in app. Log happiness, energy, and anxiety each evening, tag what you did, 
write a few notes. After a few weeks, it shows you what actually moves your wellbeing.

## Stack

- **Next.js 14** (App Router, server components, server actions)
- **Vercel Postgres** (data, no monthly fees on Vercel's hobby tier)
- **Resend** (email — magic link auth + daily reminders, free tier)
- **Recharts** (trend chart)
- No third-party auth service, no backend framework, no CMS

---

## Deploy in ~15 minutes

### 1. Fork or clone this repo

```bash
git clone <this-repo>
cd happiness-tracker
npm install
```

### 2. Create a Vercel project

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com), import the repo
3. Leave all build settings at defaults

### 3. Add Vercel Postgres

In your Vercel project dashboard:
- Storage → Create database → Postgres
- Click "Connect to project" — Vercel auto-injects all `POSTGRES_*` env vars

### 4. Set up Resend

1. Sign up at [resend.com](https://resend.com) — free tier is plenty
2. Add and verify your sending domain (or use their sandbox for testing)
3. Create an API key
4. In `app/api/auth/send-link/route.ts`, update the `from:` field to match your verified domain:
   ```
   from: 'Evening <noreply@yourdomain.com>'
   ```
5. Do the same in `app/api/reminder/route.ts`

### 5. Set environment variables in Vercel

In your Vercel project → Settings → Environment Variables, add:

| Variable | Value |
|---|---|
| `JWT_SECRET` | Any long random string (e.g. `openssl rand -hex 32` in terminal) |
| `RESEND_API_KEY` | From Resend dashboard |
| `NEXT_PUBLIC_BASE_URL` | Your Vercel URL, e.g. `https://evening.vercel.app` |
| `CRON_SECRET` | Any random string (keeps the cron endpoint private) |

The `POSTGRES_*` variables are already set by the Vercel Postgres step above.

### 6. Run database migrations

```bash
# In your project directory, with env vars set:
npm run db:migrate
```

Or run it once from the Vercel dashboard via a deployment hook, or just copy the SQL from 
`scripts/migrate.js` and run it in the Vercel Postgres query editor.

### 7. Deploy

Push to main. Vercel deploys automatically.

---

## Local development

```bash
# Pull env vars from Vercel
npx vercel env pull .env.local

# Run dev server
npm run dev
```

---

## Setting your reminder time

The reminder cron fires hourly. Users get an email at their `reminder_time`, stored in UTC in the 
`users` table. Default is `21:00` UTC (9pm UTC = 5pm Shanghai if you're on UTC+8).

To change your reminder time, run this SQL in Vercel's Postgres query editor:
```sql
UPDATE users SET reminder_time = '13:00' WHERE email = 'your@email.com';
-- 13:00 UTC = 21:00 China Standard Time
```

A settings UI is on the roadmap.

---

## Data model

```
users
  id, email, reminder_time, reminder_enabled, created_at

magic_links
  id, email, token, expires_at, used, created_at

entries
  id, user_id, date, happiness, energy, anxiety, journal, created_at

entry_activities
  id, entry_id, activity_id, category
```

---

## Adding or changing activity categories

Edit `lib/types.ts` → `ACTIVITY_CATEGORIES`. Each category has a color, and each item has 
an id (used for DB storage), a label, and an emoji. The id is permanent — don't change it 
after you've logged data against it, or those logs lose their label.

---

## Export

Hit `/api/export` (or click "Export CSV" in History) to download a CSV of all your entries 
with dates, scores, activity lists, and journal text. Import directly into Excel, Numbers, 
or any data tool.
