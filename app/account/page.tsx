import type { Metadata } from 'next';
import { AccountPanel } from '@/components/account-panel';

export const metadata: Metadata = {
  title: 'Account — Whaleora',
  description: 'Sign in to Whaleora to see orders placed through Shopify checkout on this email.',
};

export default function AccountPage() {
  return (
    <main className="page-main account-page">
      <section className="safety-hero account-stage" id="account-panel">
        <span id="sign-in" />
        <span id="sign-up" />
        <div className="shell account-stage-inner">
          <AccountPanel />
        </div>
      </section>
    </main>
  );
}
