/**
 * Email delivery.
 *
 * No transactional email provider (Resend / SendGrid / SMTP) is configured in
 * this environment, so messages are logged to the server console and the code
 * is surfaced in-app in development. To deliver real emails, implement the
 * `deliver` step below with your provider's SDK and set the relevant env vars.
 */

type Mail = { to: string; subject: string; text: string };

export async function sendEmail(mail: Mail): Promise<void> {
  // eslint-disable-next-line no-console
  console.log(
    `\n[jiva:email] -> ${mail.to}\n  ${mail.subject}\n  ${mail.text}\n`
  );
  // Example real delivery (uncomment + install a provider):
  // await resend.emails.send({ from, to: mail.to, subject: mail.subject, text: mail.text });
}

/** A 4-digit numeric one-time code. */
export function generateOtp(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

/**
 * Whether the in-app hint with the code is exposed to the client.
 *
 * There is no mail provider wired up, so by default we surface the code in the
 * UI (including in production) so verification and password-reset still work.
 * Once you connect a real email provider, set `JIVA_SHOW_DEV_CODE=false` to
 * stop exposing codes to the client.
 */
export const EXPOSE_DEV_CODE = process.env.JIVA_SHOW_DEV_CODE !== "false";

export const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
