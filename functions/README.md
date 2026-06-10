# Winners Superfrip — Cloud Functions

Two Firebase Cloud Functions run in this codebase:

| Function | Trigger | What it does |
|---|---|---|
| `notifyOnReservationCreate` | Firestore document create on `/reservations/{id}` | Emails **the admin only** when a new reservation is submitted |
| `expireOverdueReservations` | Cloud Scheduler — every hour | Flips pending reservations past their `pickupDeadline` to `expired` |

> **Customer-facing emails are currently disabled.** The `notifyOnReservationUpdate`
> function and the customer templates are kept (commented) in
> [`src/index.ts`](src/index.ts), ready to re-enable once a sending domain is
> verified at Resend so emails can reach addresses other than the admin's.

## One-time setup

### 1. Install the CLI and log in

```bash
npm install -g firebase-tools
firebase login
firebase use winners-superfrip
```

### 2. Install function deps

From the **repo root**:

```bash
cd functions && npm install && cd ..
```

### 3. Get a Resend API key (free)

1. Sign up at https://resend.com (no credit card needed; free tier is 3 000 emails/month — more than enough for a boutique).
2. In the Resend dashboard, go to **API Keys** → **Create API Key** → name it `winners-superfrip`.
3. Copy the `re_...` key.

### 4. Store the key as a Firebase secret

```bash
firebase functions:secrets:set RESEND_API_KEY
```

Paste the `re_...` value when prompted. The secret is encrypted and only the functions can read it.

### 5. (Optional but recommended) Verify your own boutique domain at Resend

Until you do this, emails are sent from `onboarding@resend.dev`, which is fine for testing but looks unbranded. To send from `boutique@winners-superfrip.com`:

1. In Resend → **Domains** → **Add Domain** → enter your domain.
2. Add the three DNS records (SPF, DKIM, MX) Resend gives you to your DNS provider.
3. Wait for verification (5–30 min).
4. Update `SENDER_FROM` in [`functions/src/email.ts`](src/email.ts) to use the new address.

### 6. Deploy

```bash
firebase deploy --only functions
```

The very first deploy will:
- Ask to enable the Cloud Build, Cloud Scheduler, and Cloud Run APIs on GCP — say **yes** to all three.
- Take 3–5 minutes.

Subsequent deploys are 30–60 seconds.

## Testing locally

You can run the function emulators without deploying:

```bash
cd functions
npm run build
firebase emulators:start --only functions,firestore
```

Then create a test reservation through your dev site (`http://localhost:3000/checkout`) and watch the emulator logs.

## Where do emails go?

| Event | Admin (`anis.federe@gmail.com`) | Customer |
|---|---|---|
| Customer submits a reservation | ✅ | — (disabled) |
| Admin changes status | — | — (disabled) |

Only the admin receives email for now. Customer-facing emails are commented
out in [`src/index.ts`](src/index.ts) and can be turned back on later.

## Changing the admin recipient

`ADMIN_EMAIL` is hard-coded in [`functions/src/index.ts`](src/index.ts). To change it, edit that constant and redeploy.

## Troubleshooting

**No email is being sent** — Check the function logs:

```bash
firebase functions:log
```

Common causes: missing `RESEND_API_KEY` secret (log says "skipping email"), or your Resend account is rate-limited.

**Customer email doesn't arrive** — make sure they provided one in the checkout form (it's optional). Reservations created without an email still trigger the admin notification, just not the customer one.

**Admin email goes to spam** — verify your boutique domain at Resend (step 5 above) so the `from:` address matches.
