import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.verify();
    console.log("✅ SMTP Connected");

    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: options.email,
      subject: options.subject,
      text: options.message,
    });

    console.log("✅ Mail Sent");
  } catch (err) {
    console.error("❌ Mail Error:", err);
    throw err;
  }
};

export default sendEmail;