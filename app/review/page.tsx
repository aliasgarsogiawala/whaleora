import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { formatPrice, PRODUCT_IMAGE_FALLBACK } from '@/data/products';
import { getCatalog } from '@/lib/shopify/catalog';
import './review-hub.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Write a review | Whaleora',
  description: 'Choose the product you bought and tell the next person what it is actually like.',
};

/** Landing spot for "leave a review" links. Sends people to the right product's review page. */
export default async function ReviewHubPage() {
  const catalog = await getCatalog();

  return <main className="review-hub">
    <nav className="pdp-breadcrumb shell" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span aria-current="page">Write a review</span></nav>

    <section className="shell review-hub-head">
      <p className="eyebrow dark">Reviews</p>
      <h1>Which one did you buy?</h1>
      <p>Pick the product and write a couple of lines about how you used it, and how it held up. Reviews go up as written, good or bad.</p>
    </section>

    <section className="shell review-hub-grid" aria-label="Choose a product to review">
      {catalog.map((product) => <article className="review-hub-card" key={product.id}>
        <Link href={`/products/${product.slug}/reviews`} className="review-hub-image" aria-hidden="true" tabIndex={-1}>
          <Image src={product.images[0] || PRODUCT_IMAGE_FALLBACK} alt="" fill sizes="(max-width: 700px) 90vw, 300px" />
        </Link>
        <div>
          <h2><Link href={`/products/${product.slug}/reviews`}>{product.title}</Link></h2>
          <p>{product.shortDescription}</p>
          <span className="review-hub-price">{formatPrice(product.price, product.currencyCode)}</span>
        </div>
        <div className="review-hub-actions">
          <Link className="button button-outline" href={`/products/${product.slug}/reviews#write`}>Write a review</Link>
          <Link className="icon-link review-hub-read" href={`/products/${product.slug}/reviews`}>Read its reviews <ArrowUpRight size={15} strokeWidth={2} aria-hidden="true" /></Link>
        </div>
      </article>)}
    </section>
  </main>;
}
