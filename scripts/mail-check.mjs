#!/usr/bin/env node
/**
 * Verifies the SMTP credentials the enquiry form will use.
 *
 *   npm run mail:check            connect and authenticate only
 *   npm run mail:check -- --send  also send one real test enquiry
 *
 * Authentication is the step that actually fails in practice — a wrong port,
 * a mailbox that needs an app password, or SMTP disabled on the account. This
 * reports that here rather than as a 502 from /api/enquiry.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import nodemailer from 'nodemailer';

/** Minimal .env reader so the check runs without extra dependencies. */
function loadEnv() {
  for (const file of ['.env.local', '.env']) {
    try {
      for (const line of readFileSync(resolve(process.cwd(), file), 'utf8').split('\n')) {
        const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
        if (!match) continue;
        const value = match[2].trim().replace(/^["']|["']$/g, '');
        if (value && !process.env[match[1]]) process.env[match[1]] = value;
      }
    } catch { /* file need not exist */ }
  }
}

loadEnv();

const host = process.env.SMTP_HOST || 'smtpout.secureserver.net';
const port = Number(process.env.SMTP_PORT || 465);
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASSWORD;
const to = process.env.ENQUIRY_TO || 'hello@whaleora.com';
const from = process.env.ENQUIRY_FROM || 'Whaleora <hello@whaleora.com>';

console.log('');
console.log('  Host      ', `${host}:${port}`, port === 465 ? '(implicit TLS)' : '(STARTTLS)');
console.log('  User      ', user || 'NOT SET');
console.log('  Password  ', pass ? `set (${pass.length} characters)` : 'NOT SET');
console.log('  Delivers  ', `${from}  ->  ${to}`);
console.log('');

if (!user || !pass) {
  console.error('  ✗ Set SMTP_USER and SMTP_PASSWORD in .env.local first.\n');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host, port, secure: port === 465, requireTLS: port !== 465,
  auth: { user, pass }, connectionTimeout: 15_000, greetingTimeout: 15_000,
});

try {
  await transporter.verify();
  console.log('  ✓ Connected and authenticated.');
} catch (error) {
  console.error(`  ✗ ${error.message}`);
  console.error('\n  Check the host and port with your mail provider, and whether the');
  console.error('  mailbox needs an app password or has SMTP access switched off.\n');
  process.exit(1);
}

if (process.argv.includes('--send')) {
  try {
    const info = await transporter.sendMail({
      from, to, replyTo: 'test@example.com',
      subject: 'Test enquiry — Whaleora contact form',
      text: 'This is a test from npm run mail:check. If it arrived, the contact form works.\n',
    });
    console.log(`  ✓ Sent. Message id ${info.messageId}`);
    console.log(`    Look in the ${to} inbox.`);
  } catch (error) {
    console.error(`  ✗ Authenticated, but the send failed: ${error.message}`);
    console.error('    Usually the From address is one this mailbox may not send as.');
    process.exit(1);
  }
} else {
  console.log('  Run with --send to deliver one real test enquiry.');
}
console.log('');
transporter.close();
