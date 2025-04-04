import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  secure: false,
  auth: {
    user: process.env.MAILTRAP_USERNANE,
    pass: process.env.MAILTRAP_PASSWORD,
  },
});

export { transporter };
