/**
 * Boutique reservation rules — single source of truth.
 *
 * Edit the values here and every surface (cart, checkout form, confirmation
 * screen, FAQ) updates automatically.
 */

export const BOUTIQUE = {
  /** Maximum number of days a client has to come pick up a reservation. */
  pickupWindowDays: 5,

  /** Phone number shown to clients who need to extend or cancel a reservation. */
  contactPhone: '+216 55 560 552',
  /** International format with no spaces — used in `tel:` links. */
  contactPhoneE164: '+21655560552',

  /** Street address, displayed alongside the rules where relevant. */
  address: 'Winners Superfrip · QRFJ+J5R, Monastir, Tunisie',
} as const;

/**
 * Rules displayed to the customer at the moment of reservation.
 * Keep each rule short and self-contained; ordered by importance.
 */
export const PICKUP_RULES: { title: string; body: string }[] = [
  {
    title: `Délai de retrait : ${BOUTIQUE.pickupWindowDays} jours maximum`,
    body:
      `Vous disposez de ${BOUTIQUE.pickupWindowDays} jours pour passer en boutique récupérer vos articles. ` +
      `Passé ce délai, la réservation est automatiquement annulée et les pièces remises en vente.`,
  },
  {
    title: 'Besoin de plus de temps ?',
    body:
      `Si vous rencontrez un imprévu, contactez-nous au ${BOUTIQUE.contactPhone} ` +
      `pour prolonger votre délai de retrait.`,
  },
  {
    title: 'Annulez si vous ne pouvez plus venir',
    body:
      'Nos quantités sont limitées. Si vous ne pouvez plus passer, ' +
      'veuillez annuler votre réservation depuis votre panier ou ' +
      'votre historique pour laisser la pièce disponible à d\'autres clients.',
  },
  {
    title: 'Aucun paiement en ligne',
    body:
      'Le règlement s\'effectue uniquement en boutique au moment du retrait. ' +
      'Nous acceptons espèces et carte bancaire.',
  },
  {
    title: 'Respect des autres clients',
    body:
      'Les pièces vintage et la beauté étant en quantités limitées, ' +
      'merci de ne réserver que ce que vous comptez réellement venir chercher.',
  },
];
