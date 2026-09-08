'use client';

import { useEffect, useMemo, useState } from 'react';
import { guideCategories, guides } from '@/data/guides';

const profileDetails = [
  {
    title: 'Women',
    category: "Women's Safety",
    context: 'Everyday movement',
    heading: 'Confidence without the constant vigilance.',
    intro: 'A calm starting point for solo commutes, shared rides and the moments when your instincts ask you to change the plan.',
    steps: ['Choose one person for journey check-ins.', 'Keep your everyday safety tool within reach.', 'Leave first when something feels wrong; explain later.'],
  },
  {
    title: 'Students',
    category: 'Student Safety',
    context: 'Campus & shared living',
    heading: 'A plan that still works when class runs late.',
    intro: 'Useful routines for campus days, new neighbourhoods and the blurred line between studying, socialising and getting home.',
    steps: ['Save campus security and one local contact.', 'Agree on a late-night check-in with a friend.', 'Look at the last-mile route before leaving.'],
  },
  {
    title: 'Travellers',
    category: 'Travel',
    context: 'Transit & new places',
    heading: 'Stay curious. Make the boring decisions early.',
    intro: 'Preparation for cabs, stations, unfamiliar stays and the small pieces of information that matter when your phone does not.',
    steps: ['Share the stay and arrival details once.', 'Keep a paper copy of one key contact.', 'Check local transport before landing.'],
  },
  {
    title: 'Professionals',
    category: 'Workplace',
    context: 'Commutes & field work',
    heading: 'For the day that ends later than planned.',
    intro: 'A practical end-of-day routine for office teams, independent workers and anyone moving between appointments alone.',
    steps: ['Set an after-hours travel policy with your team.', 'Tell one person when the plan changes.', 'Move calls and keys within reach before leaving.'],
  },
  {
    title: 'Families',
    category: 'Family',
    context: 'Shared preparedness',
    heading: 'One plan, understood by everyone at home.',
    intro: 'Simple, age-appropriate ways to agree on contacts, meeting points and what to do when family members cannot reach each other.',
    steps: ['Choose one out-of-area family contact.', 'Write down a familiar meeting place.', 'Practise the plan once without making it scary.'],
  },
  {
    title: 'Institutions',
    category: 'All',
    context: 'Schools, teams & communities',
    heading: 'Turn individual habits into shared practice.',
    intro: 'A useful first look for people shaping safety culture across campuses, workplaces, schools and community groups.',
    steps: ['Map the help already available on site.', 'Make escalation routes visible and specific.', 'Give people resources they can revisit privately.'],
  },
] as const;

export function SafetyHubExplorer() {
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [selectedProfile, setSelectedProfile] = useState(0);
  useEffect(() => {
    const selected = new URLSearchParams(window.location.search).get('category');
    if (!selected || !guideCategories.includes(selected)) return;
    let active = true;
    queueMicrotask(() => {
      if (active) setCategory(selected);
    });
    return () => { active = false; };
  }, []);
  const shown = useMemo(() => guides.filter((guide) => (category === 'All' || guide.category === category) && `${guide.title} ${guide.excerpt} ${guide.category}`.toLowerCase().includes(query.toLowerCase())), [category, query]);
  const profile = profileDetails[selectedProfile];
  const profileResourceCount = profile.category === 'All' ? guides.length : guides.filter((guide) => guide.category === profile.category).length;

  const showProfileResources = () => {
    setCategory(profile.category);
    setQuery('');
    document.querySelector('.hub-search')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return <>
    <section className="profile-lab section-pad" aria-labelledby="profile-lab-title">
      <div className="shell profile-lab-heading">
        <div><p className="eyebrow dark">A useful place to begin</p><h2 id="profile-lab-title">What does today<br />look like for you?</h2></div>
        <p>Choose the closest fit. The page will make a starting plan and bring the most relevant resources forward—nothing is saved.</p>
      </div>
      <div className="shell profile-lab-board">
        <div className="profile-index" role="tablist" aria-label="Choose your safety context">
          {profileDetails.map((item, index) => <button key={item.title} id={`profile-tab-${index}`} role="tab" aria-selected={selectedProfile === index} aria-controls="profile-panel" className={selectedProfile === index ? 'active' : ''} onClick={() => setSelectedProfile(index)}><span>0{index + 1}</span><strong>{item.title}</strong><small>{item.context}</small><i aria-hidden="true">↗</i></button>)}
        </div>
        <article className="profile-panel" id="profile-panel" role="tabpanel" aria-live="polite" aria-labelledby={`profile-tab-${selectedProfile}`} key={profile.title}>
          <div className="profile-panel-top"><span>{profile.context}</span><small>{profileResourceCount.toString().padStart(2, '0')} relevant {profileResourceCount === 1 ? 'resource' : 'resources'}</small></div>
          <div className="profile-panel-copy"><p>For {profile.title.toLowerCase()}</p><h3>{profile.heading}</h3><p>{profile.intro}</p></div>
          <ol>{profile.steps.map((step, index) => <li key={step}><span>0{index + 1}</span>{step}</li>)}</ol>
          <button className="profile-action" onClick={showProfileResources}>Bring my resources forward <span>↓</span></button>
        </article>
      </div>
    </section>
    <section className="hub-search shell"><label><span>Search the library</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try “travel”, “campus” or “late shift”" /></label><div>{guideCategories.map((item) => <button key={item} className={category === item ? 'active' : ''} onClick={() => setCategory(item)}>{item}</button>)}</div></section>
    <section className="guide-library shell section-pad"><div className="library-heading"><p className="eyebrow dark">The library</p><span>{shown.length.toString().padStart(2, '0')} resources</span></div><div className="guide-grid">{shown.map((guide, index) => <article className={`guide-card ${guide.tone}`} key={guide.title}><div><small>{guide.type} · {guide.time}</small><span>0{index + 1}</span></div><h2>{guide.title}</h2><p>{guide.excerpt}</p>{guide.href ? <a className="guide-open" href={guide.href}>Open the tool <span aria-hidden="true">↓</span></a> : <span className="guide-soon">Publishing soon</span>}</article>)}</div>{shown.length === 0 && <div className="no-results"><h2>No exact match yet.</h2><p>Try a broader phrase or choose another category.</p></div>}</section>
  </>;
}
