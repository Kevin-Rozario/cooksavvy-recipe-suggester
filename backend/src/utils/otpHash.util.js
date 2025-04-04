import crypto from "crypto";

const hashOtp = (otp) => {
  const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
  return hashedOtp;
};

export { hashOtp };
