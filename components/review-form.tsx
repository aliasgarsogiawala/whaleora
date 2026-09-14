'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from 'convex/react';
import { Check, Star } from 'lucide-react';
import { api } from '@/convex/_generated/api';

type Status = 'idle' | 'sending' | 'sent' | 'held' | 'duplicate' | 'error';

export function ReviewForm({ productHandle, productTitle, defaultOpen = false }: { productHandle: string; productTitle: string; defaultOpen?: boolean }) {
  const submit = useMutation(api.reviews.submit);
  const router = useRouter();
  const [open, setOpen] = useState(defaultOpen);
  const [rating, setRating] = useState(0);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (rating < 1) { setError('Pick a rating first.'); setStatus('error'); return; }
    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus('sending');
    setError('');
    try {
      const result = await submit({
        productHandle,
        rating,
        name: String(data.get('name') ?? ''),
        email: String(data.get('email') ?? ''),
        body: String(data.get('body') ?? ''),
      });
      if (!result.ok) { setStatus('duplicate'); return; }
      form.reset();
      setRating(0);
      setStatus(result.held ? 'held' : 'sent');
      // Pull the published review into the list above without a manual reload.
      if (!result.held) router.refresh();
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : 'That did not send. Please try again.');
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return <div className="review-form is-done" role="status">
      <Check size={20} aria-hidden="true" />
      <div>
        <strong>Thank you — it is live.</strong>
        <p>Your review is published on this page now.</p>
      </div>
    </div>;
  }

  if (status === 'held') {
    return <div className="review-form is-done" role="status">
      <Check size={20} aria-hidden="true" />
      <div>
        <strong>Thank you — we will take a look.</strong>
        <p>This one needs a quick human check before it goes up. If that is not what you expected, email hello@whaleora.com.</p>
      </div>
    </div>;
  }

  if (status === 'duplicate') {
    return <div className="review-form is-done" role="status">
      <Check size={20} aria-hidden="true" />
      <div>
        <strong>You have already reviewed this one.</strong>
        <p>Email hello@whaleora.com if you would like to change what you wrote.</p>
      </div>
    </div>;
  }

  if (!open) {
    return <div className="review-form-cta">
      <button type="button" className="button button-outline" onClick={() => setOpen(true)}>Write a review</button>
      <span>Bought the {productTitle}? Tell the next person what it is actually like.</span>
    </div>;
  }

  return <form className="review-form" onSubmit={send}>
    <p className="eyebrow dark">Your review · {productTitle}</p>

    <fieldset className="review-rating">
      <legend>Rating</legend>
      <div>
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            className={value <= rating ? 'is-on' : ''}
            aria-label={`${value} ${value === 1 ? 'star' : 'stars'}`}
            aria-pressed={value === rating}
            onClick={() => { setRating(value); setError(''); }}
          >
            <Star size={24} strokeWidth={1.6} fill={value <= rating ? 'currentColor' : 'none'} />
          </button>
        ))}
      </div>
    </fieldset>

    <div className="review-form-pair">
      <label>Your name<input name="name" maxLength={80} autoComplete="name" required /></label>
      <label>Email<input type="email" name="email" maxLength={160} autoComplete="email" required /><small>Not published. We use it to check the order and to reach you.</small></label>
    </div>

    <label>Your review<textarea name="body" rows={5} maxLength={1200} required placeholder="What did you use it for, and how did it hold up?" /></label>

    {status === 'error' && <p className="form-note form-note-error" role="alert">{error}</p>}

    <div className="review-form-actions">
      <button type="submit" className="button button-primary" disabled={status === 'sending'}>{status === 'sending' ? 'Sending…' : 'Submit review'}</button>
      <button type="button" className="review-form-cancel" onClick={() => setOpen(false)}>Cancel</button>
    </div>
    <p className="review-form-note">Reviews go up as written, good or bad. We only hold ones that trip our abuse and spam filter, and we never publish reviews in exchange for anything.</p>
  </form>;
}
