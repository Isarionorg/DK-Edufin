import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID!;

const client = twilio(accountSid, authToken);

export async function sendPhoneOtp(phone: string): Promise<void> {
  await client.verify.v2
    .services(verifyServiceSid)
    .verifications.create({ to: phone, channel: "sms" });
}

export async function checkPhoneOtp(
  phone: string,
  code: string
): Promise<boolean> {
  const result = await client.verify.v2
    .services(verifyServiceSid)
    .verificationChecks.create({ to: phone, code });
  return result.status === "approved";
}