import axios from "axios";

const BREVO_API_KEY = process.env.BREVO_API_KEY;

if (!BREVO_API_KEY) {
  console.warn("⚠️ BREVO_API_KEY not configured");
}

export const sendBrevoEmail = async ({
  to,
  subject,
  htmlContent,
}: {
  to: string;
  subject: string;
  htmlContent: string;
}) => {
  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "DK Edufin",
          email: process.env.SENDER_EMAIL,
        },
        to: [{ email: to }],
        subject,
        htmlContent,
      },
      {
        headers: {
          accept: "application/json",
          "api-key": BREVO_API_KEY,
          "content-type": "application/json",
        },
      }
    );

    console.log("✅ Email sent via Brevo API:", response.data);
    return response.data;
  } catch (error: any) {
    console.error(
      "❌ Brevo API Error:",
      error.response?.data || error.message
    );
    throw new Error("Failed to send email");
  }
};