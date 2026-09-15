'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { clearCardAction, loadCardAction, saveCardAction } from '@/app/actions/emergency-card';
import { blankCard, cardLimit, isCardEmpty, toCard, type CardData } from '@/lib/emergency-card';

/**
 * The emergency contact card the Safety Hub has been promising as a tool.
 *
 * The card is rendered and printed by the device, and localStorage remains the
 * copy that works with no network — the whole point of a card for when your
 * phone does not. It is also saved to the account, keyed on the signed-in
 * customer's email or an opaque device id, so it survives a cleared browser and
 * follows a signed-in owner to a new device. The page says so plainly: this
 * holds medical details and a home address, and people should not have to guess
 * where it goes.
 */

const STORAGE_KEY = 'whaleora-emergency-card';
/** Long enough that a save is a pause in typing, short enough to feel saved. */
const SAVE_DEBOUNCE_MS = 1200;

const bloodGroups = ['A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−', 'Not known'] as const;

export const emergencyNumbers = [
  { label: 'All emergencies', number: '112', note: 'Police, fire and ambulance' },
  { label: 'Women helpline', number: '1091' },
  { label: 'Police', number: '100' },
  { label: 'Ambulance', number: '108' },
  { label: 'Fire', number: '101' },
];

const blank = blankCard;

/** Placeholder copy doubles as an example of how much detail is useful. */
const sample: CardData = {
  name: 'Your name',
  blood: '',
  notes: 'Allergies or medication',
  contactOneName: 'First contact',
  contactOneRelation: 'Relationship',
  contactOnePhone: '+91 00000 00000',
  contactTwoName: 'Second contact',
  contactTwoRelation: 'Relationship',
  contactTwoPhone: '+91 00000 00000',
  address: 'Where you live',
};

const Mark = ({ light = false }: { light?: boolean }) => (
  // A plain img, not next/image: this element is printed, and print jobs are
  // more predictable without the optimiser's srcset in the way.
  // eslint-disable-next-line @next/next/no-img-element
  <img src="/brand/whaleora-fin.svg" alt="" aria-hidden="true" className={`ec-mark ${light ? 'is-light' : ''}`} />
);

const show = (value: string, fallback: string) => value.trim() || fallback;
const faded = (value: string) => (value.trim() ? '' : 'is-placeholder');

/** One physical face of the card. Shared by the on-screen preview and print. */
function CardFront({ data }: { data: CardData }) {
  const blood = data.blood && data.blood !== 'Not known' ? data.blood : '';

  return (
    <div className="ec-face ec-front">
      <header className="ec-stripe">
        <span>In case of emergency</span>
        <Mark />
      </header>

      <div className="ec-identity">
        <p className={`ec-name ${faded(data.name)}`}>{show(data.name, sample.name)}</p>
        <span className={`ec-blood ${blood ? '' : 'is-empty'}`} aria-label={blood ? `Blood group ${blood}` : 'Blood group not set'}>
          {blood || 'Blood'}
        </span>
      </div>

      <p className={`ec-notes ${faded(data.notes)}`}>{show(data.notes, sample.notes)}</p>

      <div className="ec-contacts">
        <span className="ec-kicker">Please call</span>
        <ul>
          <li>
            <b className={faded(data.contactOnePhone)}>{show(data.contactOnePhone, sample.contactOnePhone)}</b>
            <strong className={faded(data.contactOneName)}>{show(data.contactOneName, sample.contactOneName)}</strong>
            <small className={faded(data.contactOneRelation)}>{show(data.contactOneRelation, sample.contactOneRelation)}</small>
          </li>
          <li>
            <b className={faded(data.contactTwoPhone)}>{show(data.contactTwoPhone, sample.contactTwoPhone)}</b>
            <strong className={faded(data.contactTwoName)}>{show(data.contactTwoName, sample.contactTwoName)}</strong>
            <small className={faded(data.contactTwoRelation)}>{show(data.contactTwoRelation, sample.contactTwoRelation)}</small>
          </li>
        </ul>
      </div>
    </div>
  );
}

function CardBack({ data }: { data: CardData }) {
  const [primary, ...rest] = emergencyNumbers;
  return (
    <div className="ec-face ec-back">
      <header className="ec-stripe">
        <span>Emergency numbers · India</span>
        <Mark light />
      </header>

      <div className="ec-primary">
        <strong>{primary.number}</strong>
        <span>{primary.label}<i>{primary.note}</i></span>
      </div>

      <ul className="ec-number-grid">
        {rest.map((item) => (
          <li key={item.number}><b>{item.number}</b><span>{item.label}</span></li>
        ))}
      </ul>

      <div className="ec-address">
        <span className="ec-kicker">Home address</span>
        <p className={data.address.trim() ? '' : 'is-placeholder'}>{data.address.trim() || sample.address}</p>
      </div>
    </div>
  );
}

export function EmergencyCard() {
  const formId = useId();
  const [data, setData] = useState<CardData>(blank);
  const [restored, setRestored] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Restore after mount so the server and client first paint agree. Deferred
  // a microtask, matching how SafetyHubExplorer reads its own initial state.
  useEffect(() => {
    let active = true;
    queueMicrotask(async () => {
      if (!active) return;
      let local: CardData | null = null;
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved) local = toCard(JSON.parse(saved));
      } catch { /* private mode, or storage is blocked */ }
      if (local && !isCardEmpty(local)) setData(local);

      // The stored card wins only where the device has nothing, so a card
      // being edited offline is never overwritten by an older saved copy.
      try {
        const stored = await loadCardAction();
        if (active && stored && (!local || isCardEmpty(local))) setData(stored.card);
      } catch { /* storage is optional; the device copy still works */ }
      if (active) setRestored(true);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!restored) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch { /* nothing we can do, and nothing worth interrupting for */ }
  }, [data, restored]);

  // Saved on a pause in typing rather than every keystroke, so a card is not
  // written to the account character by character. Driven from the edit itself
  // rather than an effect on `data`: saving is a response to what someone
  // typed, not state to be synchronised, and the restore below must not trigger
  // a save of the card it just read back.
  const pending = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (pending.current) clearTimeout(pending.current); }, []);

  const scheduleSave = useCallback((next: CardData) => {
    if (pending.current) clearTimeout(pending.current);
    if (isCardEmpty(next)) return;
    setStatus('saving');
    pending.current = setTimeout(() => {
      void saveCardAction(next).then((result) => setStatus(result.ok ? 'saved' : 'idle'));
    }, SAVE_DEBOUNCE_MS);
  }, []);

  const set = (key: keyof CardData) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const next = { ...data, [key]: event.target.value.slice(0, cardLimit(key)) };
    setData(next);
    scheduleSave(next);
  };

  const clear = useCallback(() => {
    if (pending.current) clearTimeout(pending.current);
    setData(blank);
    setStatus('idle');
    try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* see above */ }
    void clearCardAction();
  }, []);

  const field = (key: keyof CardData, label: string, extra?: React.InputHTMLAttributes<HTMLInputElement>) => (
    <label className="ec-field">
      <span>{label}</span>
      <input
        type="text"
        value={data[key]}
        onChange={set(key)}
        autoComplete="off"
        spellCheck={false}
        {...extra}
      />
    </label>
  );

  return (
    <section className="emergency-card section-pad" id="emergency-card" aria-labelledby={`${formId}-title`}>
      <div className="shell">
        <div className="ec-heading">
          <div>
            <p className="eyebrow">Free tool · Works offline, saved so you can get it back</p>
            <h2 id={`${formId}-title`}>The card that works<br /><em>when your phone doesn’t.</em></h2>
          </div>
          <p>
            A dead battery, a stolen bag, or a hand too shaky to unlock a screen — that’s when the
            number you need is the one you can’t reach. Fill this in, print it, and keep it in your
            wallet behind a card you rarely take out.
          </p>
        </div>

        <div className="ec-board">
          <form className="ec-form" onSubmit={(event) => event.preventDefault()}>
            <fieldset>
              <legend>About you</legend>
              <div className="ec-row">
                {field('name', 'Full name', { autoComplete: 'name' })}
                <label className="ec-field ec-field-narrow">
                  <span>Blood group</span>
                  <select value={data.blood} onChange={set('blood')}>
                    <option value="">Select</option>
                    {bloodGroups.map((group) => <option key={group} value={group}>{group}</option>)}
                  </select>
                </label>
              </div>
              {field('notes', 'Allergies, conditions or medication', { placeholder: 'e.g. Penicillin allergy · Type 1 diabetes' })}
            </fieldset>

            <fieldset>
              <legend>Who to call</legend>
              {field('contactOnePhone', 'First phone number', { type: 'tel', inputMode: 'tel' })}
              <div className="ec-row">
                {field('contactOneName', 'Name')}
                {field('contactOneRelation', 'Relationship', { placeholder: 'Mother, flatmate…' })}
              </div>
              {field('contactTwoPhone', 'Second phone number', { type: 'tel', inputMode: 'tel' })}
              <div className="ec-row">
                {field('contactTwoName', 'Name')}
                {field('contactTwoRelation', 'Relationship')}
              </div>
            </fieldset>

            <fieldset>
              <legend>On the back</legend>
              {field('address', 'Home address', { placeholder: 'Street, area and pin code' })}
            </fieldset>

            <p className="ec-privacy">
              This card prints from your browser and keeps working with no signal. A copy is saved to
              Whaleora so you can get it back if this device is lost or wiped — including the medical
              notes, address and contacts you enter here. Signed in, it follows your account to a new
              device. <strong>Clear</strong> deletes both copies.
            </p>
          </form>

          <div className="ec-preview">
            <div className="ec-deck">
              <div className="ec-live" aria-label="Card front">
                <CardFront data={data} />
              </div>
              <div className="ec-live" aria-label="Card back">
                <CardBack data={data} />
              </div>
            </div>

            <div className="ec-controls">
              <p className="ec-print-note">Prints at wallet size (85.6 × 54 mm). Fold along the dotted line for a double-sided card.</p>
              <div className="ec-actions">
                <button type="button" className="button button-primary" onClick={() => window.print()}>Print the card <span aria-hidden="true"><ArrowRight size={16} strokeWidth={2} /></span></button>
                <button type="button" className="ec-clear" onClick={clear}>Clear</button>
                <span className="ec-save-state" role="status" aria-live="polite">
                  {status === 'saving' ? 'Saving…' : status === 'saved' ? 'Saved' : ''}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="ec-numbers">
          <span className="ec-kicker">Or just tap, right now</span>
          <ul>
            {emergencyNumbers.map((item) => (
              <li key={item.number}>
                <a href={`tel:${item.number}`}>
                  <b>{item.number}</b>
                  <span>{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Print-only sheet: exact physical size, front above back, fold between. */}
      <div className="ec-print" aria-hidden="true">
        <div className="ec-print-card"><CardFront data={data} /></div>
        <div className="ec-fold" />
        <div className="ec-print-card ec-print-flip"><CardBack data={data} /></div>
      </div>
    </section>
  );
}
