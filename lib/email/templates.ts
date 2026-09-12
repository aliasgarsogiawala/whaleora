/**
 * The enquiry notification that lands in the hello@ inbox.
 *
 * Built as tables with inline styles because that is what Outlook and Gmail
 * actually render — no flex, no grid, no <style> block. Deliberately kept free
 * of `server-only` and of any import, so scripts/mail-check.mjs can send the
 * real template rather than an approximation of it.
 */
export type Enquiry = { name: string; email: string; subject: string; message: string; receivedAt?: Date };

const INK = '#102844';
const DEEP = '#0a1b2f';
const PAPER = '#fff9f1';
const TERRACOTTA = '#d7673d';
const MUTED = 'rgba(16,40,68,.6)';
const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

/** User-supplied text goes into markup, so every field is escaped. */
const escape = (value: string) => value
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const paragraphs = (message: string) => message
  .split(/\n{2,}/)
  .map((block) => block.trim())
  .filter(Boolean)
  .map((block) => `<p style="margin:0 0 14px;font:16px/1.65 ${SANS};color:${INK}">${escape(block).replace(/\n/g, '<br />')}</p>`)
  .join('');

const stamp = (date: Date) => date.toLocaleString('en-IN', {
  timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric',
  hour: 'numeric', minute: '2-digit', hour12: true,
});

export function enquiryEmail(enquiry: Enquiry) {
  const { name, email, subject, message } = enquiry;
  const received = stamp(enquiry.receivedAt ?? new Date());
  const safeName = escape(name);
  const safeEmail = escape(email);
  const safeSubject = escape(subject);

  const text = [
    `NEW ENQUIRY — ${subject}`,
    '',
    `From:     ${name}`,
    `Email:    ${email}`,
    `Received: ${received}`,
    '',
    '-'.repeat(52),
    '',
    message,
    '',
    '-'.repeat(52),
    '',
    `Reply to this email and it goes straight to ${name}.`,
    'Sent by the contact form at whaleora.com/contact',
    '',
  ].join('\n');

  const html = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /><meta name="color-scheme" content="light" /><title>New enquiry</title></head>
<body style="margin:0;padding:0;background:#efe7dc;-webkit-font-smoothing:antialiased">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${safeName} · ${safeSubject} — reply to answer directly.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#efe7dc">
<tr><td align="center" style="padding:24px 12px">

<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:100%;border-collapse:collapse">

<tr><td style="background:${DEEP};padding:20px 30px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
    <td align="left" style="font:600 14px/1 ${SANS};letter-spacing:.18em;color:#fff;text-transform:uppercase">WHALEORA</td>
    <td align="right" style="font:600 10px/1 ${SANS};letter-spacing:.16em;color:${TERRACOTTA};text-transform:uppercase">New enquiry</td>
  </tr></table>
</td></tr>
<tr><td style="height:3px;background:${TERRACOTTA};font-size:0;line-height:0">&nbsp;</td></tr>

<tr><td style="background:${PAPER};padding:34px 30px 10px">
  <p style="margin:0 0 10px;font:600 10px/1 ${SANS};letter-spacing:.16em;color:${TERRACOTTA};text-transform:uppercase">${safeSubject}</p>
  <h1 style="margin:0 0 6px;font:400 34px/1.1 ${SERIF};color:${INK};letter-spacing:-.01em">${safeName}</h1>
  <p style="margin:0;font:15px/1.5 ${SANS}">
    <a href="mailto:${safeEmail}" style="color:${TERRACOTTA};text-decoration:none">${safeEmail}</a>
    <span style="color:${MUTED}"> &nbsp;·&nbsp; ${received}</span>
  </p>
</td></tr>

<tr><td style="background:${PAPER};padding:22px 30px 0">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
    <td style="border-left:3px solid ${TERRACOTTA};padding:2px 0 2px 18px">${paragraphs(message)}</td>
  </tr></table>
</td></tr>

<tr><td style="background:${PAPER};padding:26px 30px 34px">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
    <td style="background:${INK}">
      <a href="mailto:${safeEmail}?subject=Re:%20${encodeURIComponent(subject)}" style="display:inline-block;padding:14px 26px;font:600 11px/1 ${SANS};letter-spacing:.14em;color:#fff;text-transform:uppercase;text-decoration:none">Reply to ${safeName}</a>
    </td>
  </tr></table>
  <p style="margin:16px 0 0;font:13px/1.6 ${SANS};color:${MUTED}">Or just hit reply — this email is addressed back to them.</p>
</td></tr>

<tr><td style="background:${DEEP};padding:18px 30px">
  <p style="margin:0;font:12px/1.6 ${SANS};color:rgba(255,255,255,.55)">Sent by the contact form at <a href="https://whaleora.com/contact" style="color:rgba(255,255,255,.8)">whaleora.com/contact</a></p>
</td></tr>

</table>
</td></tr></table>
</body></html>`;

  return { subject: `New enquiry · ${subject} · ${name}`, text, html };
}
