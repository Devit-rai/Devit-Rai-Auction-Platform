import nodemailer from "nodemailer";
import User from "../models/User.js";
import config from "../config/config.js";

export const sendWinnerEmail = async (userId, auction) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.email) return;

    const transporter = nodemailer.createTransport({
      service: "gmail", 
      port: 465,
      secure: true,
      auth: {
        user: config.smtp_mail,
        pass: config.smtp_password,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `Congratulations! You won the auction: ${auction.title}`,
      html: `
        <h3>Hi ${user.name},</h3>
        <p>Congratulations! You won the auction <b>${auction.title}</b> with a bid of <b>${auction.winner.amount}</b>.</p>
        <p>Please contact the seller to complete the transaction.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Winner email sent to:", user.email);
  } catch (error) {
    console.error("Error sending winner email:", error.message);
  }
};
