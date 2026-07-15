export const dynamic = 'force-dynamic'

import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getEntries } from '@/lib/db'
import HistoryView from '@/components/HistoryView'

export default async function HistoryPage() {
  const session = await getSession()
  if (!session) redirect('/')

  const entries = await getEntries(session.userId, 365)

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-light text-stone-100">History</h1>
          <p className="text-stone-500 text-sm mt-1">{entries.length} entries logged</p>
        </div>
        <a
          href="/api/export"
          className="text-sm text-stone-400 border border-stone-700 px-4 py-2 rounded-lg hover:border-stone-500 hover:text-stone-200 transition-colors"
        >
          Export CSV
        </a>
      </div>
      <HistoryView entries={entries} />
    </div>
  )
}
