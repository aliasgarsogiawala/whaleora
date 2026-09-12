import { createHash } from 'node:crypto';
import { sendMail } from '@/lib/email/mailer';

/**
 * The contact form posts here. The enquiry is sent over SMTP to ENQUIRY_TO
 * (hello@whaleora.com), with Reply-To set to the person who wrote it, so
 * replying from the inbox goes straight back to them.
 *
 * Needs SMTP_USER and SMTP_PASSWORD for the sending mailbox. ENQUIRY_FROM must
 * be an address that mailbox is allowed to send as — normally itself.
 */
export const runtime = 'nodejs';

const SUBJECTS = ['Product question', 'Order support', 'Something arrived faulty', 'Partnership', 'Workshop', 'Something else'];
const MAX_BODY = 8_000;

export async function POST(request: Request) {
  if (!allow(request)) return Response.json({ error: 'Too many enquiries from here. Try again in 15 minutes, or email hello@whaleora.com.' }, { status: 429 });

  const raw = await request.text();
  if (raw.length > MAX_BODY) return Response.json({ error: 'That message is too long.' }, { status: 413 });

  let payload: Record<string, unknown>;
  try { payload = JSON.parse(raw); } catch { return Response.json({ error: 'Malformed request.' }, { status: 400 }); }

  const name = str(payload.name, 80);
  const email = str(payload.email, 160);
  const message = str(payload.message, 2000);
  const subject = SUBJECTS.includes(str(payload.subject, 60)) ? str(payload.subject, 60) : 'Something else';
  // A hidden field real people never see. Bots fill it, so treat it as a quiet success.
  if (str(payload.company, 80)) return Response.json({ ok: true });

  if (!name || !message) return Response.json({ error: 'Please add your name and a message.' }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return Response.json({ error: 'That email address does not look right.' }, { status: 400 });

  try {
    await sendMail({
      to: process.env.ENQUIRY_TO || 'hello@whaleora.com',
      from: process.env.ENQUIRY_FROM || 'Whaleora <hello@whaleora.com>',
      replyTo: email,
      subject: `${subject} — ${name}`,
      text: `${subject}\n\nFrom: ${name} <${email}>\n\n${message}\n`,
    });
  } catch (error) {
    console.error('[enquiry] send failed', error);
    return Response.json({ error: 'We could not send that. Please email hello@whaleora.com directly.' }, { status: 502 });
  }
  return Response.json({ ok: true });
}

function str(value: unknown, max: number) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

/**
 * Per-IP and account-wide caps, mirroring the admin login throttle. This is
 * per-instance memory: Fluid reuses instances so it holds in practice, but it
 * is a speed bump against form spam, not a guarantee.
 */
const attempts = new Map<string, { count: number; expires: number }>();
function allow(request: Request) {
  const client = createHash('sha256').update(request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local').digest('hex');
  const now = Date.now();
  for (const [id, entry] of attempts) if (entry.expires <= now) attempts.delete(id);
  for (const [key, limit] of [[client, 5], ['global', 200]] as const) {
    const entry = attempts.get(key) ?? { count: 0, expires: now + 900_000 };
    entry.count += 1; attempts.set(key, entry);
    if (entry.count > limit) return false;
  }
  return true;
}
