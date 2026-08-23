import Link from 'next/link';
import { EmergencyCard, SafetyHubExplorer } from '@/components/safety-hub';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Safety Hub — Whaleora', description: 'Practical personal-safety guides, checklists, tools and programmes for everyday confidence.' };

export default function SafetyHubPage() {
  return <main className="page-main safety-page">
    <section className="safety-hero"><div className="shell"><p className="eyebrow">Whaleora Safety Hub</p><h1>Learn. Prepare.<br /><em>Move confidently.</em></h1><p>Practical guides, checklists and tools for everyday life—without fear-led language or information overload.</p><a href="#library" className="button button-light">Explore the library ↓</a></div></section>
    <section className="featured-guide shell section-pad"><div><p className="eyebrow dark">Featured field note</p><h2>Ten everyday<br /><em>safety habits.</em></h2><p>Personal safety is not about living on alert. It is about making a few useful choices ahead of time, then getting on with your day.</p><button onClick={undefined}>7 min read · Coming soon</button></div><ol><li><span>01</span>Keep important contacts accessible.</li><li><span>02</span>Make key tools easy to reach.</li><li><span>03</span>Review unfamiliar journeys before leaving.</li><li><span>04</span>Let someone know when plans change.</li><li><span>05</span>Trust the quiet signal that something feels off.</li></ol></section>
    <div id="library"><SafetyHubExplorer /></div>
    <EmergencyCard />
    <section className="workshop-cta"><div className="shell"><p className="eyebrow">For institutions & communities</p><h2>Bring preparedness<br /><em>into the room.</em></h2><p>Explore awareness sessions and practical programmes for campuses, workplaces and communities.</p><Link href="/institutions" className="button button-light">Explore partnerships →</Link></div></section>
  </main>;
}
