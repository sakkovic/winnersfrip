/**
 * Resend email helper — single source of truth for outbound transactional
 * email from the boutique.  Uses the Resend HTTP API directly so we don't
 * pull in a heavy SDK.
 *
 * Configure the API key with:
 *   firebase functions:secrets:set RESEND_API_KEY
 *
 * Configure the sender domain in lib/boutique-rules-server.ts (or just hard-
 * code it here — we keep it inline since this file is the only consumer).
 */

import { logger } from 'firebase-functions/v2';

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

// During the first weeks of operation, until your own boutique domain is
// verified at Resend, the sandbox sender works fine and gives a real
// "from boutique" reply-to (any address you own).
const SENDER_NAME = 'Winners Mode';
const SENDER_FROM = 'Winners Mode <onboarding@resend.dev>';
const REPLY_TO = 'anis.federe@gmail.com';

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(
  apiKey: string,
  { to, subject, html, text }: SendEmailParams,
): Promise<void> {
  if (!apiKey) {
    logger.warn('RESEND_API_KEY missing, skipping email.', { to, subject });
    return;
  }
  const res = await fetch(RESEND_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: SENDER_FROM,
      to: [to],
      reply_to: REPLY_TO,
      subject,
      html,
      text: text ?? stripHtml(html),
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    logger.error('Resend email failed', { status: res.status, body, to, subject });
    throw new Error(`Resend ${res.status}: ${body}`);
  }
  logger.info('Email sent', { to, subject });
}

// ── Markup helpers ───────────────────────────────────────────────────────────

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Returns a minimal, brand-tinted HTML wrapper.  Inline styles only — most
 * mail clients ignore <style> blocks.
 */
export function wrapHtml(opts: { title: string; preheader?: string; body: string }) {
  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>${escape(opts.title)}</title>
  </head>
  <body style="margin:0;padding:0;background:#FAF7F0;font-family:-apple-system,BlinkMacSystemFont,Inter,Segoe UI,sans-serif;color:#0A0A0A;">
    ${opts.preheader
      ? `<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${escape(opts.preheader)}</div>`
      : ''}
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#FAF7F0;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellspacing="0" cellpadding="0" border="0" style="background:#fff;max-width:560px;width:100%;border:1px solid #eee;">
            <tr>
              <td style="padding:32px 28px 0 28px;">
                <div style="font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:#845300;font-weight:700;">${SENDER_NAME}</div>
                <div style="height:1px;background:#C9954A;width:32px;margin-top:8px;"></div>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 28px 32px 28px;font-size:14px;line-height:1.6;">
                ${opts.body}
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 28px 28px;font-size:11px;color:#999;border-top:1px solid #eee;padding-top:18px;">
                Winners Mode · QRFJ+J5R, Monastir, Tunisie<br/>
                Vous recevez cet email parce que vous avez réservé un article sur winners-mode.com.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function escape(s: string) {
  return String(s).replace(/[&<>"]/g, (c) =>
    c === '&' ? '&amp;' :
    c === '<' ? '&lt;' :
    c === '>' ? '&gt;' :
                '&quot;',
  );
}
