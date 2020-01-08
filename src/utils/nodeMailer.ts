"use strict";
const nodemailer = require("nodemailer");



// async..await is not allowed in global scope, must use a wrapper
export const generateMail = async (args: {email: string, htmlBody: string, emailSender: string}) => {

  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user, // generated ethereal user
      pass: testAccount.pass // generated ethereal password
    }
  });

  // send mail with defined transport object
  const {email, htmlBody, emailSender} = args;
  let info = await transporter.sendMail({
    from: `${emailSender}`, // sender address
    to: `${email}`, // list of receivers
    subject: "Email Confirmation Link", // Subject line
    // text: "Hello world?", // plain text body
    html: `<b>Hello ${email.split('@')[0] || ''},</b>
            <div>${htmlBody}</div>` // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}
