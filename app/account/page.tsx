import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { customerAuthConfigured } from '@/lib/shopify/customer';
import { customerProfile } from '@/lib/shopify/customer-orders';
import { CustomerSignOut } from '@/components/account-panel';
import { formatPrice } from '@/data/products';
import { whatsappHref } from '@/lib/content/contact';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Account — Whaleora',
  description: 'Sign in with Shopify to see your Whaleora orders and track them.',
};

const NOTES: Record<string, string> = {
  'not-configured': 'Accounts are not connected on this deployment yet.',
  'sign-in-failed': 'That sign-in did not complete. Please try again.',
  'missing-code': 'Shopify did not send a sign-in code back. Please try again.',
  access_denied: 'Sign-in was cancelled.',
};

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const profile = customerAuthConfigured() ? await customerProfile() : null;

  return (
    <main className="page-main account-page">
      <section className="safety-hero account-stage" id="account-panel">
        <span id="sign-in" />
        <div className="shell account-stage-inner">
          <div className="account-panel-home">
            {error && <p className="account-error" role="alert">{NOTES[error] ?? 'Something went wrong signing in.'}</p>}

            {!profile ? (
              <div className="account-signin">
                <p className="eyebrow dark">Your orders</p>
                <h1>Sign in to see your orders.</h1>
                <p>We use your Shopify account, the same one checkout uses — so every order you place shows up here with its tracking, automatically.</p>
                <a className="button button-primary" href="/api/auth/shopify/login">Sign in with Shopify <span aria-hidden="true"><ArrowRight size={16} strokeWidth={2} /></span></a>
                <p className="account-note-small">No password needed. Shopify emails you a one-time code.</p>
              </div>
            ) : (
              <>
                <div className="account-toolbar">
                  <div>
                    <p className="eyebrow dark">Signed in</p>
                    <h2>Hello{profile.name ? `, ${profile.name}` : ''}.</h2>
                    <p>{profile.email ?? 'Your Shopify account'} · orders below come straight from Shopify.</p>
                  </div>
                  <CustomerSignOut />
                </div>

                {profile.orders.length === 0 ? (
                  <div className="account-empty">
                    <h3>No orders yet.</h3>
                    <p>Anything you order will appear here, with tracking as soon as it ships.</p>
                    <div className="account-empty-actions">
                      <Link href="/products" className="button button-primary">Shop the collection <span aria-hidden="true"><ArrowRight size={16} strokeWidth={2} /></span></Link>
                      <a className="button button-outline" href={whatsappHref('Hi Whaleora! I have a question about an order.')}>WhatsApp us <span aria-hidden="true"><ArrowUpRight size={16} strokeWidth={2} /></span></a>
                    </div>
                  </div>
                ) : (
                  <div className="account-orders">
                    <ul>
                      {profile.orders.map((order) => (
                        <li key={order.id}>
                          <header>
                            <strong>{order.name}</strong>
                            <span>{order.processedAt ? new Date(order.processedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}</span>
                          </header>
                          <p>{order.lineItems.map((item) => `${item.quantity} × ${item.title}`).join(' · ')}</p>
                          <footer>
                            <em>{order.fulfillmentStatus ? order.fulfillmentStatus.toLowerCase().replace(/_/g, ' ') : (order.financialStatus ?? '').toLowerCase()}</em>
                            <span>{formatPrice(Number(order.total), order.currencyCode)}</span>
                            {order.trackingUrl && <a href={order.trackingUrl} target="_blank" rel="noreferrer" className="icon-link">Track parcel <ArrowUpRight size={15} strokeWidth={2} aria-hidden="true" /></a>}
                          </footer>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
