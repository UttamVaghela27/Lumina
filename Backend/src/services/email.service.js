require("dotenv").config();
// const nodemailer = require("nodemailer");
const { BrevoClient } = require("@getbrevo/brevo");
const { google } = require("googleapis");

let client;

function getBrevoClient() {
  if (!client) {
    if (!process.env.BREVO_PASS) {
      console.error("❌ BREVO_PASS is missing from environment variables!");
    }
    client = new BrevoClient({
      apiKey: process.env.BREVO_PASS,
    });
  }
  return client;
}

async function sendEmail(to, subject, text, html) {
  if (typeof to === "object" && !Array.isArray(to)) {
    const options = to;
    to = options.to;
    subject = options.subject;
    text = options.text;
    html = options.html;
  }

  try {
    console.log("📤 Sending email via Brevo SDK to:", to);

    const brevoClient = getBrevoClient();
    const data = await brevoClient.transactionalEmails.sendTransacEmail({
      subject: subject,
      htmlContent: html,
      sender: { name: "Lumina", email: process.env.GOOGLE_USER },
      to: [{ email: to }],
      textContent: text,
    });

    console.log(
      "✅ Email sent successfully via Brevo SDK. Message ID:",
      data.messageId,
    );
    return data;
  } catch (error) {
    console.error("❌ MAIL ERROR:", error.message);
    if (error.response?.data) {
      console.error(
        "❌ BREVO RESPONSE ERROR:",
        JSON.stringify(error.response.data),
      );
    }
    throw error;
  }
}

module.exports = sendEmail;
