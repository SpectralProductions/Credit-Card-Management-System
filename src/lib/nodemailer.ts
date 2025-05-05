import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: process.env.SERVER_HOST,
  port: Number(process.env.SERVER_PORT),
  secure: process.env.SERVER_PORT === "465", // true for 465, false for other ports
  auth: {
    user: process.env.SERVER_USER,
    pass: process.env.SERVER_PASSWORD,
  },
});

export const sendEmail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to,
      subject,
      html,
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}; 