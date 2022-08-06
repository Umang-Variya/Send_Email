const nodemailer = require("nodemailer");

const sendEmail = async (email, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      port: 587,
      secure: false,
      auth: {
        user: 'umangvariya77@gmail.com',
        pass: 'xxibhhhcgzcretpr',
      },
    });

    await transporter.sendMail({
      from: 'umangvariya77@gmail.com',
      to: email,
      subject: subject,
      text: text,
    });
    console.log("Email sent sucessfully");
  } catch (error) {
    console.log("Email not sent");
    console.log(error);
  }
};

module.exports = sendEmail;