// /**
//  * Resend Configuration
//  * Uses Resend API to send emails
//  */

// import { Resend } from "resend";

// const RESEND_API_KEY = process.env.RESEND_API_KEY;

// export const SENDER_EMAIL =
//   process.env.SENDER_EMAIL || "onboarding@resend.dev";

// export const resend = RESEND_API_KEY
//   ? new Resend(RESEND_API_KEY)
//   : null;

// if (resend) {
//   console.log(
//     `✅ Resend configured. Sending emails from: ${SENDER_EMAIL}`
//   );
// } else {
//   console.warn(
//     "⚠️ Resend API key not configured. Emails will be logged only."
//   );
// }