import { transporter } from "../config/email.js";
import Mailgen from "mailgen";
import { ApiError } from "./apiError.util.js";

const mailGenerator = new Mailgen({
  theme: "default",
  product: {
    name: "Cooksavvy",
    link: process.env.APP_URL || "https://cooksavvy.example.com",
    logo: process.env.APP_LOGO_URL,
  },
});

export const sendEmail = async (options) => {
  try {
    const emailText = mailGenerator.generatePlaintext(options.mailGenContent);
    const emailHtml = mailGenerator.generate(options.mailGenContent);

    const mailOptions = {
      from: process.env.SENDER_EMAIL_ID,
      to: options.email,
      subject: options.subject,
      text: emailText,
      html: emailHtml,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new ApiError(500, "Failed to send email!");
  }
};

export const emailVerificationMailGenContent = ({
  userName,
  verificationUrl,
}) => {
  return {
    body: {
      name: userName,
      intro: "Welcome to Cooksavvy! We're very excited to have you on board.",
      action: {
        instructions:
          "To get started with Cooksavvy and verify your email address, please click the button below:",
        button: {
          color: "#007bff",
          text: "Verify Your Account",
          link: verificationUrl,
        },
      },
      outro: [
        "If you did not create an account, no further action is required.",
        "Need help, or have questions? Just reply to this email, we'd love to assist you.",
      ],
    },
  };
};

export const passwordResetMailGenContent = ({ userName, passwordResetUrl }) => {
  return {
    body: {
      name: userName,
      intro:
        "You are receiving this email because a password reset request has been initiated for your Cooksavvy account.",
      action: {
        instructions: "To reset your password, please click the button below:",
        button: {
          color: "#dc3545",
          text: "Reset Your Password",
          link: passwordResetUrl,
        },
      },
      outro: [
        "If you did not request a password reset, please ignore this email. Your password will remain unchanged.",
        "For security reasons, this password reset link is only valid for a limited time.",
        "If you continue to have issues, please contact our support team.",
      ],
    },
  };
};
