import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Called by Vercel Cron: every hour, checks which users have their reminder time now
// Set up in vercel.json: "crons": [{ "path": "/api/reminder", "schedule": "0 * * * *" }]

export async function GET(req: NextRequest) {
  // Verify this is a cron request (in production, Vercel adds this header)
  const authHeader = req.headers.get('authorization')
  if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get current UTC hour — users store their reminder time in HH:MM UTC
    const nowHour = new Date().getUTCHours()
    const nowMinute = new Date().getUTCMinutes()
    
    // Only fire in the :00-:05 window of each hour to avoid double-sends
    if (nowMinute > 5) {
      return NextResponse.json({ skipped: true, reason: 'not in first 5 minutes of hour' })
    }

    const currentTime = `${String(nowHour).padStart(2, '0')}:00`
    
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

    let sent = 0
    for (const user of users.rows) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
        await resend.emails.send({
          from: 'Evening <noreply@yourdomain.com>',
          to: user.email,
          subject: "Time for your evening check-in",
          html: `
            <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px; color: #1c1917;">
              <p style="font-size: 22px; font-weight: 300; margin: 0 0 12px;">Evening check-in</p>
              <p style="font-size: 15px; color: #57534e; margin: 0 0 28px;">
                Take five minutes to close the day.
              </p>
              <a href="${baseUrl}/log" 
                 style="display: inline-block; background: #1c1917; color: #fafaf9; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 500;">
                Open Evening
              </a>
              <p style="font-size: 12px; color: #a8a29e; margin: 28px 0 0;">
                To change your reminder time or turn it off, visit Settings in the app.
              </p>
            </div>
          `,
        })
        sent++
      } catch (err) {
        console.error(`Failed to send reminder to ${user.email}:`, err)
      }
    }

    return NextResponse.json({ ok: true, sent, checked: users.rows.length })
  } catch (err) {
    console.error('reminder cron error:', err)
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 })
  }
}
