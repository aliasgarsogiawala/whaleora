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
                      {profile.orders.map((order) => {
                        /* Shopify's own page for this order. If the store's API version did
                           not return one, fall back to the hosted orders list so the row
                           still takes people somewhere real. */
                        const openUrl = order.statusPageUrl ?? profile.ordersUrl;
                        return (
                        /* The whole row opens the order on Shopify — the link on the order
                           number stretches over the card, and the Return and Track links
                           sit above it so they still reach their own targets. */
                        <li key={order.id} className={openUrl ? 'order-card is-linked' : 'order-card'}>
                          <header>
                            {openUrl ? (
                              <a className="order-open" href={openUrl} target="_blank" rel="noreferrer">
                                <strong>{order.name}</strong>
                                <span className="order-open-hint">View order on Shopify <ArrowUpRight size={14} strokeWidth={2} aria-hidden="true" /></span>
                              </a>
                            ) : (
                              <strong>{order.name}</strong>
                            )}
                            <span>{order.processedAt ? new Date(order.processedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}</span>
                          </header>
                          <ul className="order-lines">
                            {order.lineItems.map((item) => (
                              <li key={item.id}>
                                <span>{item.quantity} × {item.title}</span>
                                {/* Shopify's Return rules decide this, so the button disappears
                                    on its own once the window closes. */}
                                {item.returnable && order.statusPageUrl && (
                                  <a href={order.statusPageUrl} target="_blank" rel="noreferrer" className="order-return">
                                    Return <ArrowUpRight size={13} strokeWidth={2} aria-hidden="true" />
                                  </a>
                                )}
                              </li>
                            ))}
                          </ul>
                          <footer>
                            <em>{order.fulfillmentStatus ? order.fulfillmentStatus.toLowerCase().replace(/_/g, ' ') : (order.financialStatus ?? '').toLowerCase()}</em>
                            <span>{formatPrice(Number(order.total), order.currencyCode)}</span>
                            {order.trackingUrl && <a href={order.trackingUrl} target="_blank" rel="noreferrer" className="icon-link">Track parcel <ArrowUpRight size={15} strokeWidth={2} aria-hidden="true" /></a>}
                          </footer>
                        </li>
                        );
                      })}
                    </ul>
                    <p className="account-returns-note">
                      Returns open for 7 days after delivery — the button appears next to anything still inside that window.
                      After it closes, email <a href="mailto:hello@whaleora.com">hello@whaleora.com</a> with your order number and we’ll look at it under our returns policy.
                    </p>
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
