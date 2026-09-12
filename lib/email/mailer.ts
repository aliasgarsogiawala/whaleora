import 'server-only';
import nodemailer, { type Transporter } from 'nodemailer';

/**
 * SMTP transport for outgoing site mail.
 *
 * whaleora.com already runs GoDaddy Professional Email, and its SPF record is
 * `v=spf1 include:secureserver.net -all` — so sending through GoDaddy's own
 * SMTP with the hello@ mailbox is already authorised and needs no new DNS.
 * Host and port stay configurable for any other provider.
 */
export type Mail = { to: string; from: string; subject: string; text: string; html?: string; replyTo?: string };

let transporter: Transporter | null = null;

function transport(): Transporter {
  if (transporter) return transporter;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD } = process.env;
  if (!SMTP_USER || !SMTP_PASSWORD) throw new Error('SMTP_USER and SMTP_PASSWORD are not set.');

  const port = Number(SMTP_PORT || 465);
  transporter = nodemailer.createTransport({
    host: SMTP_HOST || 'smtpout.secureserver.net',
    port,
    // 465 is implicit TLS; 587 starts plaintext and upgrades via STARTTLS.
    secure: port === 465,
    requireTLS: port !== 465,
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
    // One warm connection is reused across requests on the same instance.
    pool: true,
    maxConnections: 2,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
  return transporter;
}

export async function sendMail(mail: Mail) {
  const info = await transport().sendMail({
    from: mail.from,
    to: mail.to,
    subject: mail.subject,
    // Both parts go out; every client picks the one it can render.
    text: mail.text,
    ...(mail.html ? { html: mail.html } : {}),
    ...(mail.replyTo ? { replyTo: mail.replyTo } : {}),
  });
  return { id: info.messageId };
}

/** Opens a connection and authenticates without sending, for setup checks. */
export async function verifyMailer() {
  await transport().verify();
}
