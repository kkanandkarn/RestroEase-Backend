const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});
const sendMail = async (email, subject, html) => {
  let mailOptions = {
    to: email,
    from: process.env.EMAIL,
    subject: subject,
    importance: "high",
    html: html,
  };

  await transporter.sendMail(mailOptions, async (error, info) => {
    if (error) {
      console.log(error);
    }
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  });
  console.log("message sent sucess");
  return { sucess: true };
};
module.exports = {
  sendMail,
};
