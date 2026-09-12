import type { Metadata } from 'next';
import { credentials, isAdmin } from '@/lib/admin/auth';
import { readDocument, usesRedis } from '@/lib/content/store';
import { shopifySnapshots } from '@/lib/shopify/catalog';
import { AdminEditor, AdminLogin } from '@/components/admin/editor';
import './admin.css';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Content studio · Whaleora', robots: { index: false, follow: false } };

export default async function AdminPage() {
  const config = await credentials();
  if (!await isAdmin()) return <AdminLogin setup={!config && process.env.NODE_ENV === 'development'} configured={Boolean(config)} />;
  const [document, shopify] = await Promise.all([readDocument().catch(() => null), shopifySnapshots()]);
  if (!document) {
    return <main className="admin-login"><div className="admin-login-card"><p className="admin-kicker">Whaleora / Content studio</p><h1>Storage is unavailable.</h1><p>Your saved content has not been changed. Check your storage connection and reload this page.</p><a href="/admin">Try again →</a></div></main>;
  }
  return <AdminEditor initial={document} shopify={shopify} uploadsEnabled={!process.env.VERCEL} canSave={!process.env.VERCEL || usesRedis()} />;
}
