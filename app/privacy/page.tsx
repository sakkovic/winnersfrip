import StaticPage from '@/components/StaticPage';
import { BOUTIQUE } from '@/lib/boutique-rules';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Politique de confidentialité — Winners Superfrip',
  description:
    'Comment Winners Superfrip collecte, utilise et protège vos données personnelles.',
};

export default function PrivacyPage() {
  return (
    <StaticPage eyebrow="Légal" title="Politique de" titleAccent="confidentialité">
      <p className="text-sm text-gray-500 italic">
        Dernière mise à jour : juin 2026
      </p>

      <section>
        <h2 className="font-display text-2xl mb-3 text-brand-black not-italic">1. Qui sommes-nous ?</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Winners Superfrip est une boutique située à Monastir, Tunisie ({BOUTIQUE.address}).
          Nous opérons ce site pour permettre à notre clientèle de découvrir notre
          sélection et de réserver des articles en vue d&apos;un retrait en boutique.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl mb-3 text-brand-black not-italic">2. Données collectées</h2>
        <p className="text-sm text-gray-600 leading-relaxed mb-3">
          Lorsque vous créez un compte ou passez une réservation, nous recueillons :
        </p>
        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1.5 ml-4">
          <li>Vos nom et prénom</li>
          <li>Votre numéro de téléphone (nécessaire pour confirmer la réservation)</li>
          <li>Votre adresse e-mail (optionnelle)</li>
          <li>La liste des articles réservés et le total associé</li>
          <li>Un identifiant d&apos;authentification (fourni par Google si vous vous connectez via Google Sign-In)</li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-2xl mb-3 text-brand-black not-italic">3. Pourquoi nous les utilisons</h2>
        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1.5 ml-4">
          <li>Vous contacter pour confirmer le retrait en boutique</li>
          <li>Tenir l&apos;historique de vos réservations afin que vous puissiez les annuler vous-même</li>
          <li>Respecter nos obligations légales en matière de comptabilité</li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-2xl mb-3 text-brand-black not-italic">4. Sécurité & hébergement</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Vos données sont hébergées par Google Firebase (Firestore) dans des
          centres de données conformes aux standards de l&apos;industrie.
          L&apos;accès en écriture est restreint au compte administrateur de la
          boutique et aux opérations explicitement autorisées par les règles
          de sécurité du serveur.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl mb-3 text-brand-black not-italic">5. Vos droits</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Vous pouvez à tout moment demander l&apos;accès, la rectification ou
          la suppression de vos données en nous contactant au{' '}
          <a href={`tel:${BOUTIQUE.contactPhoneE164}`} className="text-brand-warm font-semibold underline underline-offset-2">
            {BOUTIQUE.contactPhone}
          </a>{' '}
          ou par e-mail. Nous répondons sous 30 jours.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl mb-3 text-brand-black not-italic">6. Cookies</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Ce site utilise uniquement les cookies techniques nécessaires à
          l&apos;authentification et à la mémorisation de votre panier. Aucun
          cookie publicitaire ni de suivi tiers n&apos;est déposé.
        </p>
      </section>
    </StaticPage>
  );
}
