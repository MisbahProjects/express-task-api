import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// ----------------- CREATE TRANSPORTER -----------------
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ----------------- VERIFY CONNECTION -----------------
transporter.verify((err) => {
  if (err) console.error(" SMTP Connection Error:", err.message);
  else console.log(" SMTP Connected Successfully");
});

// ----------------- SEND EMAIL FUNCTION -----------------
export async function sendEmail(
  to,
  subject,
  type,
  data = {},
  forceSend = false
) {
  try {
    let content = "";

    // ----------------- EMAIL TEMPLATES -----------------
    switch (type) {
      case "otp":
        content = `
          <p>Hi ${data.name || "User"},</p>
          <p>Please use the OTP below to verify your account:</p>
          <h2 style="text-align:center;background:#1a73e8;color:white;padding:15px;border-radius:8px;">
            ${data.otp}
          </h2>
          <p style="font-size:14px;color:#555;text-align:center;">
            This OTP will expire in <b>10 minutes</b>.
          </p>
        `;
        break;

      case "verified":
        content = `
          <p>Hi ${data.name || "User"},</p>
          <p>Your account has been <b>successfully verified</b> ✅</p>
          <p>You can now login and manage your tasks.</p>
        `;
        break;

      case "reset":
        content = `
          <p>Hi ${data.name || "User"},</p>
          <p>You requested to reset your password.</p>
          <h2 style="text-align:center;background:#e53935;color:white;padding:15px;border-radius:8px;">
            ${data.otp}
          </h2>
          <p style="font-size:14px;color:#555;text-align:center;">
            This OTP will expire in <b>10 minutes</b>.
          </p>
        `;
        break;

      case "passwordChanged":
        content = `
          <p>Hello ${data.name || "User"},</p>
          <p>Your password has been changed successfully ✅</p>
          <p>If this was not you, please contact support immediately.</p>
        `;
        break;

      default:
        content = `
          <p>Hello ${data.name || "User"},</p>
          <p>This is a notification from <b>Taskify</b> ✅</p>
        `;
    }

    if (data.role) {
      content += `<p style="font-size:12px;color:#777;">Role: ${data.role}</p>`;
    }

    const html = `
      <div style="
        font-family:Arial,sans-serif;
        max-width:600px;
        margin:auto;
        padding:25px;
        background:#f8f8f8;
        border-radius:12px;
        border:1px solid #eee;
      ">
        <div style="text-align:center;margin-bottom:20px;">
          <h2 style="color:#1a73e8;">Taskify ✅</h2>
        </div>

        ${content}

        <hr style="margin:25px 0;border:none;border-top:1px solid #eee;" />
        <p style="font-size:12px;text-align:center;color:#888;">
          Need help?
          <a href="mailto:${process.env.SENDER_EMAIL}" style="color:#1a73e8;">
            Contact Support
          </a>
        </p>
      </div>
    `;

    if (process.env.NODE_ENV === "development" && !forceSend) {
      console.log(`
📧 [DEV EMAIL]
To: ${to}
Subject: ${subject}
Type: ${type}
-----------------------
${html}
`);
      return { success: true, messageId: "[DEV_MODE]" };
    }

    const info = await transporter.sendMail({
      from: `"Taskify" <${process.env.SENDER_EMAIL}>`,
      to,
      subject,
      html,
    });

    console.log(`✅ Email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Email error:", error.message);
    throw new Error("Email send failed");
  }
}

export default sendEmail;
