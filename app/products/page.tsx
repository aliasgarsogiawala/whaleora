'use client';

import { useMemo, useState } from 'react';
import { ProductCard } from '@/components/commerce';
import { products } from '@/data/products';

export default function ProductsPage() {
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('featured');
  const shown = useMemo(() => {
    const filtered = category === 'All' ? [...products] : products.filter((product) => product.category === category);
    if (sort === 'low') filtered.sort((a, b) => a.price - b.price);
    if (sort === 'high') filtered.sort((a, b) => b.price - a.price);
    if (sort === 'name') filtered.sort((a, b) => a.title.localeCompare(b.title));
    return filtered;
  }, [category, sort]);

  return <main className="page-main">
    <section className="collection-hero"><div className="shell"><p className="eyebrow dark">The Whaleora collection</p><h1>Everyday objects.<br /><em>Quiet confidence.</em></h1><p>Practical personal-safety essentials chosen to fit naturally into the life you already live.</p></div></section>
    <section className="shop-section shell section-pad"><div className="filters"><div role="group" aria-label="Filter products by category">{['All', 'Alarms', 'Tools'].map((item) => <button key={item} className={category === item ? 'active' : ''} onClick={() => setCategory(item)}>{item}<sup>{item === 'All' ? products.length : products.filter((product) => product.category === item).length}</sup></button>)}</div><label>Sort <select value={sort} onChange={(event) => setSort(event.target.value)}><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option><option value="name">Name</option></select></label></div><div className="product-grid">{shown.map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}</div></section>
    <section className="shop-note shell"><p>Not sure where to begin?</p><h2>Start with the object you will actually carry.</h2><span>The best safety tool is one that stays accessible and becomes part of your routine.</span></section>
  </main>;
}
