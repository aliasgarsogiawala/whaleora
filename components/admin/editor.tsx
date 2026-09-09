'use client';

import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import Link from 'next/link';
import { ArrowDown, ArrowUp, ArrowUpRight, Check, ChevronRight, Film, LogOut, MessageSquare, Plus, Settings2, Trash2 } from 'lucide-react';
import type { ContentDocument, ReviewContent, Testimonial, VideoReview } from '@/lib/content/types';
import { validateContent } from '@/lib/content/types';
import { TestimonialsMarquee } from '@/components/testimonials-marquee';

async function request(url: string, method: string, payload?: unknown) {
  const response = await fetch(url, { method, headers: payload ? { 'Content-Type': 'application/json' } : undefined, body: payload ? JSON.stringify(payload) : undefined });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'The request failed. Please try again.');
  return data;
}

export function AdminLogin({ setup, configured }: { setup: boolean; configured: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError('');
    const form = new FormData(event.currentTarget);
    if (setup && form.get('password') !== form.get('confirm')) { setError('The passwords do not match.'); setBusy(false); return; }
    try { await request('/api/admin/session', 'POST', { action: setup ? 'setup' : 'login', password: form.get('password') }); window.location.assign('/admin'); }
    catch (error) { setError((error as Error).message); setBusy(false); }
  }
  return <main className="admin-login"><div className="admin-login-card">
    <Link href="/" className="admin-wordmark">whaleora<span>®</span></Link><p className="admin-kicker">Your content, in your hands.</p>
    <h1>{setup ? 'Make yourself at home.' : 'Welcome back.'}</h1>
    <p>{setup ? 'Create an admin password to manage video reviews and written testimonials. Local setup only—you choose the password.' : 'Sign in to your content studio.'}</p>
    {(configured || setup) ? <form onSubmit={submit}>
      <Field label={setup ? 'Create password' : 'Password'}><input name="password" type="password" required minLength={setup ? 12 : 1} maxLength={200} autoComplete={setup ? 'new-password' : 'current-password'} autoFocus /></Field>
      {setup && <Field label="Confirm password"><input name="confirm" type="password" required minLength={12} maxLength={200} autoComplete="new-password" /><small>At least 12 characters. Store it somewhere safe.</small></Field>}
      {error && <p className="admin-error" role="alert">{error}</p>}
      <button className="admin-button primary" disabled={busy}>{busy ? 'One moment…' : setup ? 'Create password & enter' : 'Sign in'}<ChevronRight size={17} /></button>
    </form> : <p className="admin-error">Admin access needs configuration. Set ADMIN_PASSWORD and ADMIN_SESSION_SECRET on your server. See ADMIN.md in the project.</p>}
    <Link href="/" className="admin-back">← Back to the store</Link>
  </div><div className="admin-login-note"><span>THE CONTENT STUDIO</span><p>Good stories.<br /><em>Thoughtfully told.</em></p><small>Video reviews · Written testimonials · Your voice</small></div></main>;
}

function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="admin-field"><span>{label}</span>{children}</label>; }
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="admin-toggle"><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /><span>{label}</span></label>;
}
type Tab = 'testimonials' | 'videos' | 'settings' | 'preview';
const tabs = [{ id: 'testimonials', label: 'Written testimonials', icon: MessageSquare }, { id: 'videos', label: 'Video reviews', icon: Film }, { id: 'settings', label: 'Section settings', icon: Settings2 }] as const;

export function AdminEditor({ initial, uploadsEnabled, canSave }: { initial: ContentDocument; uploadsEnabled: boolean; canSave: boolean }) {
  const [document, setDocument] = useState(initial);
  const [content, setContent] = useState(initial.draft);
  const [tab, setTab] = useState<Tab>('testimonials');
  const [selectedId, setSelectedId] = useState(initial.draft.testimonials[0]?.id || '');
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const dirty = JSON.stringify(content) !== JSON.stringify(document.draft);
  const unpublished = JSON.stringify(content) !== JSON.stringify(document.published);
  useEffect(() => {
    if (!dirty) return;
    const guard = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', guard);
    return () => window.removeEventListener('beforeunload', guard);
  }, [dirty]);
  function navigate(next: Tab) { setTab(next); setSelectedId(next === 'testimonials' ? content.testimonials[0]?.id || '' : content.videos[0]?.id || ''); setNotice(''); }
  function updateWritten(id: string, patch: Partial<Testimonial>) { setContent((value) => ({ ...value, testimonials: value.testimonials.map((item) => item.id === id ? { ...item, ...patch } : item) })); setNotice(''); }
  function updateVideo(id: string, patch: Partial<VideoReview>) { setContent((value) => ({ ...value, videos: value.videos.map((item) => item.id === id ? { ...item, ...patch } : item) })); setNotice(''); }
  function setting<K extends keyof ReviewContent['settings']>(key: K, value: ReviewContent['settings'][K]) { setContent((current) => ({ ...current, settings: { ...current.settings, [key]: value } })); setNotice(''); }
  function add() {
    const id = crypto.randomUUID();
    if (tab === 'testimonials') setContent((value) => ({ ...value, testimonials: [...value.testimonials, { id, quote: '', name: '', detail: '', row: 1, visible: false, demo: true }] }));
    if (tab === 'videos') setContent((value) => ({ ...value, videos: [...value.videos, { id, title: '', product: '', slug: 'sos-alarm', poster: '', video: '', duration: '0:08', visible: false, demo: true }] }));
    setSelectedId(id); setNotice('');
  }
  function reorder(direction: -1 | 1) {
    if (tab !== 'testimonials' && tab !== 'videos') return;
    setContent((value) => {
      const list = [...value[tab]]; const index = list.findIndex((item) => item.id === selectedId); const next = index + direction;
      if (index < 0 || next < 0 || next >= list.length) return value;
      [list[index], list[next]] = [list[next], list[index]];
      return { ...value, [tab]: list };
    });
  }
  function remove() {
    if (tab !== 'testimonials' && tab !== 'videos') return;
    if (!window.confirm('Remove this review from the draft? The live store changes only when you publish.')) return;
    const list = content[tab].filter((item) => item.id !== selectedId);
    setContent((value) => ({ ...value, [tab]: list })); setSelectedId(list[0]?.id || '');
  }
  async function save(publish: boolean) {
    setError(''); setNotice('');
    try {
      const validated = validateContent(content);
      if (publish && !window.confirm('Publish these reviews and section settings to the live storefront?')) return;
      setBusy(true);
      const saved: ContentDocument = await request('/api/admin/content', 'PUT', { content: validated, revision: document.revision, publish });
      setDocument(saved); setContent(saved.draft); setNotice(publish ? 'Published. Your storefront is up to date.' : 'Draft saved. The live store has not changed.');
    } catch (error) { setError((error as Error).message); } finally { setBusy(false); }
  }
  async function reload() {
    if (dirty && !window.confirm('Discard unsaved edits and load the latest saved draft?')) return;
    setBusy(true); setError('');
    try { const latest = await request('/api/admin/content', 'GET'); setDocument(latest); setContent(latest.draft); setSelectedId(''); setNotice('Latest draft loaded.'); } catch (error) { setError((error as Error).message); } finally { setBusy(false); }
  }
  async function upload(file: File | undefined, key: 'poster' | 'video', id: string) {
    if (!file) return;
    setError(''); setUploading(true);
    try {
      if (file.size > (key === 'poster' ? 5 : 30) * 1024 * 1024) throw new Error(key === 'poster' ? 'Images must be under 5 MB.' : 'Videos must be under 30 MB.');
      const response = await fetch('/api/admin/upload', { method: 'POST', headers: { 'Content-Type': file.type }, body: file });
      const data = await response.json(); if (!response.ok) throw new Error(data.error);
      updateVideo(id, { [key]: data.url }); setNotice('Media uploaded. Save or publish to use it.');
    } catch (error) { setError((error as Error).message); } finally { setUploading(false); }
  }
  async function logout() {
    if (dirty && !window.confirm('Sign out and discard unsaved changes?')) return;
    setBusy(true);
    try { await request('/api/admin/session', 'DELETE'); window.location.assign('/admin'); } catch (error) { setError((error as Error).message); setBusy(false); }
  }
  const written = content.testimonials.find((item) => item.id === selectedId);
  const video = content.videos.find((item) => item.id === selectedId);
  const list = tab === 'testimonials' ? content.testimonials : content.videos;
  const index = list.findIndex((item) => item.id === selectedId);
  const locked = busy || uploading;
  return <div className="admin-app">
    <aside className="admin-sidebar"><Link href="/" target="_blank" className="admin-wordmark">whaleora<span>®</span></Link><p className="admin-kicker">Content studio</p>
      <nav aria-label="Admin sections">{tabs.map(({ id, label, icon: Icon }) => <button key={id} className={tab === id ? 'active' : ''} onClick={() => navigate(id)}><Icon size={18} />{label}<span>{id === 'settings' ? '' : content[id].length}</span></button>)}</nav>
      <div className="admin-sidebar-bottom"><a href="/" target="_blank" rel="noreferrer">View storefront <ArrowUpRight size={16} /></a><button onClick={logout} disabled={locked}><LogOut size={16} /> Sign out</button><small>Only published changes<br />appear on your store.</small></div>
    </aside>
    <main className="admin-main">
      <header className="admin-topbar"><div><span className="admin-kicker">Storefront / Reviews</span><h1>{tab === 'preview' ? 'Draft preview' : tabs.find((item) => item.id === tab)?.label}</h1></div><div className="admin-actions"><span className="admin-save-state">{dirty ? 'Unsaved changes' : unpublished ? 'Draft saved · not published' : 'All changes published'}</span><button className="admin-button" onClick={() => navigate(tab === 'preview' ? 'testimonials' : 'preview')}> {tab === 'preview' ? 'Back to editing' : 'Preview'}</button><button className="admin-button" onClick={() => save(false)} disabled={locked || !canSave || !dirty}>Save draft</button><button className="admin-button primary" onClick={() => save(true)} disabled={locked || !canSave || !unpublished}>{busy ? 'Saving…' : 'Publish'}<ArrowUpRight size={15} /></button></div></header>
      <div className="admin-body">
        {!canSave && <p className="admin-error">Connect Upstash Redis before saving on this hosted deployment. See ADMIN.md for configuration.</p>}
        {error && <div className="admin-error" role="alert">{error} <button onClick={reload} disabled={locked}>Reload saved draft</button></div>}
        {notice && <p className="admin-notice" role="status"><Check size={16} />{notice}</p>}
        <div className="admin-summary"><p>{tab === 'testimonials' ? 'The small details that make a story feel personal.' : tab === 'videos' ? 'A closer look, through your customers’ eyes.' : tab === 'settings' ? 'Set the rhythm of your review sections.' : 'A preview of your current edits—not yet published.'}</p><span>{document.publishedAt ? `Last published ${document.publishedAt.slice(0, 10)}` : 'Using starter demo content'}</span></div>
        {(tab === 'testimonials' || tab === 'videos') && <div className="admin-workspace">
          <section className="admin-list"><div className="admin-list-heading"><span>{list.filter((item) => item.visible).length} visible / {list.length} total</span><button className="admin-button" onClick={add} disabled={locked || list.length >= 40}><Plus size={16} /> Add</button></div>
            {list.map((item, i) => <button key={item.id} className={`admin-list-item ${selectedId === item.id ? 'selected' : ''}`} onClick={() => setSelectedId(item.id)}><span className="admin-number">{String(i + 1).padStart(2, '0')}</span><span><strong>{'quote' in item ? item.name || 'New testimonial' : item.title || 'New video review'}</strong><small>{'quote' in item ? item.quote || 'Add a quote to get started' : item.product || 'Add product details'}</small><em>{item.visible ? 'Visible' : 'Hidden'}{item.demo ? ' · Demo' : ''}{'row' in item ? ` · Row ${item.row}` : ''}</em></span><ChevronRight size={16} /></button>)}
            {!list.length && <p className="admin-empty">No reviews yet. Add your first one.</p>}
          </section>
          <section className="admin-editor-panel" aria-label="Review editor">
            {((tab === 'testimonials' && written) || (tab === 'videos' && video)) ? <>
              <div className="admin-panel-heading"><h2>{tab === 'testimonials' ? 'Edit testimonial' : 'Edit video review'}</h2><div><button className="admin-icon" aria-label="Move review up" disabled={index <= 0 || locked} onClick={() => reorder(-1)}><ArrowUp size={17} /></button><button className="admin-icon" aria-label="Move review down" disabled={index >= list.length - 1 || locked} onClick={() => reorder(1)}><ArrowDown size={17} /></button><button className="admin-icon danger" aria-label="Delete review" onClick={remove} disabled={locked}><Trash2 size={17} /></button></div></div>
              <fieldset disabled={locked} className="admin-fields">
                {tab === 'testimonials' && written && <>
                  <Field label="Quote"><textarea rows={5} maxLength={600} value={written.quote} onChange={(event) => updateWritten(written.id, { quote: event.target.value })} placeholder="Their experience, in their own words." /><small>{written.quote.length}/600 characters</small></Field>
                  <div className="admin-field-pair"><Field label="Customer name"><input value={written.name} maxLength={80} onChange={(event) => updateWritten(written.id, { name: event.target.value })} /></Field><Field label="Product or description"><input value={written.detail} maxLength={100} onChange={(event) => updateWritten(written.id, { detail: event.target.value })} /></Field></div>
                  <Field label="Marquee row"><select value={written.row} onChange={(event) => updateWritten(written.id, { row: Number(event.target.value) as 1 | 2 })}><option value={1}>Row 1 · scrolls left</option><option value={2}>Row 2 · scrolls right</option></select></Field>
                  <Toggle label="Visible on the storefront" checked={written.visible} onChange={(visible) => updateWritten(written.id, { visible })} /><Toggle label="Demo / fictional testimonial" checked={written.demo} onChange={(demo) => updateWritten(written.id, { demo })} />
                  <div className="admin-card-preview"><span className="admin-kicker">Card preview</span><figure className="written-review"><blockquote>“{written.quote || 'Your customer’s words will appear here.'}”</blockquote><figcaption><i /><strong>{written.name || 'Customer name'}</strong><span>{written.detail}{written.demo ? ' · Demo' : ''}</span></figcaption></figure></div>
                </>}
                {tab === 'videos' && video && <>
                  <Field label="Review title"><input maxLength={120} value={video.title} onChange={(event) => updateVideo(video.id, { title: event.target.value })} /></Field>
                  <div className="admin-field-pair"><Field label="Product name"><input maxLength={100} value={video.product} onChange={(event) => updateVideo(video.id, { product: event.target.value })} /></Field><Field label="Product URL slug"><input maxLength={100} value={video.slug} onChange={(event) => updateVideo(video.id, { slug: event.target.value })} /><small>/products/{video.slug || 'product-slug'}</small></Field></div>
                  {(['video', 'poster'] as const).map((key) => <div key={key}><Field label={key === 'video' ? 'Video URL' : 'Thumbnail URL'}><input value={video[key]} maxLength={2048} placeholder={key === 'video' ? 'https://…/review.mp4' : 'https://…/thumbnail.jpg'} onChange={(event) => updateVideo(video.id, { [key]: event.target.value })} /><small>HTTPS URL or a local path beginning with /</small></Field>{uploadsEnabled && <Field label={key === 'video' ? 'Or upload MP4 · max 30 MB' : 'Or upload JPG, PNG, WebP · max 5 MB'}><input type="file" accept={key === 'video' ? 'video/mp4' : 'image/jpeg,image/png,image/webp'} onChange={(event) => { void upload(event.target.files?.[0], key, video.id); event.target.value = ''; }} /></Field>}</div>)}
                  <Field label="Duration (m:ss)"><input value={video.duration} maxLength={8} placeholder="0:30" onChange={(event) => updateVideo(video.id, { duration: event.target.value })} /></Field>
                  <Toggle label="Visible on the storefront" checked={video.visible} onChange={(visible) => updateVideo(video.id, { visible })} /><Toggle label="Demo / sample video" checked={video.demo} onChange={(demo) => updateVideo(video.id, { demo })} />
                  {video.video && <video className="admin-video-preview" key={`${video.id}-${video.video}`} src={video.video} poster={video.poster} controls playsInline preload="metadata" aria-label="Review video preview" />}
                </>}
                <p className="admin-help">Only turn off the demo label for genuine customer content you have permission to use.</p>
              </fieldset>
            </> : <div className="admin-empty"><MessageSquare size={26} /><h2>Room for another story.</h2><p>Select a review, or add a new one to get started.</p></div>}
          </section>
        </div>}
        {tab === 'settings' && <fieldset className="admin-settings admin-fields" disabled={locked}>
          <section><h2>Written testimonials</h2><Toggle label="Show testimonial marquee" checked={content.settings.showWritten} onChange={(value) => setting('showWritten', value)} /><Field label="Section heading"><input maxLength={160} value={content.settings.writtenTitle} onChange={(event) => setting('writtenTitle', event.target.value)} /></Field><Field label="Subtitle (optional)"><textarea maxLength={300} rows={2} value={content.settings.writtenSubtitle} onChange={(event) => setting('writtenSubtitle', event.target.value)} /></Field><Field label={`Scroll duration · ${content.settings.marqueeSeconds} seconds`}><input type="range" min={20} max={180} step={5} value={content.settings.marqueeSeconds} onChange={(event) => setting('marqueeSeconds', Number(event.target.value))} /><small>Higher is slower. The second row runs 10 seconds slower.</small></Field></section>
          <section><h2>Video reviews</h2><Toggle label="Show horizontal video carousel" checked={content.settings.showVideos} onChange={(value) => setting('showVideos', value)} /><Field label="Section heading"><textarea maxLength={160} rows={2} value={content.settings.videoTitle} onChange={(event) => setting('videoTitle', event.target.value)} /><small>Use a new line to split the heading.</small></Field><Field label="Subtitle (optional)"><textarea maxLength={300} rows={2} value={content.settings.videoSubtitle} onChange={(event) => setting('videoSubtitle', event.target.value)} /></Field></section>
        </fieldset>}
        {tab === 'preview' && <div className="admin-preview"><TestimonialsMarquee items={content.testimonials} settings={content.settings} />{!content.settings.showWritten && <p>Written testimonials are hidden.</p>}{content.settings.showVideos ? <section><h2 style={{ whiteSpace: 'pre-line' }}>{content.settings.videoTitle}</h2><p>{content.settings.videoSubtitle}</p><small>Media preview below. The storefront displays these in the horizontal coverflow carousel.</small><div className="admin-preview-videos">{content.videos.filter((item) => item.visible).map((item) => <article key={item.id}><video src={item.video} poster={item.poster} controls playsInline preload="none" /><h3>{item.title}</h3><p>{item.product} · {item.duration}{item.demo ? ' · Demo' : ''}</p></article>)}</div></section> : <p>Video reviews are hidden.</p>}</div>}
      </div>
    </main>
  </div>;
}
