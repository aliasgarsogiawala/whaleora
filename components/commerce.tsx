'use client';

import Image from 'next/image';
import Link from 'next/link';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Product } from '@/data/products';
import { formatPrice, products } from '@/data/products';

type CartLine = { productId: string; quantity: number };
type CartContextValue = {
  lines: CartLine[];
  open: boolean;
  setOpen: (open: boolean) => void;
  add: (productId: string, quantity?: number) => void;
  update: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  count: number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CommerceProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      try {
        const saved = window.localStorage.getItem('whaleora-cart');
        if (saved) setLines(JSON.parse(saved));
      } catch { /* device storage may be unavailable */ }
      setReady(true);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (ready) window.localStorage.setItem('whaleora-cart', JSON.stringify(lines));
  }, [lines, ready]);

  const add = (productId: string, quantity = 1) => {
    setLines((current) => {
      const exists = current.find((line) => line.productId === productId);
      return exists
        ? current.map((line) => line.productId === productId ? { ...line, quantity: line.quantity + quantity } : line)
        : [...current, { productId, quantity }];
    });
    setOpen(true);
  };
  const update = (productId: string, quantity: number) => setLines((current) => quantity < 1 ? current.filter((line) => line.productId !== productId) : current.map((line) => line.productId === productId ? { ...line, quantity } : line));
  const remove = (productId: string) => setLines((current) => current.filter((line) => line.productId !== productId));
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);

  return <CartContext.Provider value={{ lines, open, setOpen, add, update, remove, count }}>{children}<CartDrawer /></CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error('useCart must be used inside CommerceProvider');
  return value;
}

export function Header() {
  const { count, setOpen } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <div className="announcement">Free shipping on orders above ₹1,499</div>
      <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
        <button className="menu-button" onClick={() => setMenuOpen(true)} aria-label="Open menu"><span /><span /></button>
        <Link href="/" className="brand" aria-label="Whaleora home"><Image src="/brand/whaleora-logo.svg" width={186} height={48} alt="Whaleora" priority /></Link>
        <nav aria-label="Primary navigation">
          <Link href="/products">Shop</Link><Link href="/safety-hub">Safety Hub</Link><Link href="/about">About</Link><Link href="/institutions">Partnerships</Link>
        </nav>
        <div className="header-actions">
          <Link href="/contact" className="contact-link">Contact</Link>
          <button className="cart-button" onClick={() => setOpen(true)} aria-label={`Open cart with ${count} items`}>Bag <span>{count}</span></button>
        </div>
      </header>
      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`} aria-hidden={!menuOpen}>
        <button onClick={() => setMenuOpen(false)} aria-label="Close menu">Close ×</button>
        <nav>
          {['Shop', 'Safety Hub', 'About', 'Partnerships', 'Contact'].map((label, index) => {
            const href = ['/products', '/safety-hub', '/about', '/institutions', '/contact'][index];
            return <Link key={label} href={href} onClick={() => setMenuOpen(false)}><small>0{index + 1}</small>{label}<span>↗</span></Link>;
          })}
        </nav>
        <p>Prepared, not afraid.<br />Designed in India.</p>
      </div>
    </>
  );
}

function CartDrawer() {
  const { lines, open, setOpen, update, remove } = useCart();
  const detailed = lines.map((line) => ({ ...line, product: products.find((product) => product.id === line.productId)! })).filter((line) => line.product);
  const subtotal = detailed.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  const shippingGap = Math.max(0, 1499 - subtotal);

  return (
    <div className={`cart-layer ${open ? 'open' : ''}`} aria-hidden={!open}>
      <button className="cart-backdrop" onClick={() => setOpen(false)} aria-label="Close cart" />
      <aside className="cart-drawer" aria-label="Shopping bag">
        <div className="cart-head"><div><small>Your selection</small><h2>Shopping bag <sup>{detailed.reduce((sum, line) => sum + line.quantity, 0)}</sup></h2></div><button onClick={() => setOpen(false)} aria-label="Close cart">×</button></div>
        {detailed.length === 0 ? (
          <div className="empty-cart"><span>○</span><h3>Ready when you are.</h3><p>Your everyday safety essentials will appear here.</p><Link href="/products" onClick={() => setOpen(false)} className="button button-primary">Explore the collection →</Link></div>
        ) : (
          <>
            <div className="shipping-progress"><div><span style={{ width: `${Math.min(100, subtotal / 1499 * 100)}%` }} /></div><p>{shippingGap ? `${formatPrice(shippingGap)} away from free shipping.` : 'You have unlocked free shipping.'}</p></div>
            <div className="cart-lines">{detailed.map(({ product, quantity }) => <div className="cart-line" key={product.id}>
              <Image src={product.images[0]} width={130} height={130} alt="" />
              <div><small>{product.category}</small><Link href={`/products/${product.slug}`} onClick={() => setOpen(false)}>{product.title}</Link><strong>{formatPrice(product.price)}</strong><div className="quantity"><button onClick={() => update(product.id, quantity - 1)} aria-label="Decrease quantity">−</button><span>{quantity}</span><button onClick={() => update(product.id, quantity + 1)} aria-label="Increase quantity">+</button></div><button className="remove" onClick={() => remove(product.id)}>Remove</button></div>
            </div>)}</div>
            <div className="cart-total"><div><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div><p>Taxes included. Shipping calculated at checkout.</p><button className="button button-primary" onClick={() => window.alert('Prototype checkout — connect Whaleora’s commerce backend to continue.')}>Checkout <span>→</span></button></div>
          </>
        )}
      </aside>
    </div>
  );
}

export function AddToCartButton({ productId, quantity = 1, className = '' }: { productId: string; quantity?: number; className?: string }) {
  const { add } = useCart();
  return <button className={`button button-primary ${className}`} onClick={() => add(productId, quantity)}>Add to bag <span>→</span></button>;
}

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { add } = useCart();
  return (
    <article className="product-card" style={{ '--accent': product.accent } as React.CSSProperties}>
      <Link href={`/products/${product.slug}`} className="product-visual">
        <small>0{index + 1} · {product.category}</small>
        <Image src={product.images[0]} width={700} height={700} alt={product.title} sizes="(max-width: 700px) 50vw, 25vw" />
        <span>View object ↗</span>
      </Link>
      <div className="product-meta"><div><Link href={`/products/${product.slug}`}>{product.title}</Link><small>{product.shortDescription}</small></div><strong>{formatPrice(product.price)}</strong></div>
      <button className="quick-add" onClick={() => add(product.id)} aria-label={`Add ${product.title} to bag`}>Quick add <span>＋</span></button>
    </article>
  );
}

export function Footer() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const groups = useMemo(() => [
    { title: 'Shop', links: [['Shop all', '/products'], ['SOS Alarm', '/products/sos-alarm'], ['Pepper Spray', '/products/pepperspray']] },
    { title: 'Explore', links: [['Our story', '/about'], ['Safety Hub', '/safety-hub'], ['Partnerships', '/institutions']] },
    { title: 'Support', links: [['Contact & FAQ', '/contact'], ['Shipping', '/contact'], ['Returns', '/contact']] },
  ], []);
  return (
    <footer className="footer">
      <section className="community-signup"><p className="eyebrow">Join the Whaleora movement</p><div><h2>Safer people.<br /><em>Stronger communities.</em></h2><form onSubmit={(event) => { event.preventDefault(); if (email) setSent(true); }}><label htmlFor="community-email">Practical tips, checklists, launches and workshops.</label><div><input id="community-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Your email address" required /><button type="submit" aria-label="Subscribe">{sent ? 'Thank you' : 'Join'} →</button></div></form></div></section>
      <section className="footer-main"><div className="footer-brand"><Image src="/brand/whaleora-logo.svg" width={220} height={60} alt="Whaleora" /><p>Your Safety.<br />Our Priority.</p><address>Sambhaji Nagar, Thane<br />Maharashtra, India</address></div><div className="footer-links">{groups.map((group) => <div key={group.title}><h3>{group.title}</h3>{group.links.map(([label, href]) => <Link href={href} key={label}>{label}</Link>)}</div>)}</div></section>
      <div className="footer-bottom"><span>© 2026 Whaleora</span><div><a href="mailto:hello@whaleora.com">hello@whaleora.com</a><a href="https://www.instagram.com/whaleora.safety">Instagram ↗</a><a href="https://www.linkedin.com/company/whaleora-safety/">LinkedIn ↗</a></div></div>
      <div className="footer-word">WHALEORA</div>
    </footer>
  );
}
