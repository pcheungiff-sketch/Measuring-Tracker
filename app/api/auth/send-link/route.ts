import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { Resend } from 'resend'
import { randomBytes } from 'crypto'
import { addMinutes } from 'date-fns'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }

    const token = randomBytes(32).toString('hex')
    const expiresAt = addMinutes(new Date(), 15)

    await sql`
      INSERT INTO magic_links (email, token, expires_at)
      VALUES (${email}, ${token}, ${expiresAt.toISOString()})
    `

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `https://${req.headers.get('host')}`
    const magicUrl = `${baseUrl}/api/auth/verify?token=${token}`

    await resend.emails.send({
      from: 'Evening <noreply@yourdomain.com>', // replace with your verified Resend domain
      to: email,
      subject: 'Your sign-in link',
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px; color: #1c1917;">
          <p style="font-size: 15px; color: #57534e; margin: 0 0 24px;">Here is your sign-in link. It expires in 15 minutes.</p>
          <a href="${magicUrl}" 
             style="display: inline-block; background: #1c1917; color: #fafaf9; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 500;">
            Sign in to Evening
          </a>
          <p style="font-size: 13px; color: #a8a29e; margin: 24px 0 0;">If you didn't request this, ignore this email.</p>
        </div>
      `,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('send-link error:', err)
    return NextResponse.json({ error: 'Failed to send link' }, { status: 500 })
  }
}
