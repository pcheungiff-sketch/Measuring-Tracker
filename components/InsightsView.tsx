'use client'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'
import type { InsightData } from '@/lib/types'
import { ALL_ACTIVITIES, ACTIVITY_CATEGORIES } from '@/lib/types'
import { format, parseISO } from 'date-fns'

interface Props { insights: InsightData }

const CAT_COLOR: Record<string, string> = Object.fromEntries(
  ACTIVITY_CATEGORIES.map(c => [c.id, c.color])
)

function ActivityBadge({ activityId, score }: { activityId: string; score: number }) {
  const act = ALL_ACTIVITIES[activityId]
  if (!act) return null
  const color = CAT_COLOR[act.category] || '#78716c'
  return (
    <div className="flex items-center justify-between py-2 border-b border-stone-800/50 last:border-0">
      <div className="flex items-center gap-2">
        <span className="text-base">{act.emoji}</span>
        <span className="text-sm text-stone-300">{act.label}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-16 h-1 bg-stone-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${(score / 10) * 100}%`, backgroundColor: color }}
          />
        </div>
        <span className="text-sm font-medium tabular-nums" style={{ color }}>
          {score.toFixed(1)}
        </span>
      </div>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-8 text-center">
      <p className="text-stone-600 text-sm">{message}</p>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }: Record<string, unknown>) => {
  if (!active || !payload || !(payload as unknown[]).length) return null
  const data = (payload as { dataKey: string; value: number; color: string }[])
  return (
    <div className="bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-stone-400 mb-1">{label as string}</p>
      {data.map(d => (
        <p key={d.dataKey} style={{ color: d.color }}>
          {d.dataKey}: {d.value}
        </p>
      ))}
    </div>
  )
}

export default function InsightsView({ insights }: Props) {
  const { boosters, drainers, trend, bestDayProfile } = insights
  const hasData = trend.length >= 3

  const chartData = trend.map(d => ({
    ...d,
    date: format(parseISO(d.date), 'MMM d'),
  }))

  if (!hasData) {
    return (
      <div className="py-12 text-center">
        <p className="text-stone-400 text-lg font-light mb-2">Not enough data yet</p>
        <p className="text-stone-600 text-sm">Log at least 3 days to see patterns emerge.</p>
        <a
          href="/log"
          className="inline-block mt-6 text-sm text-stone-400 border border-stone-700 px-4 py-2 rounded-lg hover:border-stone-500 hover:text-stone-200 transition-colors"
        >
          Log today
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      {/* Trend chart */}
      <section>
        <h2 className="text-xs text-stone-500 uppercase tracking-widest mb-5">30-day trend</h2>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#78716c' }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={[1, 10]}
                tick={{ fontSize: 11, fill: '#78716c' }}
                tickLine={false}
                axisLine={false}
                ticks={[1, 5, 10]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="happiness"
                stroke="#6366f1"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#6366f1' }}
              />
              <Line
                type="monotone"
                dataKey="energy"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#f59e0b' }}
              />
              <Line
                type="monotone"
                dataKey="anxiety"
                stroke="#ec4899"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#ec4899' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-5 mt-3">
          {[
            { label: 'Happiness', color: '#6366f1' },
            { label: 'Energy', color: '#f59e0b' },
            { label: 'Anxiety', color: '#ec4899' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 rounded" style={{ backgroundColor: l.color }} />
              <span className="text-xs text-stone-500">{l.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Boosters and Drainers side by side */}
      <section>
        <h2 className="text-xs text-stone-500 uppercase tracking-widest mb-5">What moves the needle</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-stone-900/60 border border-stone-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span className="text-xs text-stone-400 font-medium uppercase tracking-wider">Boosters</span>
            </div>
            {boosters.length === 0 ? (
              <EmptyState message="Keep logging to see what lifts you" />
            ) : (
              boosters.map(b => (
                <ActivityBadge key={b.activity} activityId={b.activity} score={b.avgHappiness} />
              ))
            )}
          </div>
          <div className="bg-stone-900/60 border border-stone-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <span className="text-xs text-stone-400 font-medium uppercase tracking-wider">Drainers</span>
            </div>
            {drainers.length === 0 ? (
              <EmptyState message="No drainers identified yet" />
            ) : (
              drainers.map(d => (
                <ActivityBadge key={d.activity} activityId={d.activity} score={d.avgHappiness} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Best day profile */}
      {bestDayProfile.topActivities.length > 0 && (
        <section>
          <h2 className="text-xs text-stone-500 uppercase tracking-widest mb-5">Your best-day formula</h2>
          <div className="bg-stone-900/60 border border-stone-800 rounded-xl p-5">
            <div className="flex gap-6 mb-5">
              {[
                { label: 'Avg happiness', value: bestDayProfile.avgHappiness, color: '#6366f1' },
                { label: 'Avg energy', value: bestDayProfile.avgEnergy, color: '#f59e0b' },
                { label: 'Avg anxiety', value: bestDayProfile.avgAnxiety, color: '#ec4899' },
              ].map(m => (
                <div key={m.label}>
                  <span className="text-2xl font-light" style={{ color: m.color }}>{m.value}</span>
                  <p className="text-stone-500 text-xs mt-0.5">{m.label}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-stone-500 uppercase tracking-wider mb-3">Common activities on great days</p>
            <div className="flex flex-wrap gap-2">
              {bestDayProfile.topActivities.map(actId => {
                const act = ALL_ACTIVITIES[actId]
                if (!act) return null
                return (
                  <span
                    key={actId}
                    className="inline-flex items-center gap-1.5 bg-stone-800 px-3 py-1.5 rounded-full text-sm text-stone-300"
                  >
                    <span>{act.emoji}</span>
                    <span>{act.label}</span>
                  </span>
                )
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
