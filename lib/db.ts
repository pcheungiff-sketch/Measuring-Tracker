import { sql } from '@vercel/postgres'
import { Entry, InsightData, ALL_ACTIVITIES } from './types'

export async function getEntries(userId: number, limit = 90): Promise<Entry[]> {
  const entries = await sql`
    SELECT 
      e.id, e.user_id, e.date::text, e.happiness, e.energy, e.anxiety, e.journal,
      COALESCE(array_agg(ea.activity_id) FILTER (WHERE ea.activity_id IS NOT NULL), '{}') as activities
    FROM entries e
    LEFT JOIN entry_activities ea ON ea.entry_id = e.id
    WHERE e.user_id = ${userId}
    GROUP BY e.id
    ORDER BY e.date DESC
    LIMIT ${limit}
  `
  return entries.rows as Entry[]
}

export async function getEntryByDate(userId: number, date: string): Promise<Entry | null> {
  const result = await sql`
    SELECT 
      e.id, e.user_id, e.date::text, e.happiness, e.energy, e.anxiety, e.journal,
      COALESCE(array_agg(ea.activity_id) FILTER (WHERE ea.activity_id IS NOT NULL), '{}') as activities
    FROM entries e
    LEFT JOIN entry_activities ea ON ea.entry_id = e.id
    WHERE e.user_id = ${userId} AND e.date = ${date}
    GROUP BY e.id
  `
  return result.rows[0] as Entry || null
}

export async function upsertEntry(
  userId: number,
  date: string,
  happiness: number,
  energy: number,
  anxiety: number,
  journal: string,
  activities: string[]
): Promise<Entry> {
  // Upsert the entry
  const result = await sql`
    INSERT INTO entries (user_id, date, happiness, energy, anxiety, journal)
    VALUES (${userId}, ${date}, ${happiness}, ${energy}, ${anxiety}, ${journal})
    ON CONFLICT (user_id, date) DO UPDATE SET
      happiness = EXCLUDED.happiness,
      energy = EXCLUDED.energy,
      anxiety = EXCLUDED.anxiety,
      journal = EXCLUDED.journal
    RETURNING id
  `
  const entryId = result.rows[0].id

  // Replace activities
  await sql`DELETE FROM entry_activities WHERE entry_id = ${entryId}`
  
  for (const activityId of activities) {
    const activity = ALL_ACTIVITIES[activityId]
    if (activity) {
      await sql`
        INSERT INTO entry_activities (entry_id, activity_id, category)
        VALUES (${entryId}, ${activityId}, ${activity.category})
      `
    }
  }

  return getEntryByDate(userId, date) as Promise<Entry>
}

export async function computeInsights(userId: number): Promise<InsightData> {
  // Get last 90 days of entries with activities
  const entries = await getEntries(userId, 90)
  
  if (entries.length < 3) {
    return {
      boosters: [],
      drainers: [],
      trend: entries.map(e => ({
        date: e.date,
        happiness: e.happiness,
        energy: e.energy,
        anxiety: e.anxiety,
      })).reverse(),
      bestDayProfile: {
        topActivities: [],
        avgHappiness: 0,
        avgEnergy: 0,
        avgAnxiety: 0,
      },
    }
  }

  // Activity correlation
  const activityStats: Record<string, { sum: number; count: number; category: string }> = {}
  
  for (const entry of entries) {
    for (const actId of entry.activities) {
      if (!activityStats[actId]) {
        activityStats[actId] = { sum: 0, count: 0, category: ALL_ACTIVITIES[actId]?.category || 'unknown' }
      }
      activityStats[actId].sum += entry.happiness
      activityStats[actId].count += 1
    }
  }

  const activityAverages = Object.entries(activityStats)
    .filter(([, stats]) => stats.count >= 2) // minimum signal
    .map(([actId, stats]) => ({
      activity: actId,
      category: stats.category,
      avgHappiness: Math.round((stats.sum / stats.count) * 10) / 10,
      count: stats.count,
    }))
    .sort((a, b) => b.avgHappiness - a.avgHappiness)

  const overallAvg = entries.reduce((sum, e) => sum + e.happiness, 0) / entries.length

  const boosters = activityAverages
    .filter(a => a.avgHappiness > overallAvg)
    .slice(0, 8)

  const drainers = activityAverages
    .filter(a => a.avgHappiness <= overallAvg)
    .sort((a, b) => a.avgHappiness - b.avgHappiness)
    .slice(0, 8)

  // Trend (chronological)
  const trend = entries
    .slice(0, 30)
    .reverse()
    .map(e => ({
      date: e.date,
      happiness: e.happiness,
      energy: e.energy,
      anxiety: e.anxiety,
    }))

  // Best day profile: top quartile entries
  const sorted = [...entries].sort((a, b) => b.happiness - a.happiness)
  const topQ = sorted.slice(0, Math.max(1, Math.floor(sorted.length / 4)))
  const actCounts: Record<string, number> = {}
  for (const entry of topQ) {
    for (const act of entry.activities) {
      actCounts[act] = (actCounts[act] || 0) + 1
    }
  }
  const topActivities = Object.entries(actCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([id]) => id)

  const bestDayProfile = {
    topActivities,
    avgHappiness: Math.round(topQ.reduce((s, e) => s + e.happiness, 0) / topQ.length * 10) / 10,
    avgEnergy: Math.round(topQ.reduce((s, e) => s + e.energy, 0) / topQ.length * 10) / 10,
    avgAnxiety: Math.round(topQ.reduce((s, e) => s + e.anxiety, 0) / topQ.length * 10) / 10,
  }

  return { boosters, drainers, trend, bestDayProfile }
}

export async function exportToCsv(userId: number): Promise<string> {
  const entries = await getEntries(userId, 365)
  
  const header = 'date,happiness,energy,anxiety,activities,journal\n'
  const rows = entries.map(e => {
    const activities = e.activities.join(';')
    const journal = (e.journal || '').replace(/"/g, '""')
    return `${e.date},${e.happiness},${e.energy},${e.anxiety},"${activities}","${journal}"`
  }).join('\n')
  
  return header + rows
}
