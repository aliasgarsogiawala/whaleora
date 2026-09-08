import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AddToCartButton, ProductCard } from '@/components/commerce';
import { formatPrice } from '@/data/products';
import { getCatalog, getCatalogProduct } from '@/lib/shopify/catalog';

export async function generateStaticParams() {
  const catalog = await getCatalog();
  return catalog.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getCatalogProduct(slug);
  if (!product) return {};
  const title = `${product.title} — ${formatPrice(product.price, product.currencyCode)} | Whaleora`;
  return {
    title,
    description: product.shortDescription,
    openGraph: { title, description: product.shortDescription, images: [{ url: product.images[0] }] },
    twitter: { card: 'summary_large_image', title, description: product.shortDescription, images: [product.images[0]] },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const catalog = await getCatalog();
  const product = catalog.find((item) => item.slug === slug);
  if (!product) notFound();
  const related = catalog.filter((item) => item.id !== product.id).slice(0, 3);

  return <main className="pdp page-main">
    <section className="pdp-top shell">
      <div className="pdp-gallery">{product.images.map((image, index) => <div className="pdp-image" key={image}><Image src={image} fill alt={index === 0 ? product.title : `${product.title} detail ${index + 1}`} priority={index === 0} sizes="(max-width: 900px) 100vw, 55vw" /><span>0{index + 1}</span></div>)}</div>
      <div className="pdp-buy">
        <div className="breadcrumbs"><Link href="/products">Collection</Link><span>/</span><span>{product.category}</span></div>
        <p className="eyebrow dark">{product.label}</p>
        <h1>{product.title}</h1>
        <p className="pdp-lede">{product.longDescription}</p>
        <strong className="pdp-price">{formatPrice(product.price, product.currencyCode)}{product.shopify?.compareAtPrice ? <s> {formatPrice(product.shopify.compareAtPrice, product.currencyCode)}</s> : null}</strong>
        <p className="tax-note">Inclusive of all taxes{product.price >= 1499 ? ' · Free shipping' : ` · Free shipping over ₹1,499`}{product.shopify && !product.shopify.availableForSale ? ' · Currently sold out' : ''}</p>
        <div className="pdp-actions"><AddToCartButton product={product} /></div>
        <ul className="buy-trust">
          <li><b>Reach for it when</b>{product.compare.reachFor}.</li>
          <li><b>Powered by</b>{product.compare.power}.</li>
          <li><b>Lives in</b>{product.compare.carry}.</li>
        </ul>
        <p className="responsible-note"><b>Worth knowing:</b> {product.compare.caveat} A safety tool buys you attention and time — it can’t promise an outcome, and we won’t say otherwise.</p>
      </div>
    </section>

    <section className="product-story shell section-pad">
      <div><p className="eyebrow dark">The short version</p><h2>{product.compare.job}.</h2></div>
      <p>{product.shortDescription} It’s built to be carried, not admired — which mostly means it had to be small enough that you stop noticing it’s there.</p>
    </section>

    <section className="feature-band"><div className="shell"><p className="eyebrow">What you get</p><div>{product.features.map((feature, index) => <article key={feature}><span>0{index + 1}</span><h3>{feature}</h3></article>)}</div></div></section>

    <section className="how-product shell section-pad">
      <div className="section-heading">
        <div><p className="eyebrow dark">How it works</p><h2>Three steps, and none of them are settings.</h2></div>
        <p>Read the instructions in the box once before you need it. That’s the only preparation this asks of you.</p>
      </div>
      <ol>{product.howItWorks.map((step, index) => <li key={step.title}><span>0{index + 1}</span><h3>{step.title}</h3><p>{step.text}</p></li>)}</ol>
    </section>

    <section className="scenarios"><div className="shell"><p className="eyebrow">Where people carry it</p><h2>Bought most often for these.</h2><div>{product.scenarios.map((scenario) => <span key={scenario}>{scenario}</span>)}</div></div></section>

    <section className="spec-section shell section-pad">
      <div><p className="eyebrow dark">Every number we have</p><h2>Specifications</h2></div>
      <dl>{product.specifications.map((spec) => <div key={spec.label}><dt>{spec.label}</dt><dd>{spec.value}</dd></div>)}</dl>
      <div className="included"><h3>In the box</h3>{product.included.map((item) => <p key={item}>— {item}</p>)}</div>
    </section>

    <section className="accordions shell">
      <details><summary>Shipping &amp; delivery <span>＋</span></summary><p>Free shipping on orders over ₹1,499, anywhere in India. Below that, shipping is calculated at checkout along with the delivery estimate for your pincode.</p></details>
      <details><summary>Returns &amp; support <span>＋</span></summary><p>Email hello@whaleora.com before sending anything back and we’ll sort it out. If a unit arrived faulty, tell us what it did and we’ll replace it — you don’t need to argue the case.</p></details>
      <details><summary>Is this legal to carry? <span>＋</span></summary><p>Our current guidance is that these are legal to carry in most jurisdictions, but rules genuinely vary — particularly for pepper spray, and particularly on aircraft. Check what applies where you live and where you’re travelling.</p></details>
    </section>

    <section className="related shell section-pad">
      <div className="section-heading"><div><p className="eyebrow dark">Commonly bought together</p><h2>Most people end up with two.</h2></div><p>An alarm for attention and a whistle for when the battery is the last thing you want to depend on.</p></div>
      <div className="product-grid">{related.map((item, index) => <ProductCard key={item.id} product={item} index={index} />)}</div>
    </section>

    <div className="sticky-buy">
      <div><small>{product.title}</small><strong>{formatPrice(product.price, product.currencyCode)}</strong></div>
      <AddToCartButton product={product} />
    </div>
  </main>;
}
