/**
 * Resend transport. RESEND_API_KEY comes from the Vercel Marketplace Resend
 * integration; this module is the only place the app talks to Resend.
 *
 * `from` must sit on a domain verified in Resend — see .env.example for the
 * DNS records that verification needs.
 */
const ENDPOINT = 'https://api.resend.com/emails';

export type Mail = { to: string; from: string; subject: string; text: string; replyTo?: string };

export async function sendMail(mail: Mail) {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY is not set.');

  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      from: mail.from,
      to: [mail.to],
      subject: mail.subject,
      text: mail.text,
      ...(mail.replyTo ? { reply_to: mail.replyTo } : {}),
    }),
    cache: 'no-store',
  });

  // Resend answers failures with { name, message }. Keep that detail in the
  // server log; the caller turns it into a generic message for the browser.
  if (!response.ok) throw new Error(`Resend ${response.status}: ${(await response.text()).slice(0, 300)}`);
  return response.json() as Promise<{ id: string }>;
}
