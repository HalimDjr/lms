const nodemailer = require("nodemailer");

const mailSender = async (email, title, body) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: "EPBLearn || by Djafri Halim",
      to: email,
      subject: title,
      html: body,
    });

    console.log("Email sent successfully to:", email);
    return info;
  } catch (error) {
    console.error("Error while sending mail to", email, ":", error);
    throw error; // Re-throw the error so the calling function knows it failed
  }
};

module.exports = mailSender;
