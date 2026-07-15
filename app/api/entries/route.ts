export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { upsertEntry, getEntries, getEntryByDate } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const date = searchParams.get('date')

  if (date) {
    const entry = await getEntryByDate(session.userId, date)
    return NextResponse.json({ entry })
  }

  const entries = await getEntries(session.userId)
  return NextResponse.json({ entries })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { date, happiness, energy, anxiety, journal, activities } = await req.json()

    if (!date || happiness == null || energy == null || anxiety == null) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const entry = await upsertEntry(
      session.userId,
      date,
      Number(happiness),
      Number(energy),
      Number(anxiety),
      journal || '',
      activities || []
    )

    return NextResponse.json({ entry })
  } catch (err) {
    console.error('entries POST error:', err)
    return NextResponse.json({ error: 'Failed to save entry' }, { status: 500 })
  }
}
