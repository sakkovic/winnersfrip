/**
 * Winners Superfrip — Cloud Functions
 *
 *   expireOverdueReservations  scheduled, runs hourly. Marks pending
 *                              reservations whose pickupDeadline has passed
 *                              as `expired` so the status-change function
 *                              can email the customer.
 *
 *   notifyOnReservationCreate  Firestore trigger. On every new reservation,
 *                              emails the admin and the customer.
 *
 *   notifyOnReservationUpdate  Firestore trigger. When the status field
 *                              changes (confirmed / cancelled / completed /
 *                              expired), emails the customer.
 *
 * Deploy from the repo root with:
 *   cd functions && npm install && npm run build && cd ..
 *   firebase deploy --only functions
 *
 * Don't forget to configure the Resend API key once:
 *   firebase functions:secrets:set RESEND_API_KEY
 * See functions/README.md for the full setup.
 */

import { onSchedule } from 'firebase-functions/v2/scheduler';
import {
  onDocumentCreated,
  onDocumentUpdated,
} from 'firebase-functions/v2/firestore';
import { setGlobalOptions, logger } from 'firebase-functions/v2';
import { defineSecret } from 'firebase-functions/params';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

import { sendEmail, wrapHtml, escape } from './email.js';

initializeApp();
setGlobalOptions({ region: 'europe-west1', maxInstances: 5 });

const RESEND_API_KEY = defineSecret('RESEND_API_KEY');

const ADMIN_EMAIL = 'anis.federe@gmail.com';
const SITE_URL = 'https://winners-superfrip.com'; // adjust when domain ships
const CONTACT_PHONE = '+216 55 560 552';

// ── Types ────────────────────────────────────────────────────────────────────

interface ReservationItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  selectedSize?: string | null;
  selectedColor?: string | null;
}

interface Reservation {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string | null;
  notes?: string | null;
  items: ReservationItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'expired';
  pickupDeadline?: FirebaseFirestore.Timestamp | null;
  createdAt?: FirebaseFirestore.Timestamp | null;
}

// ── Email templates ──────────────────────────────────────────────────────────

function itemsList(items: ReservationItem[]) {
  return items
    .map(
      (it) => `
        <tr>
          <td style="padding:4px 0;color:#555;">
            <span style="display:inline-block;width:28px;color:#999;">×${it.quantity}</span>
            ${escape(it.name)}${it.selectedSize ? ` · ${escape(it.selectedSize)}` : ''}
          </td>
          <td style="padding:4px 0;text-align:right;color:#333;">${(it.unitPrice * it.quantity).toFixed(0)} DT</td>
        </tr>`,
    )
    .join('');
}

function deadlineLabel(d?: FirebaseFirestore.Timestamp | null): string {
  if (!d) return '';
  return d.toDate().toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function customerCreateBody(r: Reservation): string {
  return wrapHtml({
    title: 'Réservation confirmée',
    preheader: `Merci ${r.firstName}, vos articles sont mis de côté.`,
    body: `
      <h1 style="font-size:22px;margin:0 0 12px 0;color:#0A0A0A;">Merci ${escape(r.firstName)},</h1>
      <p style="margin:0 0 16px 0;color:#555;">
        Nous avons bien reçu votre réservation. Nous vous appelons sous peu
        au <strong>${escape(r.phone)}</strong> pour confirmer votre passage.
      </p>
      ${r.pickupDeadline
        ? `<div style="background:#FAF7F0;border:1px solid rgba(201,149,74,0.4);padding:14px 16px;margin:16px 0;">
            <div style="font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:#845300;font-weight:600;">Date limite de retrait</div>
            <div style="font-size:18px;margin-top:6px;color:#0A0A0A;">${escape(deadlineLabel(r.pickupDeadline))}</div>
            <div style="font-size:12px;color:#888;margin-top:6px;">
              Passé cette date, la réservation est automatiquement annulée et
              les articles remis en vente.
            </div>
          </div>`
        : ''}
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:20px 0;border-top:1px solid #eee;">
        ${itemsList(r.items)}
        <tr>
          <td style="padding:12px 0 0 0;border-top:1px solid #eee;font-weight:700;">Total à régler en boutique</td>
          <td style="padding:12px 0 0 0;border-top:1px solid #eee;text-align:right;font-weight:700;">${r.total} DT</td>
        </tr>
      </table>
      <p style="margin:0 0 8px 0;color:#555;font-size:13px;">
        Pour annuler ou prolonger votre délai, connectez-vous à votre compte
        ou appelez-nous au
        <a href="tel:+21655560552" style="color:#845300;">${CONTACT_PHONE}</a>.
      </p>
      <p style="margin:24px 0 0 0;">
        <a href="${SITE_URL}/account/reservations"
           style="display:inline-block;background:#0A0A0A;color:#fff;text-decoration:none;
                  font-size:11px;letter-spacing:0.2em;text-transform:uppercase;font-weight:700;
                  padding:12px 22px;">Voir mes réservations</a>
      </p>
    `,
  });
}

function adminCreateBody(reservationId: string, r: Reservation): string {
  return wrapHtml({
    title: 'Nouvelle réservation',
    preheader: `${r.firstName} ${r.lastName} — ${r.total} DT`,
    body: `
      <h1 style="font-size:22px;margin:0 0 12px 0;color:#0A0A0A;">Nouvelle réservation</h1>
      <p style="margin:0 0 16px 0;color:#555;">
        <strong>${escape(r.firstName)} ${escape(r.lastName)}</strong><br/>
        Téléphone : <a href="tel:${escape(r.phone)}" style="color:#845300;">${escape(r.phone)}</a>${r.email ? `<br/>Email : <a href="mailto:${escape(r.email)}" style="color:#845300;">${escape(r.email)}</a>` : ''}
      </p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:12px 0;border-top:1px solid #eee;">
        ${itemsList(r.items)}
        <tr>
          <td style="padding:12px 0 0 0;border-top:1px solid #eee;font-weight:700;">Total</td>
          <td style="padding:12px 0 0 0;border-top:1px solid #eee;text-align:right;font-weight:700;">${r.total} DT</td>
        </tr>
      </table>
      ${r.notes ? `<div style="background:#FAF7F0;border-left:2px solid #C9954A;padding:10px 14px;color:#555;font-style:italic;margin:14px 0;font-size:13px;">« ${escape(r.notes)} »</div>` : ''}
      <p style="margin:0 0 4px 0;color:#888;font-size:11px;">
        Réf. <strong>${reservationId.slice(0, 8).toUpperCase()}</strong> · Délai retrait : ${escape(deadlineLabel(r.pickupDeadline))}
      </p>
      <p style="margin:24px 0 0 0;">
        <a href="${SITE_URL}/admin/reservations"
           style="display:inline-block;background:#0A0A0A;color:#fff;text-decoration:none;
                  font-size:11px;letter-spacing:0.2em;text-transform:uppercase;font-weight:700;
                  padding:12px 22px;">Ouvrir l'administration</a>
      </p>
    `,
  });
}

const STATUS_COPY: Record<
  Reservation['status'],
  { subject: (r: Reservation) => string; intro: (r: Reservation) => string } | null
> = {
  pending: null, // initial state — covered by the create function
  confirmed: {
    subject: () => 'Votre réservation est confirmée',
    intro: (r) => `Bonne nouvelle ${escape(r.firstName)}, nous gardons vos articles de côté. Vous pouvez passer les récupérer en boutique avant la date limite ci-dessous.`,
  },
  completed: {
    subject: () => 'Merci pour votre passage',
    intro: (r) => `Merci ${escape(r.firstName)} d'être passé en boutique récupérer votre réservation. À très vite !`,
  },
  cancelled: {
    subject: () => 'Votre réservation a été annulée',
    intro: (r) => `Bonjour ${escape(r.firstName)}, votre réservation a été annulée. Si ce n'est pas une démarche de votre part, contactez-nous : nous sommes là pour aider.`,
  },
  expired: {
    subject: () => 'Votre réservation a expiré',
    intro: (r) => `Bonjour ${escape(r.firstName)}, le délai de retrait de votre réservation est dépassé : elle a été automatiquement annulée et les articles remis en vente. N'hésitez pas à repasser si une pièce vous plaît à nouveau.`,
  },
};

function customerStatusBody(r: Reservation): string | null {
  const copy = STATUS_COPY[r.status];
  if (!copy) return null;
  return wrapHtml({
    title: copy.subject(r),
    preheader: copy.intro(r),
    body: `
      <h1 style="font-size:22px;margin:0 0 12px 0;color:#0A0A0A;">${copy.subject(r)}</h1>
      <p style="margin:0 0 16px 0;color:#555;">${copy.intro(r)}</p>
      ${r.status === 'confirmed' && r.pickupDeadline
        ? `<div style="background:#FAF7F0;border:1px solid rgba(201,149,74,0.4);padding:14px 16px;margin:16px 0;">
            <div style="font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:#845300;font-weight:600;">Date limite de retrait</div>
            <div style="font-size:18px;margin-top:6px;color:#0A0A0A;">${escape(deadlineLabel(r.pickupDeadline))}</div>
          </div>`
        : ''}
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:16px 0;border-top:1px solid #eee;">
        ${itemsList(r.items)}
        <tr>
          <td style="padding:12px 0 0 0;border-top:1px solid #eee;font-weight:700;">Total</td>
          <td style="padding:12px 0 0 0;border-top:1px solid #eee;text-align:right;font-weight:700;">${r.total} DT</td>
        </tr>
      </table>
      ${r.status !== 'completed' && r.status !== 'cancelled'
        ? `<p style="margin:24px 0 0 0;">
            <a href="${SITE_URL}/account/reservations"
               style="display:inline-block;background:#0A0A0A;color:#fff;text-decoration:none;
                      font-size:11px;letter-spacing:0.2em;text-transform:uppercase;font-weight:700;
                      padding:12px 22px;">Voir mes réservations</a>
          </p>`
        : ''}
    `,
  });
}

// ── Triggers ─────────────────────────────────────────────────────────────────

export const expireOverdueReservations = onSchedule(
  { schedule: 'every 60 minutes', timeZone: 'Africa/Tunis' },
  async () => {
    const db = getFirestore();
    const now = new Date();
    const snap = await db
      .collection('reservations')
      .where('status', '==', 'pending')
      .where('pickupDeadline', '<', now)
      .get();
    if (snap.empty) {
      logger.info('No reservations to expire.');
      return;
    }
    const docs = snap.docs;
    let written = 0;
    const chunkSize = 400;
    for (let i = 0; i < docs.length; i += chunkSize) {
      const batch = db.batch();
      for (const d of docs.slice(i, i + chunkSize)) {
        batch.update(d.ref, {
          status: 'expired',
          expiredAt: FieldValue.serverTimestamp(),
        });
      }
      await batch.commit();
      written += Math.min(chunkSize, docs.length - i);
    }
    logger.info(`Expired ${written} overdue reservations.`);
  },
);

export const notifyOnReservationCreate = onDocumentCreated(
  {
    document: 'reservations/{reservationId}',
    secrets: [RESEND_API_KEY],
  },
  async (event) => {
    const snap = event.data;
    if (!snap) return;
    const r = snap.data() as Reservation;
    const apiKey = RESEND_API_KEY.value();
    const id = event.params.reservationId;

    // Email the boutique owner only.  Customer-facing emails are intentionally
    // disabled for now — re-enable by restoring customerCreateBody() /
    // notifyOnReservationUpdate (kept below, commented) once a sending domain
    // is verified at Resend.
    await sendEmail(apiKey, {
      to: ADMIN_EMAIL,
      subject: `🛍️ Nouvelle réservation — ${r.firstName} ${r.lastName} (${r.total} DT)`,
      html: adminCreateBody(id, r),
    }).catch((err) => logger.error('admin email failed', err));
  },
);

/* ── Customer notifications — DISABLED for now ────────────────────────────────
   Re-enable once a sending domain is verified at Resend so emails can reach
   addresses other than the admin's.  The templates (customerCreateBody,
   customerStatusBody, STATUS_COPY) are still defined above and ready to use.

export const notifyOnReservationUpdate = onDocumentUpdated(
  {
    document: 'reservations/{reservationId}',
    secrets: [RESEND_API_KEY],
  },
  async (event) => {
    const before = event.data?.before.data() as Reservation | undefined;
    const after  = event.data?.after.data()  as Reservation | undefined;
    if (!before || !after) return;
    if (before.status === after.status) return;

    const html = customerStatusBody(after);
    if (!html || !after.email) return;

    const subject = STATUS_COPY[after.status]?.subject(after);
    if (!subject) return;

    const apiKey = RESEND_API_KEY.value();
    await sendEmail(apiKey, { to: after.email, subject, html }).catch((err) =>
      logger.error('customer status email failed', err),
    );
  },
);
──────────────────────────────────────────────────────────────────────────── */
