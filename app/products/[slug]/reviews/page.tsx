import type { Metadata } from 'next';
import { ProductImage } from '@/components/product-image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { ProductReviewRail } from '@/components/product-detail';
import { ReviewForm } from '@/components/review-form';
import { publishedContent } from '@/lib/content/store';
import { productReviews } from '@/lib/content/product-reviews';
import { approvedReviews } from '@/lib/convex';
import { formatPrice, PRODUCT_IMAGE_FALLBACK } from '@/data/products';
import { getCatalog, getCatalogProduct } from '@/lib/shopify/catalog';
import '../product-page.css';
import './reviews-page.css';

export const dynamic = 'force-dynamic';

const initials = (name: string) => name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('');
const stars = (rating: number) => '★'.repeat(rating);

export async function generateStaticParams() {
  const catalog = await getCatalog();
  return catalog.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getCatalogProduct(slug);
  if (!product) return {};
  const title = `${product.title} reviews | Whaleora`;
  const description = `What customers say about the ${product.title}, and a place to write your own review.`;
  return { title, description, openGraph: { title, description, images: [{ url: product.images[0] || PRODUCT_IMAGE_FALLBACK }] } };
}

export default async function ProductReviewsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [catalog, content] = await Promise.all([getCatalog(), publishedContent()]);
  const product = catalog.find((item) => item.slug === slug);
  if (!product) notFound();
  const { quotes, videos } = productReviews(content, product);
  const written = await approvedReviews(product.shopify?.handle ?? product.slug);
  const total = written.length + quotes.length;

  // Only rated customer reviews count towards the average; editorial quotes carry no rating.
  const average = written.length ? written.reduce((sum, review) => sum + review.rating, 0) / written.length : 0;
  const spread = [5, 4, 3, 2, 1].map((value) => ({ value, count: written.filter((review) => review.rating === value).length }));

  return <main className="pdp-reference reviews-page">
    <nav className="pdp-breadcrumb shell" aria-label="Breadcrumb">
      <Link href="/">Home</Link><span>/</span>
      <Link href="/products">Shop</Link><span>/</span>
      <Link href={`/products/${product.slug}`}>{product.title}</Link><span>/</span>
      <span aria-current="page">Reviews</span>
    </nav>

    <section className="shell reviews-head">
      <div className="reviews-head-copy">
        <p className="eyebrow dark">Reviews · {product.title}</p>
        <h1>A few words from everyday life.</h1>
        <p className="reviews-head-note">Every published review is written by someone who bought this product. We publish them as they come, good or bad.</p>
        <div className="reviews-head-actions">
          <a className="button button-primary" href="#write">Write a review <span aria-hidden="true"><ArrowUpRight size={16} strokeWidth={2} /></span></a>
          <Link className="icon-link reviews-back" href={`/products/${product.slug}`}><ArrowLeft size={15} strokeWidth={2} aria-hidden="true" /> Back to the {product.title}</Link>
        </div>
      </div>

      <aside className="reviews-summary" aria-label="Rating summary">
        <Link href={`/products/${product.slug}`} className="reviews-summary-product">
          <span className="reviews-summary-image"><ProductImage src={product.images[0] || PRODUCT_IMAGE_FALLBACK} alt={product.title} fill sizes="72px" /></span>
          <span><strong>{product.title}</strong><span>{formatPrice(product.price, product.currencyCode)}</span></span>
        </Link>
        {written.length ? <>
          <div className="reviews-average">
            <strong>{average.toFixed(1)}</strong>
            <div>
              <div className="pdp-review-stars" aria-label={`${average.toFixed(1)} out of 5`}>{stars(Math.round(average))}<span>{stars(5 - Math.round(average))}</span></div>
              <span>{written.length} customer {written.length === 1 ? 'review' : 'reviews'}</span>
            </div>
          </div>
          <ul className="reviews-spread">
            {spread.map((row) => <li key={row.value}>
              <span>{row.value}★</span>
              <span className="reviews-bar"><i style={{ width: `${written.length ? (row.count / written.length) * 100 : 0}%` }} /></span>
              <span>{row.count}</span>
            </li>)}
          </ul>
        </> : <p className="reviews-summary-empty">No customer ratings yet. Yours would be the first.</p>}
      </aside>
    </section>

    {videos.length > 0 && <div className="shell pdp-section reviews-videos"><ProductReviewRail items={videos} /></div>}

    <section className="shell pdp-section reviews-list-section" aria-labelledby="all-reviews-title">
      <div className="pdp-reviews-heading">
        <h2 id="all-reviews-title">{total ? `All ${total} ${total === 1 ? 'review' : 'reviews'}` : 'No reviews yet'}</h2>
        {total > 0 && <span>Newest first</span>}
      </div>
      {quotes.some((item) => item.demo) && <p className="pdp-reviews-disclosure">Reviews marked “Demo” are sample content, not customer feedback.</p>}

      {total ? <div className="reviews-list">
        {written.map((review) => <figure className="reviews-card" key={review.id}>
          <div className="reviews-card-top">
            <div className="pdp-review-stars" aria-label={`${review.rating} out of 5`}>{stars(review.rating)}<span>{stars(5 - review.rating)}</span></div>
            <time dateTime={review.submittedAt}>{new Date(review.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</time>
          </div>
          <blockquote>“{review.body}”</blockquote>
          <figcaption>
            <span className="pdp-review-initials" aria-hidden="true">{initials(review.name)}</span>
            <span><strong>{review.name}</strong><span>{product.title}</span></span>
            {review.verifiedBuyer && <small className="is-verified">Verified buyer</small>}
          </figcaption>
        </figure>)}
        {quotes.map((review) => <figure className="reviews-card" key={review.id}>
          <blockquote>“{review.quote}”</blockquote>
          <figcaption>
            <span className="pdp-review-initials" aria-hidden="true">{initials(review.name)}</span>
            <span><strong>{review.name}</strong><span>{product.title}</span></span>
            {review.demo && <small>Demo</small>}
          </figcaption>
        </figure>)}
      </div> : <p className="pdp-reviews-empty">No written reviews for this product yet. Be the first.</p>}
    </section>

    <section className="shell pdp-section reviews-write" id="write" aria-labelledby="write-review-title">
      <div className="pdp-section-heading"><p className="eyebrow dark">Your turn</p><h2 id="write-review-title">Tell the next person what it is like.</h2><p>A couple of lines about how you used it, and how it held up, is plenty.</p></div>
      <ReviewForm productHandle={product.shopify?.handle ?? product.slug} productTitle={product.title} defaultOpen />
    </section>
  </main>;
}
