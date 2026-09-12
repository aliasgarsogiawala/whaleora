'use client';

import { useEffect, useId, useState } from 'react';

/**
 * The emergency contact card the Safety Hub has been promising as a tool.
 *
 * Everything typed here stays in this browser: the card is rendered locally,
 * saved to localStorage and printed by the device. Nothing is sent anywhere,
 * which is the whole point of a card that works when your phone does not.
 */

const STORAGE_KEY = 'whaleora-emergency-card';

const bloodGroups = ['A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−', 'Not known'] as const;

export const emergencyNumbers = [
  { label: 'All emergencies', number: '112', note: 'Police, fire and ambulance' },
  { label: 'Women helpline', number: '1091' },
  { label: 'Police', number: '100' },
  { label: 'Ambulance', number: '108' },
  { label: 'Fire', number: '101' },
];

type CardData = {
  name: string;
  blood: string;
  notes: string;
  contactOneName: string;
  contactOneRelation: string;
  contactOnePhone: string;
  contactTwoName: string;
  contactTwoRelation: string;
  contactTwoPhone: string;
  address: string;
};

const blank: CardData = {
  name: '', blood: '', notes: '',
  contactOneName: '', contactOneRelation: '', contactOnePhone: '',
  contactTwoName: '', contactTwoRelation: '', contactTwoPhone: '',
  address: '',
};

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

  // Restore after mount so the server and client first paint agree. Deferred
  // a microtask, matching how SafetyHubExplorer reads its own initial state.
  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved) setData({ ...blank, ...(JSON.parse(saved) as Partial<CardData>) });
      } catch { /* private mode, or storage is blocked */ }
      setRestored(true);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!restored) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch { /* nothing we can do, and nothing worth interrupting for */ }
  }, [data, restored]);

  const set = (key: keyof CardData) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setData((current) => ({ ...current, [key]: event.target.value }));

  const clear = () => {
    setData(blank);
    try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* see above */ }
  };

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
            <p className="eyebrow">Free tool · Nothing leaves this device</p>
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
              This card is built in your browser and saved only here. We never receive it, and it is
              not sent anywhere when you print.
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
                <button type="button" className="button button-primary" onClick={() => window.print()}>Print the card <span>→</span></button>
                <button type="button" className="ec-clear" onClick={clear}>Clear</button>
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
