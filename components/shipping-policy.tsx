'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { SHIPPING_POLICY, SHIPPING_POLICY_INTRO, SHIPPING_POLICY_UPDATED } from '@/lib/content/shipping';

/** The policy copy carries **emphasis** and bare email addresses, nothing else. */
function rich(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(/\*\*(.+?)\*\*|([\w.+-]+@[\w.-]+\.\w+)/g)) {
    const start = match.index;
    if (start > last) nodes.push(text.slice(last, start));
    nodes.push(match[1]
      ? <strong key={start}>{match[1]}</strong>
      : <a key={start} href={`mailto:${match[2]}`}>{match[2]}</a>);
    last = start + match[0].length;
  }
  nodes.push(text.slice(last));
  return nodes;
}

export function ShippingPolicyDialog({ close }: { close: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const modal = ref.current;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflow = document.body.style.overflow;
    modal?.showModal(); document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = overflow; opener?.focus({ preventScroll: true }); };
  }, []);
  return (
    <dialog ref={ref} className="policy-dialog" aria-labelledby="shipping-policy-title" onClose={close} onClick={(event) => { if (event.target === event.currentTarget) close(); }}>
      <div className="policy-dialog-top">
        <span>Shipping Policy</span>
        <button type="button" onClick={close} aria-label="Close shipping policy"><X size={20} /></button>
      </div>
      <div className="policy-dialog-body">
        <h2 id="shipping-policy-title">Shipping Policy</h2>
        <p className="policy-updated">Last updated: {SHIPPING_POLICY_UPDATED}</p>
        <p className="policy-intro">{SHIPPING_POLICY_INTRO}</p>
        {SHIPPING_POLICY.map((section, index) => (
          <section key={section.title}>
            <h3>{index + 1}. {section.title}</h3>
            {section.body.map((paragraph) => <p key={paragraph}>{rich(paragraph)}</p>)}
          </section>
        ))}
      </div>
    </dialog>
  );
}
