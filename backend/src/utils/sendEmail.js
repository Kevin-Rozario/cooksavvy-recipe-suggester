import { transporter } from "../config/email.js";
import fs from "fs/promises";
import path from "path";

const sendEmail = async (user, otp) => {
  const otpDigits = otp.split("");

  const emailTemplatePath = path.join(__dirname, "emailTemplate.html");
  console.log(emailTemplatePath);

  try {
    const emailTemplate = await fs.readFile(emailTemplatePath, "utf-8");

    let formattedEmail = emailTemplate;
    formattedEmail = formattedEmail.replace("{{otp1}}", otpDigits[0] || "");
    formattedEmail = formattedEmail.replace("{{otp2}}", otpDigits[1] || "");
    formattedEmail = formattedEmail.replace("{{otp3}}", otpDigits[2] || "");
    formattedEmail = formattedEmail.replace("{{otp4}}", otpDigits[3] || "");
    formattedEmail = formattedEmail.replace("{{otp5}}", otpDigits[4] || "");
    formattedEmail = formattedEmail.replace("{{otp6}}", otpDigits[5] || "");

    const info = await transporter.sendMail({
      from: process.env.SENDER_EMAIL_ID,
      to: user.email,
      subject: "Verification Email from Cooksavvy.",
      html: formattedEmail,
    });

    return info.messageId;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

export { sendEmail };
