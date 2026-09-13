import Image from 'next/image';
import { ProductsBrowser, ShopNote } from '@/components/products-browser';
import { getCatalog } from '@/lib/shopify/catalog';

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  const catalog = await getCatalog();

  return <main className="page-main">
    <section className="collection-hero"><div className="shell collection-hero-grid">
      <div className="collection-hero-copy">
        <p className="eyebrow dark">The whole catalogue</p>
        <h1>{catalog.length === 4 ? <>Four objects.<br /><em>Every spec listed.</em></> : <>{catalog.length} objects.<br /><em>Every spec listed.</em></>}</h1>
        <p>Output in decibels, weight in grams, battery type, shelf life. If a number matters to your decision, it’s on the page — and so is what the thing can’t do.</p>
      </div>
      <figure className="collection-hero-visual">
        <Image src="/lifestyle/whistle-bag-shot.webp" fill priority sizes="(max-width: 900px) 100vw, 38vw" alt="Whaleora survival whistle carried on a handbag" />
        <figcaption>Designed to be carried, not kept in a drawer.</figcaption>
      </figure>
    </div></section>

    <ProductsBrowser catalog={catalog} />
    <ShopNote />
  </main>;
}
