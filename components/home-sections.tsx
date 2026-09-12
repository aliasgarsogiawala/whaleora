import Link from 'next/link';
import type { ShopProduct } from '@/components/commerce';
import { formatPrice } from '@/data/products';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

const trustPoints = [
  { figure: '130dB', label: 'Siren and strobe, on one pull' },
  { figure: '38g', label: 'The alarm, on your keyring' },
  { figure: '₹299', label: 'Where the collection starts' },
  { figure: '₹1,499+', label: 'Free shipping across India' },
];

export function TrustBar() {
  return (
    <section className="trust-bar" aria-label="Whaleora at a glance">
      <dl className="shell">
        {trustPoints.map((point) => (
          <div key={point.figure}><dt>{point.figure}</dt><dd>{point.label}</dd></div>
        ))}
      </dl>
    </section>
  );
}

const rows = [
  { key: 'job', head: 'What it does' },
  { key: 'reachFor', head: 'When you’d reach for it' },
  { key: 'power', head: 'What powers it' },
  { key: 'carry', head: 'Where it lives' },
  { key: 'caveat', head: 'The honest caveat' },
] as const;

export function Chooser({ catalog }: { catalog: ShopProduct[] }) {
  return (
    <section className="chooser section-pad" id="chooser" data-reveal>
      <div className="shell section-heading">
        <div>
          <p className="eyebrow dark">Not sure which one</p>
          <h2>Pick by the situation, not the product.</h2>
        </div>
        <p>The same four things, compared honestly — including what each one can’t do. Most people start with the alarm and add the whistle.</p>
      </div>

      <div className="shell chooser-scroll">
        <table className="chooser-table">
          <caption className="visually-hidden">Whaleora products compared by job, use case, power source, carry location and limitations</caption>
          <thead>
            <tr>
              <th scope="col"><span className="visually-hidden">Comparison criteria</span></th>
              {catalog.map((product) => (
                <th scope="col" key={product.id}>
                  <Link href={`/products/${product.slug}`}>
                    <small>{product.category}</small>
                    <strong>{product.title}</strong>
                    <b>{formatPrice(product.price, product.currencyCode)}</b>
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className={row.key === 'caveat' ? 'is-caveat' : undefined}>
                <th scope="row">{row.head}</th>
                {catalog.map((product) => <td key={product.id}>{product.compare[row.key]}</td>)}
              </tr>
            ))}
            <tr className="chooser-actions">
              <th scope="row"><span className="visually-hidden">Buy</span></th>
              {catalog.map((product) => (
                <td key={product.id}><Link href={`/products/${product.slug}`} className="chooser-cta">View <span aria-hidden="true"><ArrowRight size={16} strokeWidth={2} /></span></Link></td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <p className="chooser-hint" aria-hidden="true">Swipe to compare <ArrowRight size={15} strokeWidth={2} aria-hidden="true" /></p>
    </section>
  );
}

const objections = [
  {
    q: 'Does a personal alarm actually stop anyone?',
    a: 'No, and we won’t pretend otherwise. What 130dB does is remove the thing most situations depend on: privacy. It makes people look up and it buys you seconds to move. Seconds are usually the whole game.',
  },
  {
    q: 'Is pepper spray legal for me to carry?',
    a: 'In most places in India, yes — but rules vary by state, and airlines and some venues have their own. Check what applies where you live and where you’re travelling before you buy. We’d rather lose the sale than have you find out at a security check.',
  },
  {
    q: 'What happens when the battery dies?',
    a: 'The SOS Alarm takes a CR2032 — the same coin cell as a car key fob, about ₹50 at any chemist. One comes in the box. The whistle and the window breaker have no battery at all, which is exactly why we sell them.',
  },
  {
    q: 'Can I take these on a flight?',
    a: 'The whistle, yes. Pepper spray is prohibited on almost every airline, in cabin and usually in checked bags too. The window breaker is a sharp tool and belongs in a car, not a carry-on. Check your carrier before you pack.',
  },
  {
    q: 'Why should I buy this instead of a ₹99 alarm online?',
    a: 'Plenty of cheap alarms are rated at 130dB and deliver nothing close. Ours lists real specs — output, weight, cell type, build — because those are the things you can hold us to. If it doesn’t hold up, email us.',
  },
];

export function Objections() {
  return (
    <section className="objections shell section-pad" data-reveal>
      <div>
        <p className="eyebrow dark">Before you buy</p>
        <h2>Fair questions, straight answers.</h2>
        <p className="objections-note">Including the ones that don’t help us sell anything.</p>
        <Link href="/contact" className="arrow-link">Ask us something else <span aria-hidden="true"><ArrowUpRight size={16} strokeWidth={2} /></span></Link>
      </div>
      <div className="objection-list">
        {objections.map((item, index) => (
          <details key={item.q} open={index === 0}>
            <summary>{item.q}<span aria-hidden="true">＋</span></summary>
            <p>{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
