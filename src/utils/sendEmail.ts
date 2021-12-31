import nodemailer from "nodemailer";

export async function sendEmail(to: string, html: string) {
  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: "zwzbnaxbakz2ebtj@ethereal.email",
      pass: "JCwGd9dKYCcCmSEtNU",
    },
  });

  let info = await transporter.sendMail({
    from: "Cameron Tredoux <camtredoux@gmail.com>",
    to: to,
    subject: "Change Password",
    html: html,
  });

  console.log("Message sent: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}
