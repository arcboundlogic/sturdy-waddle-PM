import nodemailer from 'nodemailer';

export interface EmailPayload {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

function createTransport() {
  const host = process.env['SMTP_HOST'] ?? 'smtp.mailtrap.io';
  const port = Number(process.env['SMTP_PORT'] ?? '587');
  const user = process.env['SMTP_USER'];
  const pass = process.env['SMTP_PASS'];

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: user && pass ? { user, pass } : undefined,
  });
}

/** Send an email notification */
export async function sendEmail(payload: EmailPayload): Promise<void> {
  const from = process.env['EMAIL_FROM'] ?? 'noreply@waddle.pm';

  const transporter = createTransport();
  await transporter.sendMail({
    from,
    to: payload.to,
    subject: payload.subject,
    text: payload.text,
    html: payload.html,
  });
}
