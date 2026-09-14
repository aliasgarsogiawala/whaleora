'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { POLICIES, type PolicyKey } from '@/lib/content/policies';

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

export function PolicyDialog({ policy, close }: { policy: PolicyKey; close: () => void }) {
  const { title, updated, intro, sections } = POLICIES[policy];
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const modal = ref.current;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflow = document.body.style.overflow;
    modal?.showModal(); document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = overflow; opener?.focus({ preventScroll: true }); };
  }, []);
  return (
    <dialog ref={ref} className="policy-dialog" aria-labelledby="policy-dialog-title" onClose={close} onClick={(event) => { if (event.target === event.currentTarget) close(); }}>
      <div className="policy-dialog-top">
        <span>{title}</span>
        <button type="button" onClick={close} aria-label={`Close ${title.toLowerCase()}`}><X size={20} /></button>
      </div>
      <div className="policy-dialog-body">
        <h2 id="policy-dialog-title">{title}</h2>
        <p className="policy-updated">Last updated: {updated}</p>
        <p className="policy-intro">{intro}</p>
        {sections.map((section, index) => (
          <section key={section.title}>
            <h3>{index + 1}. {section.title}</h3>
            {section.body.map((block, blockIndex) => Array.isArray(block)
              ? <ul key={blockIndex}>{block.map((item) => <li key={item}>{rich(item)}</li>)}</ul>
              : <p key={blockIndex}>{rich(block)}</p>)}
          </section>
        ))}
      </div>
    </dialog>
  );
}
