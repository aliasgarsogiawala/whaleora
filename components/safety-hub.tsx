'use client';

import { ProductImage } from '@/components/product-image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { guideCategories, guides } from '@/data/guides';
import { formatPrice, PRODUCT_IMAGE_FALLBACK } from '@/data/products';
import {
  hubProfiles,
  numberById,
  type HubChecklist,
  type HubProfile,
} from '@/data/safety-hub';
import { ArrowRight } from 'lucide-react';

export type HubCatalogItem = {
  slug: string;
  title: string;
  shortDescription: string;
  price: number;
  currencyCode?: string;
  images: string[];
};

function toolLabel(tool: HubProfile['tools'][number], checklistById: Map<string, HubChecklist>) {
  if (tool.kind === 'card') return { title: tool.title, description: tool.description, action: tool.href.startsWith('/') ? 'Open' : 'Open the tool' };
  const checklist = checklistById.get(tool.checklistId);
  return {
    title: checklist?.title ?? 'Checklist',
    description: checklist?.description ?? '',
    action: 'Open checklist',
  };
}

export function SafetyHubExplorer({ checklists, catalog }: { checklists: HubChecklist[]; catalog: HubCatalogItem[] }) {
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [profileId, setProfileId] = useState(hubProfiles[0].id);
  const [sheet, setSheet] = useState<HubChecklist | null>(null);
  const checklistById = useMemo(() => new Map(checklists.map((item) => [item.id, item])), [checklists]);
  const getProduct = (slug: string) => catalog.find((item) => item.slug === slug);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get('profile');
    const fromCategory = params.get('category');
    if (fromQuery && hubProfiles.some((item) => item.id === fromQuery)) setProfileId(fromQuery);
    if (fromCategory && guideCategories.includes(fromCategory)) setCategory(fromCategory);
  }, []);

  useEffect(() => {
    if (!sheet) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSheet(null);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [sheet]);

  const profile = hubProfiles.find((item) => item.id === profileId) ?? hubProfiles[0];
  const numbers = profile.numbers.map((id) => numberById.get(id)).filter(Boolean);
  const shown = useMemo(
    () =>
      guides.filter(
        (guide) =>
          (category === 'All' || guide.category === category) &&
          `${guide.title} ${guide.excerpt} ${guide.category}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [category, query],
  );

  const selectProfile = (id: string) => {
    setProfileId(id);
    const next = hubProfiles.find((item) => item.id === id);
    if (next && next.libraryCategory !== 'All') setCategory(next.libraryCategory);
    const url = new URL(window.location.href);
    url.searchParams.set('profile', id);
    window.history.replaceState(null, '', url);
  };

  const openTool = (tool: HubProfile['tools'][number]) => {
    if (tool.kind === 'checklist') {
      const checklist = checklistById.get(tool.checklistId);
      if (checklist) setSheet(checklist);
      return;
    }
    if (tool.href.startsWith('#')) {
      document.querySelector(tool.href)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    window.location.assign(tool.href);
  };

  return (
    <>
      <section className="profile-lab section-pad" id="profiles" aria-labelledby="profile-lab-title">
        <div className="shell profile-lab-heading">
          <div>
            <p className="eyebrow dark">Who are you today?</p>
            <h2 id="profile-lab-title">Choose a profile.<br />We’ll personalise the rest.</h2>
          </div>
          <p>Nothing is saved. Pick the closest fit and the Safety Centre will bring the right numbers, tools and products forward.</p>
        </div>
        <div className="shell profile-picker" role="tablist" aria-label="Choose your safety context">
          {hubProfiles.map((item) => (
            <button
              key={item.id}
              id={`profile-tab-${item.id}`}
              role="tab"
              type="button"
              aria-selected={profileId === item.id}
              aria-controls="hub-centre"
              className={profileId === item.id ? 'active' : ''}
              onClick={() => selectProfile(item.id)}
            >
              <small>{item.context}</small>
              <strong>{item.short}</strong>
            </button>
          ))}
        </div>
      </section>

      <section className="hub-centre" id="hub-centre" role="tabpanel" aria-labelledby={`profile-tab-${profile.id}`} key={profile.id}>
        <div className="shell">
          <header className="hub-centre-head">
            <div>
              <p className="eyebrow dark">Personalised Safety Centre</p>
              <h2>{profile.title}</h2>
              <p>{profile.subtitle}</p>
            </div>
            <ul className="hub-stats">
              <li><b>{String(profile.tools.length).padStart(2, '0')}</b><span>Toolkit</span></li>
              <li><b>{String(profile.tools.filter((tool) => tool.kind === 'checklist').length).padStart(2, '0')}</b><span>Checklists</span></li>
              <li><b>{String(profile.products.length).padStart(2, '0')}</b><span>Products</span></li>
              <li><b>{String(profile.programmes.length).padStart(2, '0')}</b><span>Programmes</span></li>
            </ul>
          </header>

          <p className="hub-centre-intro">{profile.intro}</p>

          <div className="hub-centre-grid">
            <article className="hub-block">
              <p className="eyebrow dark">Gear</p>
              <h3>Hardware we actually sell.</h3>
              <div className="hub-products">
                {profile.products.map((slug) => {
                  const product = getProduct(slug);
                  if (!product) return null;
                  return (
                    <Link key={product.slug} href={`/products/${product.slug}`} className="hub-product">
                      <span className="hub-product-visual">
                        <ProductImage src={product.images[0] || PRODUCT_IMAGE_FALLBACK} alt="" fill sizes="160px" />
                      </span>
                      <span>
                        <small>{formatPrice(product.price, product.currencyCode ?? 'INR')}</small>
                        <strong>{product.title}</strong>
                        <span>{product.shortDescription}</span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </article>

            <article className="hub-block">
              <p className="eyebrow dark">Important numbers</p>
              <h3>Emergency contacts for {profile.short.toLowerCase()}.</h3>
              <ul className="hub-numbers">
                {numbers.map((item) =>
                  item ? (
                    <li key={item.id}>
                      {item.number ? (
                        <a href={`tel:${item.number}`}>
                          <strong>{item.label}</strong>
                          <span>{item.number}</span>
                        </a>
                      ) : (
                        <div>
                          <strong>{item.label}</strong>
                          <span>{item.note}</span>
                        </div>
                      )}
                    </li>
                  ) : null,
                )}
              </ul>
            </article>

            <article className="hub-block hub-brief">
              <p className="eyebrow dark">Today’s safety brief</p>
              <h3>Personalised guidance.</h3>
              <ul>
                {profile.brief.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </article>
          </div>

          <article className="hub-block hub-toolkit">
            <p className="eyebrow dark">Small actions. Big difference.</p>
            <h3>Toolkit for {profile.title.toLowerCase()}.</h3>
            <div className="hub-tools">
              {profile.tools.map((tool) => {
                const copy = toolLabel(tool, checklistById);
                return (
                  <button type="button" key={copy.title} onClick={() => openTool(tool)}>
                    <small>{tool.kind === 'checklist' ? 'Checklist' : 'Tool'}</small>
                    <strong>{copy.title}</strong>
                    <span>{copy.description}</span>
                    <em>{copy.action} <ArrowRight size={15} strokeWidth={2} aria-hidden="true" /></em>
                  </button>
                );
              })}
            </div>
          </article>
        </div>
      </section>

      <section className="hub-search shell" id="library">
        <label>
          <span>Search the library</span>
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try “travel”, “campus” or “late shift”" />
        </label>
        <div>
          {guideCategories.map((item) => (
            <button key={item} type="button" className={category === item ? 'active' : ''} onClick={() => setCategory(item)}>
              {item}
            </button>
          ))}
        </div>
      </section>

      <section className="guide-library shell section-pad">
        <div className="library-heading">
          <p className="eyebrow dark">The library</p>
          <span>{shown.length.toString().padStart(2, '0')} resources</span>
        </div>
        <div className="guide-grid">
          {shown.map((guide, index) => (
            <article className={`guide-card ${guide.tone}`} key={guide.title}>
              <div>
                <small>
                  {guide.type} · {guide.time}
                </small>
                <span>0{index + 1}</span>
              </div>
              <h2>{guide.title}</h2>
              <p>{guide.excerpt}</p>
              {guide.href ? (
                <a className="guide-open" href={guide.href}>
                  Open the tool <span aria-hidden="true">↓</span>
                </a>
              ) : guide.checklistId ? (
                <button
                  type="button"
                  className="guide-open"
                  onClick={() => {
                    const checklist = checklistById.get(guide.checklistId!);
                    if (checklist) setSheet(checklist);
                  }}
                >
                  Open checklist <span aria-hidden="true"><ArrowRight size={16} strokeWidth={2} /></span>
                </button>
              ) : (
                <span className="guide-soon">Publishing soon</span>
              )}
            </article>
          ))}
        </div>
        {shown.length === 0 && (
          <div className="no-results">
            <h2>No exact match yet.</h2>
            <p>Try a broader phrase or choose another category.</p>
          </div>
        )}
      </section>

      {sheet && (
        <div className="hub-sheet" role="dialog" aria-modal="true" aria-labelledby="hub-sheet-title">
          <button type="button" className="hub-sheet-backdrop" aria-label="Close checklist" onClick={() => setSheet(null)} />
          <div className="hub-sheet-panel">
            <p className="eyebrow dark">Checklist</p>
            <h2 id="hub-sheet-title">{sheet.title}</h2>
            <p>{sheet.description}</p>
            <ol>
              {sheet.items.map((item, index) => (
                <li key={item}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  {item}
                </li>
              ))}
            </ol>
            <div className="hub-sheet-actions">
              <button type="button" className="button button-primary" onClick={() => window.print()}>
                Print this <span aria-hidden="true"><ArrowRight size={16} strokeWidth={2} /></span>
              </button>
              <button type="button" className="button button-outline" onClick={() => setSheet(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
