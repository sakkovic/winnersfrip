import StaticPage from '@/components/StaticPage';
import { BOUTIQUE, PICKUP_RULES } from '@/lib/boutique-rules';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Conditions générales — Winners Mode',
  description:
    'Conditions générales d\'utilisation et de réservation sur le site Winners Mode.',
};

export default function TermsPage() {
  return (
    <StaticPage eyebrow="Légal" title="Conditions" titleAccent="générales">
      <p className="text-sm text-gray-500 italic">
        Dernière mise à jour : juin 2026
      </p>

      <section>
        <h2 className="font-display text-2xl mb-3 text-brand-black not-italic">1. Objet</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Les présentes conditions régissent l&apos;utilisation du site Winners
          Superfrip et le service de réservation d&apos;articles en vue d&apos;un
          retrait en boutique à Monastir, Tunisie.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl mb-3 text-brand-black not-italic">2. Réservation et retrait</h2>
        <p className="text-sm text-gray-600 leading-relaxed mb-3">
          Toute réservation effectuée via le site implique l&apos;acceptation
          des règles suivantes :
        </p>
        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1.5 ml-4">
          {PICKUP_RULES.map((r) => (
            <li key={r.title}><span className="font-semibold">{r.title}</span> — {r.body}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-display text-2xl mb-3 text-brand-black not-italic">3. Prix &amp; règlement</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Les prix affichés sur le site sont exprimés en dinars tunisiens (DT) et donnés
          à titre indicatif. Le règlement final s&apos;effectue exclusivement
          en boutique, en espèces ou par carte bancaire, lors du retrait des
          articles réservés.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl mb-3 text-brand-black not-italic">4. Disponibilité</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Les pièces vintage et seconde main étant uniques, leur disponibilité
          peut varier. Une réservation est confirmée par notre équipe par
          téléphone ; tant que la confirmation n&apos;est pas effectuée, la
          mise de côté est provisoire.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl mb-3 text-brand-black not-italic">5. Annulation</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Vous pouvez annuler une réservation sans frais depuis la page
          « Mes réservations » de votre compte, à condition qu&apos;elle soit
          encore en statut « en attente ». Passé le délai de retrait, la
          réservation est annulée automatiquement.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl mb-3 text-brand-black not-italic">6. Responsabilité</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          La boutique met tout en œuvre pour décrire fidèlement chaque article.
          Pour les pièces vintage et seconde main, des micro-défauts inhérents
          à l&apos;âge ou à l&apos;usage peuvent exister sans toujours être
          listés explicitement. Nous vous invitons à inspecter les articles
          en boutique avant règlement.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl mb-3 text-brand-black not-italic">7. Contact</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Pour toute question relative à ces conditions : {BOUTIQUE.address} —
          téléphone{' '}
          <a href={`tel:${BOUTIQUE.contactPhoneE164}`} className="text-brand-warm font-semibold underline underline-offset-2">
            {BOUTIQUE.contactPhone}
          </a>.
        </p>
      </section>
    </StaticPage>
  );
}
