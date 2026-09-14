'use client';

import { useEffect, useRef } from 'react';
import { ArrowRight, UserRound, X } from 'lucide-react';

/**
 * Shown when a signed-out shopper hits checkout. The cart drawer closes first,
 * so this is the only overlay on screen and the drawer's own focus trap and
 * Escape handler are not competing with the dialog's.
 */
export function CheckoutGateDialog({ onGuest, onBack, pending }: { onGuest: () => void; onBack: () => void; pending: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const modal = ref.current;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflow = document.body.style.overflow;
    modal?.showModal(); document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = overflow; opener?.focus({ preventScroll: true }); };
  }, []);
  return (
    <dialog
      ref={ref}
      className="gate-dialog"
      aria-labelledby="gate-title"
      onClose={onBack}
      onClick={(event) => { if (event.target === event.currentTarget) onBack(); }}
    >
      <button type="button" className="gate-close" onClick={onBack} aria-label="Back to bag"><X size={18} /></button>
      <span className="gate-mark" aria-hidden="true"><UserRound size={22} strokeWidth={1.5} /></span>
      <h2 id="gate-title">Sign in first?</h2>
      <p>Signing in links this order to your account, so it shows up under Account with its tracking. You can also carry on without one.</p>
      <div className="gate-actions">
        <a href="/api/auth/shopify/login?next=/account" className="button button-primary">Sign in <span aria-hidden="true"><ArrowRight size={16} strokeWidth={2} /></span></a>
        <button type="button" className="button button-outline" onClick={onGuest} disabled={pending}>Continue as guest <span aria-hidden="true"><ArrowRight size={16} strokeWidth={2} /></span></button>
      </div>
      <button type="button" className="gate-back" onClick={onBack}>Back to bag</button>
    </dialog>
  );
}
