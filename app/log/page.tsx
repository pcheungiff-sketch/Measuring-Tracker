export const dynamic = 'force-dynamic'

import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getEntryByDate } from '@/lib/db'
import { format } from 'date-fns'
import LogForm from '@/components/LogForm'

export default async function LogPage() {
  const session = await getSession()
  if (!session) redirect('/')

  const today = format(new Date(), 'yyyy-MM-dd')
  const existingEntry = await getEntryByDate(session.userId, today)

  return (
    <div>
      <div className="mb-8">
        <p className="text-stone-500 text-sm mb-1">{format(new Date(), 'EEEE, MMMM d')}</p>
        <h1 className="text-2xl font-light text-stone-100">
          {existingEntry ? 'Update today\'s entry' : 'How was your day?'}
        </h1>
      </div>
      <LogForm initialEntry={existingEntry} today={today} />
    </div>
  )
}
