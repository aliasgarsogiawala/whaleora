import { allowLogin, checkOrigin, credentials, endSession, setupPassword, startSession, validPassword } from '@/lib/admin/auth';
import { body, json } from '@/lib/admin/http';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try { checkOrigin(request); } catch { return json({ error: 'Request origin was rejected.' }, 403); }
  try {
    if (!await allowLogin(request)) return json({ error: 'Too many attempts. Please try again in 15 minutes.' }, 429);
    const data = JSON.parse((await body(request, 2048)).toString());
    if (typeof data.password !== 'string') return json({ error: 'Enter a password.' }, 400);
    if (data.action === 'setup') {
      const hostname = new URL(request.url).hostname;
      if (!['localhost', '127.0.0.1', '[::1]'].includes(hostname) || process.env.NODE_ENV !== 'development') return json({ error: 'Initial setup is only available on local development.' }, 403);
      await setupPassword(data.password);
    } else if (data.action !== 'login') return json({ error: 'Unknown action.' }, 400);
    const config = await credentials();
    if (!config || !await validPassword(data.password, config)) return json({ error: 'Incorrect password or admin is not configured.' }, 401);
    await startSession(config);
    return json({ ok: true });
  } catch { return json({ error: 'Sign-in failed. For initial setup, use 8–200 characters. Otherwise check server configuration.' }, 400); }
}

export async function DELETE(request: Request) {
  try { checkOrigin(request); } catch { return json({ error: 'Request origin was rejected.' }, 403); }
  await endSession();
  return json({ ok: true });
}
