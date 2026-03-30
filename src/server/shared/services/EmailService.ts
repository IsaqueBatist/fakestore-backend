import nodemailer from "nodemailer";

export const sendForgotPasswordEmail = async (to: string, token: string) => {
  const testAccount = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });

  await transporter.sendMail({
    from: '"FakeStore Support" <noreply@fakestore.com>',
    to,
    subject: "Recuperação de Senha",
    text: `Use o token para resetar sua senha: ${token}`,
    html: `<b>Token: ${token}</b>`,
  });
};
