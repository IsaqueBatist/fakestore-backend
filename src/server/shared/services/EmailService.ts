import { Resend } from "resend";
import nodemailer from "nodemailer";
import { logger } from "./Logger";

const FROM_ADDRESS =
  process.env.EMAIL_FROM || "FakeStore <noreply@fakestore.com.br>";

/**
 * Send email via Resend (production) or Ethereal (development fallback).
 * Resend free tier: 3,000 emails/month.
 */
async function sendEmail(to: string, subject: string, html: string) {
  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      subject,
      html,
    });
    if (error) {
      logger.error({ err: error, to, subject }, "Resend email failed");
      throw new Error(`Email send failed: ${error.message}`);
    }
    logger.info({ to, subject }, "Email sent via Resend");
  } else {
    // Fallback to Ethereal for development
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    const info = await transporter.sendMail({
      from: FROM_ADDRESS,
      to,
      subject,
      html,
    });
    logger.info(
      { to, subject, previewUrl: nodemailer.getTestMessageUrl(info) },
      "Email sent via Ethereal (dev only)",
    );
  }
}

export const sendForgotPasswordEmail = async (to: string, token: string) => {
  await sendEmail(
    to,
    "Recuperação de Senha",
    `
    <h2>Recuperação de Senha</h2>
    <p>Você solicitou a recuperação de senha. Use o token abaixo para redefinir sua senha:</p>
    <p><strong>${token}</strong></p>
    <p>Este token expira em 1 hora.</p>
    <p>Se você não solicitou esta recuperação, ignore este email.</p>
    `,
  );
};

export const sendWelcomeTenantEmail = async (
  to: string,
  tenantName: string,
  apiKey: string,
) => {
  await sendEmail(
    to,
    `Bem-vindo ao FakeStore BaaS — ${tenantName}`,
    `
    <h2>Bem-vindo ao FakeStore BaaS!</h2>
    <p>Seu tenant <strong>${tenantName}</strong> foi criado com sucesso.</p>
    <p>Sua API Key: <code>${apiKey}</code></p>
    <p>Guarde esta chave com segurança — ela é necessária para todas as requisições.</p>
    <p>Documentação: <a href="https://docs.fakestore.com.br">docs.fakestore.com.br</a></p>
    `,
  );
};

export const sendOrderConfirmationEmail = async (
  to: string,
  orderId: number,
  totalCents: number,
) => {
  const totalFormatted = (totalCents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  await sendEmail(
    to,
    `Pedido #${orderId} confirmado`,
    `
    <h2>Pedido Confirmado!</h2>
    <p>Seu pedido <strong>#${orderId}</strong> foi confirmado com sucesso.</p>
    <p>Total: <strong>${totalFormatted}</strong></p>
    <p>Você receberá atualizações sobre o envio por email.</p>
    `,
  );
};
