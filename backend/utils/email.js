import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  try {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log("\n⚠️  SMTP Settings are not configured in .env. Logging email details:");
      console.log("======================================================================");
      console.log(`✉️  FROM   : ${process.env.FROM_EMAIL || 'support@fleetmanagement.com'}`);
      console.log(`✉️  TO     : ${options.email}`);
      console.log(`✉️  SUBJECT: ${options.subject}`);
      console.log("----------------------------------------------------------------------");
      if (options.message) {
        console.log(`✉️  TEXT:\n${options.message}`);
      }
      if (options.html) {
        console.log(`✉️  HTML:\n${options.html}`);
      }
      console.log("======================================================================\n");
      return;
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.verify();
    console.log("✅ SMTP Connected");

    await transporter.sendMail({
      from: process.env.FROM_EMAIL || 'support@fleetmanagement.com',
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html,
    });

    console.log("✅ Mail Sent");
  } catch (err) {
    console.error("❌ Mail Error:", err);
    throw err;
  }
};

export default sendEmail;