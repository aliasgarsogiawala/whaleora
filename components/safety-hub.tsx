'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { guideCategories, guides, personas } from '@/data/guides';

export function SafetyHubExplorer() {
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  useEffect(() => {
    const selected = new URLSearchParams(window.location.search).get('category');
    if (selected && guideCategories.includes(selected)) setCategory(selected);
  }, []);
  const shown = useMemo(() => guides.filter((guide) => (category === 'All' || guide.category === category) && `${guide.title} ${guide.excerpt} ${guide.category}`.toLowerCase().includes(query.toLowerCase())), [category, query]);
  return <>
    <section className="hub-search shell"><label><span>Search the library</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try “travel” or “campus”" /></label><div>{guideCategories.map((item) => <button key={item} className={category === item ? 'active' : ''} onClick={() => setCategory(item)}>{item}</button>)}</div></section>
    <section className="guide-library shell section-pad"><div className="library-heading"><p className="eyebrow dark">The library</p><span>{shown.length.toString().padStart(2, '0')} resources</span></div><div className="guide-grid">{shown.map((guide, index) => <article className={`guide-card ${guide.tone}`} key={guide.title}><div><small>{guide.type} · {guide.time}</small><span>0{index + 1}</span></div><h2>{guide.title}</h2><p>{guide.excerpt}</p><button onClick={() => window.alert('Prototype resource — connect Whaleora’s published guide to open the full article.')}>Open resource ↗</button></article>)}</div>{shown.length === 0 && <div className="no-results"><h2>No exact match yet.</h2><p>Try a broader phrase or choose another category.</p></div>}</section>
    <section className="persona-hub shell section-pad"><div className="section-heading"><div><p className="eyebrow dark">Your context</p><h2>Choose a<br /><em>starting point.</em></h2></div></div><div className="persona-grid">{personas.map((persona, index) => <button key={persona.title} onClick={() => { setCategory(persona.category); document.querySelector('.hub-search')?.scrollIntoView({ behavior: 'smooth' }); }}><small>0{index + 1}</small><h3>{persona.title}</h3><p>{persona.description}</p><span>Show resources ↗</span></button>)}</div></section>
  </>;
}

export function EmergencyCard() {
  const numbers = [{ label: 'Emergency response', number: '112' }, { label: 'Women helpline', number: '1091' }, { label: 'Police', number: '100' }, { label: 'Ambulance', number: '108' }];
  return <section className="emergency-numbers"><div className="shell"><div><p className="eyebrow">Keep these close</p><h2>Important<br /><em>numbers.</em></h2><p>Availability can vary by location. Use India’s unified emergency number 112 where appropriate.</p></div><div>{numbers.map((item) => <a href={`tel:${item.number}`} key={item.number}><small>{item.label}</small><strong>{item.number}</strong><span>Call ↗</span></a>)}</div></div></section>;
}
