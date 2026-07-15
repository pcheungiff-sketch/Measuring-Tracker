export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const nowHour = new Date().getUTCHours()
    const nowMinute = new Date().getUTCMinutes()

    if (nowMinute > 5) {
      return NextResponse.json({ skipped: true })
    }

    const currentTime = `${String(nowHour).padStart(2, '0')}:00`

    const { sql } = await import('@vercel/postgres')
    const users = await sql`
      SELECT u.id, u.email, u.reminder_time
      FROM users u
      WHERE u.reminder_enabled = true
        AND u.reminder_time = ${currentTime}
        AND NOT EXISTS (
          SELECT 1 FROM entries e 
          WHERE e.user_id = u.id 
          AND e.date = CURRENT_DATE
        )
    `

    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

    let sent = 0
    for (const user of users.rows) {
      try {
        await resend.emails.send({
          from: 'Evening <noreply@yourdomain.com>',
          to: user.email,
          subject: 'Time for your evening check-in',
          html: `<div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;"><p style="font-size: 22px; font-weight: 300; margin: 0 0 12px;">Evening check-in</p><p style="font-size: 15px; color: #57534e; margin: 0 0 28px;">Take five minutes to close the day.</p><a href="${baseUrl}/log" style="display: inline-block; background: #1c1917; color: #fafaf9; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px;">Open Evening</a></div>`,
        })
        sent++
      } catch (err) {
        console.error(`Failed to send to ${user.email}:`, err)
      }
    }

    return NextResponse.json({ ok: true, sent })
  } catch (err) {
    console.error('reminder error:', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
