import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AddToCartButton, ProductCard } from '@/components/commerce';
import { formatPrice, getProduct, products } from '@/data/products';

export function generateStaticParams() { return products.map((product) => ({ slug: product.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  return {
    title: `${product.title} — Whaleora`,
    description: product.shortDescription,
    openGraph: { title: `${product.title} — Whaleora`, description: product.shortDescription, images: [{ url: product.images[0] }] },
    twitter: { card: 'summary_large_image', title: `${product.title} — Whaleora`, description: product.shortDescription, images: [product.images[0]] },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  const related = products.filter((item) => item.id !== product.id).slice(0, 3);
  return <main className="pdp page-main">
    <section className="pdp-top shell">
      <div className="pdp-gallery">{product.images.map((image, index) => <div className="pdp-image" key={image}><Image src={image} fill alt={index === 0 ? product.title : `${product.title} detail ${index + 1}`} priority={index === 0} sizes="(max-width: 900px) 100vw, 55vw" /><span>0{index + 1}</span></div>)}</div>
      <div className="pdp-buy"><div className="breadcrumbs"><Link href="/products">Collection</Link><span>/</span><span>{product.category}</span></div><p className="eyebrow dark">{product.label}</p><h1>{product.title}</h1><p className="pdp-lede">{product.longDescription}</p><strong className="pdp-price">{formatPrice(product.price)}</strong><p className="tax-note">Inclusive of all taxes</p><div className="pdp-actions"><AddToCartButton productId={product.id} /></div><div className="buy-trust"><span>Thoughtfully selected</span><span>Secure checkout when connected</span><span>Free shipping over ₹1,499</span></div><p className="responsible-note">A personal safety tool can support preparedness; it cannot guarantee personal safety.</p></div>
    </section>
    <section className="product-story shell section-pad"><div><p className="eyebrow dark">Why you’ll carry it</p><h2>Preparedness that<br /><em>fits the everyday.</em></h2></div><p>{product.shortDescription} Its compact format is intended to make keeping it close feel simple—not intimidating.</p></section>
    <section className="feature-band"><div className="shell"><p className="eyebrow">Key features</p><div>{product.features.map((feature, index) => <article key={feature}><span>0{index + 1}</span><h3>{feature}</h3></article>)}</div></div></section>
    <section className="how-product shell section-pad"><div className="section-heading"><div><p className="eyebrow dark">How it works</p><h2>Three clear<br /><em>moments.</em></h2></div><p>Review the instructions supplied with your product before relying on it.</p></div><ol>{product.howItWorks.map((step, index) => <li key={step.title}><span>0{index + 1}</span><h3>{step.title}</h3><p>{step.text}</p></li>)}</ol></section>
    <section className="scenarios"><div className="shell"><p className="eyebrow">Everyday scenarios</p><h2>Designed to stay<br /><em>within reach.</em></h2><div>{product.scenarios.map((scenario) => <span key={scenario}>{scenario}</span>)}</div></div></section>
    <section className="spec-section shell section-pad"><div><p className="eyebrow dark">Object details</p><h2>Specifications</h2></div><dl>{product.specifications.map((spec) => <div key={spec.label}><dt>{spec.label}</dt><dd>{spec.value}</dd></div>)}</dl><div className="included"><h3>What’s included</h3>{product.included.map((item) => <p key={item}>— {item}</p>)}</div></section>
    <section className="accordions shell"><details><summary>Shipping & delivery <span>＋</span></summary><p>Free shipping applies above ₹1,499, based on the current Whaleora policy. Final delivery timing is confirmed at checkout.</p></details><details><summary>Returns & support <span>＋</span></summary><p>For product and return support, contact hello@whaleora.com before sending an item back.</p></details></section>
    <section className="related shell section-pad"><div className="section-heading"><div><p className="eyebrow dark">You may also consider</p><h2>Build your<br /><em>everyday kit.</em></h2></div></div><div className="product-grid">{related.map((item, index) => <ProductCard key={item.id} product={item} index={index} />)}</div></section>
  </main>;
}
