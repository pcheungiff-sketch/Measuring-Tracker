export const dynamic = 'force-dynamic'

import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { computeInsights } from '@/lib/db'
import InsightsView from '@/components/InsightsView'

export default async function InsightsPage() {
  const session = await getSession()
  if (!session) redirect('/')

  const insights = await computeInsights(session.userId)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-light text-stone-100">Insights</h1>
        <p className="text-stone-500 text-sm mt-1">What your data shows about your best days</p>
      </div>
      <InsightsView insights={insights} />
    </div>
  )
}
