'use client';

import { useState } from 'react';
import { LogOut } from 'lucide-react';

/**
 * Signs the customer out of this site, then hands them to Shopify's logout so
 * the Shopify session ends too — otherwise the next sign-in is silent and it
 * looks like sign-out did nothing.
 */
export function CustomerSignOut() {
  const [busy, setBusy] = useState(false);

  async function signOut() {
    setBusy(true);
    try {
      const response = await fetch('/api/auth/shopify/logout', { method: 'POST' });
      const data = await response.json().catch(() => ({}));
      window.location.href = data.logoutUrl || '/';
    } catch {
      window.location.href = '/';
    }
  }

  return (
    <button type="button" className="button button-outline" onClick={() => void signOut()} disabled={busy}>
      {busy ? 'Signing out…' : 'Sign out'} <span aria-hidden="true"><LogOut size={16} strokeWidth={2} /></span>
    </button>
  );
}
