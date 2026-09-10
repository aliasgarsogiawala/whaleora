import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { products, formatPrice } from '@/data/products';
import { whatsappHref } from '@/lib/content/contact';

const WARRANTY_MONTHS = 12;

export const metadata: Metadata = {
  title: 'Warranty — Whaleora',
  description: `Every Whaleora object is covered for ${WARRANTY_MONTHS} months against manufacturing defects. Here is what that covers, what it does not, and how to claim without building a case first.`,
};

const covered = [
  'A siren, strobe or mechanism that stops working on its own.',
  'A battery that will not hold charge within the warranty period.',
  'A pin, clip, loop or housing that fails under normal everyday carry.',
  'Anything that arrived faulty, damaged or simply wrong in the box.',
] as const;

const notCovered = [
  'Ordinary wear — scuffs, scratches and faded print from living in a bag.',
  'Loss, theft, or damage from a drop, crush or vehicle accident.',
  'Water damage on products not rated for immersion.',
  'A pepper spray canister that has been discharged, or any tool used as intended in an emergency.',
  'Anything opened, modified or repaired by someone other than us.',
] as const;

const steps = [
  {
    title: 'Message us',
    text: 'Email hello@whaleora.com or send a WhatsApp. Tell us what the product did, or stopped doing. A photo or a short video helps, but it is not a requirement.',
  },
  {
    title: 'Send your order number',
    text: 'It is in the subject line of your order confirmation email, and on the warranty card inside it. That email is your proof of purchase — you do not need a receipt or a registration form.',
  },
  {
    title: 'We replace it',
    text: 'Wait to hear from us before posting anything back, so we can tell you where to send it. We cover return shipping on a valid claim. You will not be asked to argue your case first.',
  },
] as const;

export default function WarrantyPage() {
  return (
    <main className="page-main warranty-page">
      <section className="warranty-hero shell">
        <div className="warranty-hero-copy">
          <p className="eyebrow dark">Warranty</p>
          <h1>Twelve months,<br /><em>no argument.</em></h1>
          <p>
            Every object we sell is covered for {WARRANTY_MONTHS} months against manufacturing defects — the ₹299 whistle
            on the same terms as the ₹1,799 alarm. A safety tool that fails is not a small inconvenience, so we
            would rather replace it than debate it.
          </p>
          <div className="warranty-hero-actions">
            <Link href="/contact" className="button button-primary">Start a claim <span>→</span></Link>
            <a className="arrow-link" href={whatsappHref('Hi Whaleora! I need to make a warranty claim.')} target="_blank" rel="noreferrer">
              WhatsApp us <span>↗</span>
            </a>
          </div>
        </div>
        <figure className="warranty-hero-visual">
          <Image src="/lifestyle/sos-alarm-flatlay.webp" fill priority sizes="(max-width: 900px) 100vw, 34vw" alt="Whaleora personal safety objects laid out" />
          <figcaption>Covered from the day it arrives</figcaption>
        </figure>
      </section>

      <section className="warranty-coverage section-pad">
        <div className="shell">
          <div className="section-heading">
            <h2>Same cover on <em>all four.</em></h2>
            <p>No tiered plans, no extended warranty to buy at checkout. The term starts on the day your order is delivered.</p>
          </div>
          <div className="warranty-grid">
            {products.map((product) => (
              <article key={product.slug}>
                <span>{WARRANTY_MONTHS} months</span>
                <h3>{product.title}</h3>
                <p>{formatPrice(product.price)}</p>
                <Link href={`/products/${product.slug}`} className="arrow-link">View product <span>→</span></Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="warranty-terms shell">
        <div className="warranty-column">
          <h2>What it covers</h2>
          <ul>
            {covered.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
        <div className="warranty-column is-muted">
          <h2>What it doesn&apos;t</h2>
          <ul>
            {notCovered.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      </section>

      <section className="warranty-claim section-pad">
        <div className="shell">
          <div className="section-heading">
            <h2>How to claim.</h2>
            <p>Three steps, and none of them involve a form. Most claims are settled over WhatsApp the same day.</p>
          </div>
          <ol className="warranty-steps">
            {steps.map((step, index) => (
              <li key={step.title}>
                <span>0{index + 1}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="warranty-card-note">
        <div className="shell">
          <div>
            <p className="eyebrow">Your warranty card</p>
            <h2>It&apos;s already in your inbox.</h2>
          </div>
          <div className="warranty-card-copy">
            <p>
              There is no card to register and nothing to keep in a drawer. Your order confirmation email is the
              warranty card — it carries the order number, the date and the products, which is everything we need
              to look you up.
            </p>
            <p>
              Lost the email? Message us with the phone number or address you ordered with and we will find it.
            </p>
            <div className="warranty-card-actions">
              <Link href="/contact" className="button button-light">Contact support <span>→</span></Link>
              <Link href="/products" className="text-link">Shop the collection <span>↗</span></Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
