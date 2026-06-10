'use client';

import { Clock, Phone, AlertCircle, CreditCard, Heart } from 'lucide-react';
import { PICKUP_RULES, BOUTIQUE } from '@/lib/boutique-rules';

const ICONS = [Clock, Phone, AlertCircle, CreditCard, Heart] as const;

interface Props {
  /**
   * - `full`    : icon + title + body for every rule. Use on dedicated screens
   *               (checkout form, confirmation page).
   * - `compact` : title-only, comma-separated, tight. Use as an inline reminder
   *               (cart summary).
   */
  variant?: 'full' | 'compact';
  className?: string;
}

export default function PickupRules({ variant = 'full', className }: Props) {
  if (variant === 'compact') {
    return (
      <div className={className}>
        <ul className="space-y-1.5 text-[11px] text-gray-500 leading-relaxed">
          {PICKUP_RULES.map((rule) => (
            <li key={rule.title} className="flex items-start gap-2">
              <span className="mt-1 w-1 h-1 rounded-full bg-brand-warm flex-shrink-0" />
              <span>{rule.title}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <section
      className={['bg-brand-cream/50 border border-brand-gold-soft/30 p-5 sm:p-6', className]
        .filter(Boolean)
        .join(' ')}
      aria-labelledby="pickup-rules-title"
    >
      <div className="flex items-center gap-3 mb-5">
        <span className="h-px w-8 bg-brand-warm" />
        <h2
          id="pickup-rules-title"
          className="text-[10px] tracking-[0.3em] uppercase font-semibold text-brand-warm"
        >
          Règlement de réservation
        </h2>
      </div>

      <ul className="space-y-4">
        {PICKUP_RULES.map((rule, i) => {
          const Icon = ICONS[i] ?? AlertCircle;
          return (
            <li key={rule.title} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-white border border-brand-gold-soft/40 flex items-center justify-center mt-0.5">
                <Icon size={14} className="text-brand-warm" strokeWidth={1.75} />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold tracking-wider uppercase text-brand-black mb-0.5">
                  {rule.title}
                </p>
                <p className="text-xs text-gray-600 leading-relaxed">{rule.body}</p>
              </div>
            </li>
          );
        })}
      </ul>

      <a
        href={`tel:${BOUTIQUE.contactPhoneE164}`}
        className="mt-5 inline-flex items-center gap-2 text-[11px] tracking-wider uppercase font-semibold text-brand-warm hover:text-brand-gold-dark transition-colors"
      >
        <Phone size={12} />
        Contacter la boutique — {BOUTIQUE.contactPhone}
      </a>
    </section>
  );
}
