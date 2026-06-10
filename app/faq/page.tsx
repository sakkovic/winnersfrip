import StaticPage from '@/components/StaticPage';
import { PICKUP_RULES, BOUTIQUE } from '@/lib/boutique-rules';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ — Winners Superfrip',
  description:
    'Questions fréquentes sur les réservations en boutique, le retrait des articles, les modes de paiement et le règlement.',
};

const EXTRA_FAQ: { question: string; answer: string }[] = [
  {
    question: 'Puis-je essayer un article avant de l\'acheter ?',
    answer:
      'Oui. Toutes nos pièces (vêtements vintage comme parfums et soins) peuvent être essayées ou testées en boutique avant de finaliser votre achat.',
  },
  {
    question: 'Vos parfums et soins sont-ils authentiques ?',
    answer:
      'Oui. Tous nos produits beauté proviennent de distributeurs agréés. Les flacons sont neufs, scellés et leurs lots traçables.',
  },
  {
    question: 'Vendez-vous en ligne ?',
    answer:
      'Notre site sert à réserver les pièces qui vous plaisent ; le règlement et le retrait se font ensuite en boutique à Monastir.',
  },
  {
    question: 'Comment annuler une réservation ?',
    answer:
      'Connectez-vous, allez dans « Mon compte → Mes réservations », puis cliquez sur « Annuler » à côté de la réservation concernée. Vous pouvez aussi nous appeler.',
  },
];

export default function FAQPage() {
  return (
    <StaticPage
      eyebrow="Aide"
      title="Questions"
      titleAccent="fréquentes"
    >
      <section>
        <h2 className="font-display text-2xl mb-4 text-brand-black not-italic">
          Le règlement de réservation
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Quand vous validez une réservation, vous acceptez ces conditions :
        </p>
        <div className="space-y-5">
          {PICKUP_RULES.map((rule) => (
            <div key={rule.title}>
              <p className="text-xs font-bold tracking-wider uppercase text-brand-black mb-1.5">
                {rule.title}
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">{rule.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl mb-4 text-brand-black not-italic">
          Vos questions courantes
        </h2>
        <div className="space-y-5">
          {EXTRA_FAQ.map((q) => (
            <div key={q.question}>
              <p className="text-xs font-bold tracking-wider uppercase text-brand-black mb-1.5">
                {q.question}
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">{q.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-gray-100 pt-8">
        <h2 className="font-display text-2xl mb-3 text-brand-black not-italic">
          Une question qui n&apos;est pas listée ?
        </h2>
        <p className="text-sm text-gray-600 mb-3">
          Appelez-nous au{' '}
          <a
            href={`tel:${BOUTIQUE.contactPhoneE164}`}
            className="text-brand-warm font-semibold underline underline-offset-2"
          >
            {BOUTIQUE.contactPhone}
          </a>{' '}
          ou passez à la boutique :
        </p>
        <p className="text-sm text-gray-500">{BOUTIQUE.address}</p>
      </section>
    </StaticPage>
  );
}
