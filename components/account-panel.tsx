'use client';

import { useAuthActions } from '@convex-dev/auth/react';
import { useConvexAuth, useQuery } from 'convex/react';
import Link from 'next/link';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { api } from '@/convex/_generated/api';
import { formatPrice } from '@/data/products';
import { whatsappHref } from '@/lib/content/contact';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

const labelFor = (status: string | undefined) => {
  if (!status) return 'Processing';
  const value = status.replace(/_/g, ' ');
  return value.charAt(0).toUpperCase() + value.slice(1);
};

export function AccountPanel() {
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    return (
      <section className="account-panel account-panel-auth">
        <p className="account-note">Accounts are not connected on this build yet.</p>
      </section>
    );
  }
  return <AccountPanelReady />;
}

function AccountPanelReady() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  if (isLoading) {
    return (
      <section className="account-panel account-panel-auth">
        <p className="account-note">Checking your session…</p>
      </section>
    );
  }
  return isAuthenticated ? <AccountHome /> : <AccountAuth />;
}

function AccountAuth() {
  const { signIn } = useAuthActions();
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const applyHash = () => {
      if (window.location.hash === '#sign-up') setMode('signUp');
      if (window.location.hash === '#sign-in') setMode('signIn');
    };
    applyHash();
    window.addEventListener('hashchange', applyHash);
    return () => window.removeEventListener('hashchange', applyHash);
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const form = new FormData(event.currentTarget);
    form.set('flow', mode);
    try {
      await signIn('password', form);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign-in failed.';
      setError(message.replace(/^Uncaught Error:\s*/i, ''));
      setBusy(false);
    }
  }

  return (
    <section className="account-panel account-panel-auth">
      <div className="account-auth">
        <header className="account-auth-copy">
          <p className="eyebrow dark">Sign in · Orders · History</p>
          <h1>Orders, kept<br /><em>on this email.</em></h1>
          <p>Payment still happens on Shopify. We match orders to the email you sign in with.</p>
        </header>
        <div className="account-card">
          <div className="account-tabs" role="tablist">
            <button type="button" role="tab" aria-selected={mode === 'signIn'} className={mode === 'signIn' ? 'active' : ''} onClick={() => { setMode('signIn'); setError(''); }}>
              Sign in
            </button>
            <button type="button" role="tab" aria-selected={mode === 'signUp'} className={mode === 'signUp' ? 'active' : ''} onClick={() => { setMode('signUp'); setError(''); }}>
              Create account
            </button>
          </div>
          <form className="contact-form account-form" onSubmit={submit}>
            <p className="eyebrow dark">{mode === 'signIn' ? 'Welcome back' : 'New account'}</p>
            <label>
              Email
              <input name="email" type="email" autoComplete="email" required />
            </label>
            <label>
              Password
              <input name="password" type="password" autoComplete={mode === 'signUp' ? 'new-password' : 'current-password'} required minLength={8} />
            </label>
            {mode === 'signUp' && <p className="form-note">Use the same email you will use at Shopify checkout, so your orders land here.</p>}
            {error && <p className="account-error" role="alert">{error}</p>}
            <button className="button button-primary" type="submit" disabled={busy}>
              {busy ? 'One moment…' : mode === 'signIn' ? 'Sign in' : 'Create account'} <span aria-hidden="true"><ArrowRight size={16} strokeWidth={2} /></span>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

function AccountHome() {
  const { signOut } = useAuthActions();
  const me = useQuery(api.users.current);
  const orders = useQuery(api.orders.mine);
  const greeting = me?.name || me?.email || 'there';
  const list = useMemo(() => orders ?? [], [orders]);

  return (
    <section className="account-panel account-panel-home">
      <div className="account-toolbar">
        <div>
          <p className="eyebrow dark">Signed in</p>
          <h2>Hello, {greeting}.</h2>
          <p>Orders placed on Shopify with this email appear below. Checkout itself still happens on Shopify.</p>
        </div>
        <button type="button" className="button button-outline" onClick={() => void signOut()}>
          Sign out
        </button>
      </div>

      <div className="account-orders">
        {orders === undefined ? (
          <p className="account-note">Loading orders…</p>
        ) : list.length === 0 ? (
          <div className="account-empty">
            <h3>No orders on this email yet.</h3>
            <p>Place an order with {me?.email || 'this account'}, or message us with your order number if you checked out as a guest on a different address.</p>
            <div className="account-empty-actions">
              <Link href="/products" className="button button-primary">Shop the collection <span aria-hidden="true"><ArrowRight size={16} strokeWidth={2} /></span></Link>
              <a className="text-link" href={whatsappHref('Hi Whaleora! I have an order I’d like attached to my account.')}>WhatsApp us <span aria-hidden="true"><ArrowUpRight size={16} strokeWidth={2} /></span></a>
            </div>
          </div>
        ) : (
          <ul>
            {list.map((order) => (
              <li key={order._id}>
                <header>
                  <strong>{order.orderNumber}</strong>
                  <span>{order.processedAt ? new Date(order.processedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}</span>
                </header>
                <p>{order.lineItems.map((item) => `${item.title} × ${item.quantity}`).join(' · ')}</p>
                <footer>
                  <b>{formatPrice(Number.parseFloat(order.total), order.currency)}</b>
                  <em>{labelFor(order.fulfillmentStatus || order.financialStatus)}</em>
                  {order.trackingUrl ? <a href={order.trackingUrl} target="_blank" rel="noreferrer">Track parcel <ArrowUpRight size={15} strokeWidth={2} aria-hidden="true" /></a> : null}
                  {order.statusUrl && !order.trackingUrl ? <a href={order.statusUrl} target="_blank" rel="noreferrer">Order status <ArrowUpRight size={15} strokeWidth={2} aria-hidden="true" /></a> : null}
                </footer>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
