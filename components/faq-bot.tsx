'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, MessageCircle, Send, X } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { greetingText, type FaqEntry, type FaqLink } from '@/lib/content/faq';
import { replyToFaq, starterQuestions, topicPrompts } from '@/lib/faq/engine';

type ChatMessage = {
  id: string;
  role: 'bot' | 'user';
  text: string;
  links?: FaqLink[];
  suggestions?: FaqEntry[];
};

const WHATSAPP = 'https://wa.me/8169219734?text=Hi%20Whaleora!%20I%20have%20an%20inquiry.';
const delay = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

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
  if (!links?.length) return null;
  return (
    <div className="faq-bot-links">
      {links.map((link) =>
        link.href.startsWith('/') ? (
          <Link key={link.href} href={link.href} onClick={onNavigate}>
            {link.label} <ArrowUpRight size={14} strokeWidth={1.75} aria-hidden="true" />
          </Link>
        ) : (
          <a key={link.href} href={link.href} target={link.href.startsWith('http') ? '_blank' : undefined} rel={link.href.startsWith('http') ? 'noreferrer' : undefined}>
            {link.label} <ArrowUpRight size={14} strokeWidth={1.75} aria-hidden="true" />
          </a>
        ),
      )}
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

  const pushBot = async (query: string) => {
    setTyping(true);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduced) await delay(Math.min(900, 280 + query.length * 8));
    const reply = replyToFaq(query, pathname);
    setMessages((current) => [
      ...current,
      { id: `${Date.now()}-bot`, role: 'bot', text: reply.text, links: reply.links, suggestions: reply.suggestions },
    ]);
    setTyping(false);
  };

  const ask = (query: string) => {
    const text = query.trim();
    if (!text || typing) return;
    setInput('');
    setMessages((current) => [...current, { id: `${Date.now()}-user`, role: 'user', text }]);
    void pushBot(text);
  };

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
          <button type="button" key={topic.id} onClick={() => ask(topic.prompt)}>
            {topic.label}
          </button>
        ))}
      </div>

      <div className="faq-bot-thread" ref={scroller} role="log" aria-live="polite" aria-relevant="additions">
        {messages.map((message) => (
          <article key={message.id} className={`faq-bot-msg is-${message.role}`}>
            {message.role === 'bot' && <span className="faq-bot-avatar" aria-hidden="true">W</span>}
            <div>
              <Answer text={message.text} />
              <LinkRow links={message.links} onNavigate={() => variant === 'widget' && setOpen(false)} />
              {message.suggestions && message.suggestions.length > 0 && (
                <div className="faq-bot-chips">
                  {message.suggestions.map((entry) => (
                    <button type="button" key={entry.id} onClick={() => ask(entry.question)}>
                      {entry.question}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </article>
        ))}
        {typing && (
          <article className="faq-bot-msg is-bot" aria-label="Assistant is typing">
            <span className="faq-bot-avatar" aria-hidden="true">W</span>
            <div className="faq-bot-dots"><i /><i /><i /></div>
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
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask about shipping, flights, batteries…"
          autoComplete="off"
          maxLength={280}
        />
        <button type="submit" disabled={typing || !input.trim()} aria-label="Send question">
          <Send size={16} strokeWidth={1.8} />
        </button>
      </form>

      <p className="faq-bot-foot">
        Need a person? <a href={WHATSAPP}>WhatsApp</a> or <a href="mailto:hello@whaleora.com">email</a>.
      </p>
    </section>
  );

  if (hideWidget) return null;
  if (variant === 'page') return <div className="faq-bot is-page">{panel}</div>;

  return (
    <div className={`faq-bot is-widget ${onProduct ? 'is-pdp' : ''} ${open ? 'is-open' : ''}`}>
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
    </div>
  );
}
