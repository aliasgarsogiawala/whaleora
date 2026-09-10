'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, MessageCircle, Send, X } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { greetingText, type FaqEntry, type FaqLink } from '@/lib/content/faq';
import { whatsappHref } from '@/lib/content/contact';
import { replyToFaq, starterQuestions, topicPrompts } from '@/lib/faq/engine';
import { MAX_QUESTION_LENGTH, redactSensitive, safeHref, sanitizeQuestion } from '@/lib/faq/guard';
import { cooldownMessage, createRateLimiter, type RateLimiter } from '@/lib/faq/rate-limit';

type ChatMessage = {
  id: string;
  role: 'bot' | 'user';
  text: string;
  links?: FaqLink[];
  suggestions?: FaqEntry[];
  tone?: 'notice';
};

const WHATSAPP = whatsappHref('Hi Whaleora! I have an inquiry.');
const delay = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

/** The thread is the only place a message lives, so it stays bounded. */
const MAX_HISTORY = 60;
const trimHistory = (messages: ChatMessage[]) =>
  messages.length > MAX_HISTORY ? messages.slice(messages.length - MAX_HISTORY) : messages;

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path
        fill="currentColor"
        d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
      />
    </svg>
  );
}

function Answer({ text }: { text: string }) {
  return (
    <div className="faq-bot-answer">
      {text.split('\n\n').map((paragraph, index) => (
        <p key={index}>
          {paragraph.split('\n').map((line, lineIndex) => (
            <span key={lineIndex}>{lineIndex > 0 && <br />}{line}</span>
          ))}
        </p>
      ))}
    </div>
  );
}

function LinkRow({ links, onNavigate }: { links?: FaqLink[]; onNavigate: () => void }) {
  const safe = (links ?? []).flatMap((link) => {
    const href = safeHref(link.href);
    return href ? [{ ...link, href }] : [];
  });
  if (!safe.length) return null;
  return (
    <div className="faq-bot-links">
      {safe.map((link) => {
        const external = /^https?:/.test(link.href);
        return link.href.startsWith('/') ? (
          <Link key={link.href} href={link.href} onClick={onNavigate}>
            {link.label} <ArrowUpRight size={14} strokeWidth={1.75} aria-hidden="true" />
          </Link>
        ) : (
          <a key={link.href} href={link.href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined}>
            {link.label} <ArrowUpRight size={14} strokeWidth={1.75} aria-hidden="true" />
          </a>
        );
      })}
    </div>
  );
}

export function FaqBot({ variant = 'widget' }: { variant?: 'widget' | 'page' }) {
  const pathname = usePathname();
  const panelId = useId();
  const inputId = useId();
  const scroller = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(variant === 'page');
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    variant === 'page'
      ? [{ id: 'welcome', role: 'bot', text: greetingText, suggestions: starterQuestions }]
      : [],
  );
  const [cooldown, setCooldown] = useState(0);
  const [misses, setMisses] = useState(0);
  const [lastQuestion, setLastQuestion] = useState('');
  const limiterRef = useRef<RateLimiter | null>(null);
  const seq = useRef(0);

  const onProduct = /^\/products\/[^/]+/.test(pathname);
  const hideWidget = variant === 'widget' && pathname === '/contact';
  const visible = !hideWidget && (variant === 'page' || open);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing, visible]);

  useEffect(() => {
    if (!visible) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && variant === 'widget') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visible, variant]);

  useEffect(() => {
    if (visible && variant === 'widget') inputRef.current?.focus();
  }, [visible, variant]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => setCooldown((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  const push = (message: Omit<ChatMessage, 'id'>) => {
    seq.current += 1;
    const id = `m${seq.current}`;
    setMessages((current) => trimHistory([...current, { ...message, id }]));
  };

  const pushBot = async (query: string) => {
    setTyping(true);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduced) await delay(Math.min(900, 280 + query.length * 8));
    const reply = replyToFaq(query, pathname, misses);
    setMisses((count) => (reply.missed ? count + 1 : 0));
    push({ role: 'bot', text: reply.text, links: reply.links, suggestions: reply.suggestions });
    setTyping(false);
  };

  const ask = (query: string) => {
    const text = sanitizeQuestion(query);
    if (!text || typing || cooldown > 0) return;

    const limiter = (limiterRef.current ??= createRateLimiter());
    const verdict = limiter();
    if (!verdict.ok) {
      setCooldown(Math.ceil(verdict.retryAfterMs / 1000));
      push({ role: 'bot', tone: 'notice', text: cooldownMessage(verdict), links: verdict.scope === 'session' ? [{ label: 'WhatsApp a person', href: WHATSAPP }] : undefined });
      return;
    }

    setInput('');
    setLastQuestion(redactSensitive(text));
    push({ role: 'user', text: redactSensitive(text) });
    void pushBot(text);
  };

  // Two misses in a row means the FAQ set genuinely does not cover this, so hand
  // the shopper's own wording to a person rather than making them retype it.
  const escalation =
    misses >= 2 && !typing && lastQuestion
      ? whatsappHref(`Hi Whaleora! The site assistant couldn’t answer this: "${lastQuestion}"`)
      : null;

  const openWidget = () => {
    setOpen(true);
    setMessages((current) =>
      current.length
        ? current
        : [{ id: 'welcome', role: 'bot', text: greetingText, suggestions: starterQuestions }],
    );
  };

  const panel = (
    <section
      className="faq-bot-panel"
      id={panelId}
      role={variant === 'widget' ? 'dialog' : 'region'}
      aria-modal={variant === 'widget' || undefined}
      aria-label="Whaleora FAQ assistant"
    >
      <header className="faq-bot-head">
        <div>
          <p className="eyebrow dark">FAQ assistant</p>
          <h2>Ask Whaleora</h2>
          <p>Straight answers from the catalogue. A person is one tap away.</p>
        </div>
        {variant === 'widget' && (
          <button type="button" className="faq-bot-close" onClick={() => setOpen(false)} aria-label="Close FAQ assistant">
            <X size={18} strokeWidth={1.75} />
          </button>
        )}
      </header>

      <div className="faq-bot-topics" aria-label="Browse topics">
        {topicPrompts.map((topic) => (
          <button type="button" key={topic.id} onClick={() => ask(topic.prompt)} disabled={typing || cooldown > 0}>
            {topic.label}
          </button>
        ))}
      </div>

      <div className="faq-bot-thread" ref={scroller} role="log" aria-live="polite" aria-relevant="additions">
        {messages.map((message) => {
          const suggestions = message.suggestions?.slice(0, 3) ?? [];
          return (
            <article key={message.id} className={`faq-bot-msg is-${message.role}`}>
              {message.role === 'bot' && <span className="faq-bot-avatar" aria-hidden="true">W</span>}
              <div className="faq-bot-msg-body">
                <div className={`faq-bot-bubble ${message.tone === 'notice' ? 'is-notice' : ''}`}>
                  <Answer text={message.text} />
                </div>
                <LinkRow links={message.links} onNavigate={() => variant === 'widget' && setOpen(false)} />
                {suggestions.length > 0 && (
                  <div className="faq-bot-chips">
                    <p>Related</p>
                    {suggestions.map((entry) => (
                      <button type="button" key={entry.id} onClick={() => ask(entry.question)} disabled={typing || cooldown > 0}>
                        {entry.question}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </article>
          );
        })}
        {typing && (
          <article className="faq-bot-msg is-bot" aria-label="Assistant is typing">
            <span className="faq-bot-avatar" aria-hidden="true">W</span>
            <div className="faq-bot-msg-body">
              <div className="faq-bot-bubble is-typing">
                <div className="faq-bot-dots"><i /><i /><i /></div>
              </div>
            </div>
          </article>
        )}
        {escalation && (
          <article className="faq-bot-msg is-bot">
            <span className="faq-bot-avatar" aria-hidden="true">W</span>
            <div className="faq-bot-msg-body">
              <div className="faq-bot-bubble is-notice">
                <Answer text="I’ve missed twice now, so let’s not keep going in circles. This sends a person your question exactly as you typed it." />
              </div>
              <div className="faq-bot-links">
                <a href={escalation} target="_blank" rel="noreferrer">
                  Send it on WhatsApp <ArrowUpRight size={14} strokeWidth={1.75} aria-hidden="true" />
                </a>
              </div>
            </div>
          </article>
        )}
      </div>

      <form
        className="faq-bot-compose"
        onSubmit={(event) => {
          event.preventDefault();
          ask(input);
        }}
      >
        <label className="visually-hidden" htmlFor={inputId}>Ask a question</label>
        <input
          id={inputId}
          ref={inputRef}
          value={input}
          onChange={(event) => setInput(event.target.value.slice(0, MAX_QUESTION_LENGTH))}
          placeholder={cooldown > 0 ? `Ready again in ${cooldown}s…` : 'Ask about shipping, flights, batteries…'}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="send"
          maxLength={MAX_QUESTION_LENGTH}
          disabled={cooldown > 0}
          aria-describedby={`${inputId}-hint`}
        />
        <button type="submit" disabled={typing || cooldown > 0 || !sanitizeQuestion(input)} aria-label="Send question">
          <Send size={16} strokeWidth={1.8} />
        </button>
      </form>

      <p className="faq-bot-foot" id={`${inputId}-hint`}>
        {cooldown > 0 ? (
          <span className="faq-bot-cooldown">Taking a breath — ready again in {cooldown}s.</span>
        ) : (
          <>Never share card details or OTPs here. Need a person? <a href={WHATSAPP}>WhatsApp</a> or <a href="mailto:hello@whaleora.com">email</a>.</>
        )}
      </p>
    </section>
  );

  if (variant === 'page') return <div className="faq-bot is-page">{panel}</div>;

  return (
    <div className={`faq-bot is-widget ${onProduct ? 'is-pdp' : ''} ${open ? 'is-open' : ''}`}>
      <a className="faq-wa" href={WHATSAPP} target="_blank" rel="noreferrer" aria-label="Chat with Whaleora on WhatsApp">
        <WhatsAppIcon />
      </a>
      {!hideWidget && (
        <>
          {open && <button type="button" className="faq-bot-backdrop" aria-label="Close FAQ assistant" onClick={() => setOpen(false)} />}
          {visible && panel}
          <button
            type="button"
            className="faq-bot-launcher"
            aria-expanded={open}
            aria-controls={panelId}
            aria-haspopup="dialog"
            onClick={() => (open ? setOpen(false) : openWidget())}
          >
            {open ? <X size={22} strokeWidth={1.7} /> : <MessageCircle size={22} strokeWidth={1.7} />}
            <span>{open ? 'Close' : 'Ask us'}</span>
          </button>
        </>
      )}
    </div>
  );
}
