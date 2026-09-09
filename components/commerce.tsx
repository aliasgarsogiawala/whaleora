'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, ShoppingCart } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import type { CSSProperties } from 'react';
import { addToCartAction, getCartAction, removeCartLineAction, updateCartLineAction } from '@/app/actions/cart';
import type { CatalogProduct } from '@/lib/shopify/catalog';
import type { CartState, CartStateLine } from '@/lib/shopify/types';
import { whatsappHref } from '@/lib/content/contact';
import { formatPrice, products } from '@/data/products';

/** Product as rendered by the shop: local editorial plus whatever Shopify knows. */
export type ShopProduct = CatalogProduct;

const FREE_SHIPPING_THRESHOLD = 1499;

const emptyCart: CartState = {
  connected: false,
  id: null,
  checkoutUrl: null,
  currencyCode: 'INR',
  subtotal: 0,
  totalQuantity: 0,
  lines: [],
};

type CartContextValue = {
  cart: CartState;
  pending: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
  add: (product: ShopProduct, quantity?: number) => void;
  update: (line: CartStateLine, quantity: number) => void;
  remove: (line: CartStateLine) => void;
  count: number;
};

const CartContext = createContext<CartContextValue | null>(null);

const LOCAL_KEY = 'whaleora-cart';
const matchesLocalLine = (line: CartStateLine, productId: string, variantId: string | null) => line.productId === productId && line.variantId === variantId;

/** Local-bag maths, used only while Shopify is unreachable or unconfigured. */
const localLine = (product: ShopProduct, quantity: number): CartStateLine => ({
  id: null,
  productId: product.id,
  variantId: product.shopify?.variantId ?? null,
  handle: product.shopify?.handle ?? product.slug,
  title: product.title,
  quantity,
  unitPrice: product.price,
  currencyCode: product.currencyCode ?? 'INR',
});

const recalculate = (lines: CartStateLine[]): CartState => ({
  ...emptyCart,
  lines,
  subtotal: lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0),
  totalQuantity: lines.reduce((sum, line) => sum + line.quantity, 0),
  currencyCode: lines[0]?.currencyCode ?? 'INR',
});

export function CommerceProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartState>(emptyCart);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [pending, startTransition] = useTransition();

  // Read the Shopify cart from its cookie. If the store is not connected, fall
  // back to whatever the previous local-only bag held.
  useEffect(() => {
    let active = true;
    getCartAction()
      .then((serverCart) => {
        if (!active) return;
        if (serverCart.connected) {
          setCart(serverCart);
          setReady(true);
          return;
        }
        try {
          const saved = window.localStorage.getItem(LOCAL_KEY);
          if (saved) setCart(recalculate(JSON.parse(saved) as CartStateLine[]));
        } catch { /* device storage may be unavailable */ }
        setReady(true);
      })
      .catch(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!ready || cart.connected) return;
    try {
      window.localStorage.setItem(LOCAL_KEY, JSON.stringify(cart.lines));
    } catch { /* device storage may be unavailable */ }
  }, [cart, ready]);

  const applyLocal = useCallback((next: (lines: CartStateLine[]) => CartStateLine[]) => {
    setCart((current) => recalculate(next(current.lines)));
  }, []);

  const add = useCallback((product: ShopProduct, quantity = 1) => {
    setOpen(true);
    const variantId = product.shopify?.variantId;
    if (cart.connected && variantId) {
      startTransition(async () => {
        const next = await addToCartAction(variantId, quantity);
        if (next.connected) setCart(next);
      });
      return;
    }
    applyLocal((lines) => {
      const exists = lines.find((line) => matchesLocalLine(line, product.id, variantId ?? null));
      return exists
        ? lines.map((line) => matchesLocalLine(line, product.id, variantId ?? null) ? { ...line, quantity: line.quantity + quantity } : line)
        : [...lines, localLine(product, quantity)];
    });
  }, [applyLocal, cart.connected]);

  const update = useCallback((line: CartStateLine, quantity: number) => {
    if (cart.connected && line.id) {
      startTransition(async () => {
        const next = await updateCartLineAction(line.id!, quantity);
        if (next.connected) setCart(next);
      });
      return;
    }
    applyLocal((lines) => quantity < 1
      ? lines.filter((item) => !matchesLocalLine(item, line.productId, line.variantId))
      : lines.map((item) => matchesLocalLine(item, line.productId, line.variantId) ? { ...item, quantity } : item));
  }, [applyLocal, cart.connected]);

  const remove = useCallback((line: CartStateLine) => {
    if (cart.connected && line.id) {
      startTransition(async () => {
        const next = await removeCartLineAction(line.id!);
        if (next.connected) setCart(next);
      });
      return;
    }
    applyLocal((lines) => lines.filter((item) => !matchesLocalLine(item, line.productId, line.variantId)));
  }, [applyLocal, cart.connected]);

  const value = useMemo<CartContextValue>(
    () => ({ cart, pending, open, setOpen, add, update, remove, count: cart.totalQuantity }),
    [cart, pending, open, add, update, remove],
  );

  return <CartContext.Provider value={value}>{children}<CartDrawer /></CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error('useCart must be used inside CommerceProvider');
  return value;
}

const NAV_LINKS = [
  { href: '/products', label: 'Shop' },
  { href: '/safety-hub', label: 'Safety Hub' },
  { href: '/about', label: 'About' },
  { href: '/institutions', label: 'Partnerships' },
];

const MENU_LINKS = [...NAV_LINKS, { href: '/contact', label: 'Contact' }];

/** A link is current on its own page and on anything nested beneath it. */
const isCurrent = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);

function useOverlayFocus(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open || !ref.current) return;
    const panel = ref.current;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusable = () => Array.from(panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input, select, textarea, [tabindex="0"]')).filter((element) => element.getClientRects().length > 0);
    focusable()[0]?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); close(); }
      if (event.key !== 'Tab') return;
      const elements = focusable();
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && (document.activeElement === first || !panel.contains(document.activeElement))) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !panel.contains(document.activeElement))) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener('keydown', onKey); previous?.focus(); };
  }, [open, close]);
  return ref;
}

export function Header() {
  const { count, setOpen } = useCart();
  const pathname = usePathname() ?? '/';
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const menuRef = useOverlayFocus(menuOpen, closeMenu);
  const [scrolled, setScrolled] = useState(false);
  // On a page with a full-bleed hero the header sits on the photograph until
  // the hero has scrolled past, so the image runs the full height of the frame.
  const [overHero, setOverHero] = useState(false);
  useEffect(() => {
    const hero = document.querySelector<HTMLElement>('[data-hero-overlay]');
    const onScroll = () => {
      setScrolled(window.scrollY > 30);
      setOverHero(hero ? hero.getBoundingClientRect().bottom > 120 : false);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [pathname]);

  return (
    <>
      <div className="announcement"><span>Free shipping over ₹1,499 · Delivered across India</span></div>
      <header className={`site-header ${scrolled ? 'is-scrolled' : ''} ${overHero ? 'is-over-hero' : ''}`}>
        <button className="menu-button" onClick={() => setMenuOpen(true)} aria-label="Open menu" aria-expanded={menuOpen}><span /><span /></button>
        <Link href="/" className="brand" aria-label="Whaleora home"><Image src="/brand/whaleora-logo.svg" width={186} height={48} alt="Whaleora" priority /></Link>
        <nav aria-label="Primary navigation">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} aria-current={isCurrent(pathname, link.href) ? 'page' : undefined}>{link.label}</Link>
          ))}
        </nav>
        <div className="header-actions">
          <Link href="/contact" className="contact-link" aria-current={isCurrent(pathname, '/contact') ? 'page' : undefined}>Contact</Link>
          <button className="cart-button" onClick={() => setOpen(true)} aria-label={`Open cart with ${count} items`}>
            <ShoppingCart className="nav-cart-icon" size={20} strokeWidth={1.6} aria-hidden="true" />
            {/* Keyed on the count so the badge replays its pop each time the bag changes. */}
            <span key={count} className="cart-count" data-empty={count === 0}>{count}</span>
          </button>
        </div>
      </header>
      <div ref={menuRef} className={`mobile-menu ${menuOpen ? 'open' : ''}`} role="dialog" aria-modal={menuOpen || undefined} aria-label="Navigation menu" aria-hidden={!menuOpen} inert={!menuOpen}>
        <button className="menu-close" onClick={() => setMenuOpen(false)} aria-label="Close menu"><span /><span /></button>
        <nav>
          {MENU_LINKS.map((link, index) => (
            <Link
              key={link.href}
              href={link.href}
              style={{ '--i': index } as CSSProperties}
              aria-current={isCurrent(pathname, link.href) ? 'page' : undefined}
              onClick={() => setMenuOpen(false)}
            >
              <small>0{index + 1}</small>{link.label}<ArrowUpRight size={17} strokeWidth={1.5} aria-hidden="true" />
            </Link>
          ))}
        </nav>
        <div className="mobile-menu-footer">
          <Link href="/products" className="button button-primary menu-cta" onClick={() => setMenuOpen(false)}>Shop from ₹299 <span>→</span></Link>
          <p>Prepared, not afraid.<br />Designed in India.</p>
        </div>
      </div>
    </>
  );
}

/** Local record for a cart line, so the drawer keeps the site's own imagery and links. */
const localRecord = (line: CartStateLine) =>
  products.find((product) => product.id === line.productId)
  ?? products.find((product) => product.slug === line.handle);

function CartDrawer() {
  const { cart, pending, open, setOpen, update, remove } = useCart();
  const closeCart = useCallback(() => setOpen(false), [setOpen]);
  const drawerRef = useOverlayFocus(open, closeCart);
  const [checkoutNote, setCheckoutNote] = useState(false);
  const { subtotal, currencyCode, lines } = cart;
  const shippingGap = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  const checkout = () => {
    if (cart.checkoutUrl) {
      window.location.href = cart.checkoutUrl;
      return;
    }
    setCheckoutNote(true);
  };

  return (
    <div ref={drawerRef} className={`cart-layer ${open ? 'open' : ''}`} role="dialog" aria-modal={open || undefined} aria-label="Shopping bag" aria-hidden={!open} inert={!open}>
      <button className="cart-backdrop" onClick={() => setOpen(false)} aria-label="Close cart" />
      <aside className="cart-drawer" aria-label="Shopping bag" aria-busy={pending}>
        <div className="cart-head"><div><small>Your selection</small><h2>Shopping bag <sup>{cart.totalQuantity}</sup></h2></div><button onClick={() => setOpen(false)} aria-label="Close cart">×</button></div>
        {lines.length === 0 ? (
          <div className="empty-cart"><span>○</span><h3>Nothing in here yet.</h3><p>Four objects, starting at ₹299. Most people begin with the alarm.</p><Link href="/products" onClick={() => setOpen(false)} className="button button-primary">Browse all four →</Link></div>
        ) : (
          <>
            <div className="shipping-progress"><div><span style={{ width: `${Math.min(100, subtotal / FREE_SHIPPING_THRESHOLD * 100)}%` }} /></div><p>{shippingGap ? `${formatPrice(shippingGap, currencyCode)} away from free shipping.` : 'You have unlocked free shipping.'}</p></div>
            <div className="cart-lines">{lines.map((line) => {
              const record = localRecord(line);
              // A Shopify-only line may carry no handle; then the title is plain text.
              const lineSlug = record?.slug ?? line.handle;
              return <div className="cart-line" key={line.id ?? line.variantId ?? line.productId}>
                <Image src={record?.images[0] ?? '/products/survival-whistle-mockup.webp'} width={130} height={130} alt="" />
                <div><small>{record?.category ?? 'Whaleora'}</small>{lineSlug ? <Link href={`/products/${lineSlug}`} onClick={() => setOpen(false)}>{line.title}</Link> : line.title}<strong>{formatPrice(line.unitPrice, line.currencyCode)}</strong><div className="quantity"><button onClick={() => update(line, line.quantity - 1)} disabled={pending} aria-label="Decrease quantity">−</button><span>{line.quantity}</span><button onClick={() => update(line, line.quantity + 1)} disabled={pending} aria-label="Increase quantity">+</button></div><button className="remove" onClick={() => remove(line)} disabled={pending}>Remove</button></div>
              </div>;
            })}</div>
            <div className="cart-total"><div><span>Subtotal</span><strong>{formatPrice(subtotal, currencyCode)}</strong></div><p>Taxes included. Shipping calculated at checkout.</p><button className="button button-primary" onClick={checkout} disabled={pending}>{pending ? 'Updating…' : 'Checkout securely'} <span>→</span></button>{checkoutNote && !cart.checkoutUrl && <p className="drawer-note" role="status">Checkout isn’t connected on this build yet. To order now, message us on <a href={whatsappHref("Hi Whaleora! I'd like to place an order.")}>WhatsApp</a> or email hello@whaleora.com.</p>}</div>
          </>
        )}
      </aside>
    </div>
  );
}

export function AddToCartButton({ product, quantity = 1, className = '', label = 'Add to bag' }: { product: ShopProduct; quantity?: number; className?: string; label?: string }) {
  const { add, pending } = useCart();
  const soldOut = product.shopify ? !product.shopify.availableForSale : false;
  if (soldOut) return <button className={`button button-primary ${className}`} disabled>Sold out</button>;
  return <button className={`button button-primary ${className}`} onClick={() => add(product, quantity)} disabled={pending}>{pending ? 'Adding…' : label} <span>→</span></button>;
}

export function ProductCard({ product, index = 0 }: { product: ShopProduct; index?: number }) {
  const { add, pending } = useCart();
  const soldOut = product.shopify ? !product.shopify.availableForSale : false;
  return (
    <article className="product-card" style={{ '--accent': product.accent } as React.CSSProperties}>
      <Link href={`/products/${product.slug}`} className="product-visual">
        <small>0{index + 1} · {product.category}</small>
        <Image src={product.slug === 'pepperspray' ? '/products/pepper-spray-product.webp' : product.images[0]} width={700} height={700} alt={product.title} sizes="(max-width: 1100px) 50vw, 25vw" />
        <span>View object ↗</span>
      </Link>
      <div className="product-meta"><div><Link href={`/products/${product.slug}`}>{product.title}</Link><small>{product.shortDescription}</small></div><strong>{formatPrice(product.price, product.currencyCode)}</strong></div>
      <button className="quick-add" onClick={() => add(product)} disabled={soldOut || pending} aria-label={`Add ${product.title} to bag`}>{soldOut ? 'Sold out' : 'Add to bag'} <span>{soldOut ? '—' : '＋'}</span></button>
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
      <section className="community-signup"><p className="eyebrow">The monthly note</p><div><h2>One email a month. No fear-mongering.</h2><form onSubmit={(event) => { event.preventDefault(); if (email) setSent(true); }}><label htmlFor="community-email">A checklist, a short read, and anything new we’ve made. Unsubscribe in one click.</label><div><input id="community-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Your email address" required /><button type="submit" aria-label="Subscribe">{sent ? 'Thank you' : 'Join'} →</button></div></form></div></section>
      <section className="footer-main"><div className="footer-brand"><Image src="/brand/whaleora-logo.svg" width={220} height={60} alt="Whaleora" /><p>Prepared,<br />not afraid.</p><address>Sambhaji Nagar, Thane<br />Maharashtra, India</address></div><div className="footer-links">{groups.map((group) => <div key={group.title}><h3>{group.title}</h3>{group.links.map(([label, href]) => <Link href={href} key={label}>{label}</Link>)}</div>)}</div></section>
      <div className="footer-bottom"><span>© 2026 Whaleora</span><div><a href="mailto:hello@whaleora.com">hello@whaleora.com</a><a href="https://www.instagram.com/whaleora.safety">Instagram ↗</a><a href="https://www.linkedin.com/company/whaleora-safety/">LinkedIn ↗</a></div></div>
      <div className="footer-word">WHALEORA</div>
    </footer>
  );
}
