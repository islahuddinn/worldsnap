// const nodemailer = require("nodemailer");

// const sendEmail = async (options) => {
//   // 1) create a transporter
//   const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,
//     auth: {
//       user: process.env.EMAIL_USERNAME,
//       pass: process.env.EMAIL_PASSWORD,
//     },
//   });

//   // 2) Define the email options
//   const mailOptions = {
//     from: "islahuddin <islahuddin87@gmail.com>",
//     to: options.email,
//     subject: options.subject,
//     text: options.message,
//   };
//   // 3) Actually send the email

//   await transporter.sendMail(mailOptions);
// };

// module.exports = sendEmail;

const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  try {
    // 1) Create a transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false, // Accept self-signed certificates
      },
    });

    // 2) Define the email options
    const mailOptions = {
      from: `islahuddin <${process.env.EMAIL_USERNAME}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
    };

    // 3) Actually send the email
    await transporter.sendMail(mailOptions);

    console.log("Email sent successfully!");
  } catch (error) {
    console.error("Error sending email:", error);
    // Handle the error accordingly, you might want to throw it or return a specific value
  }
};

module.exports = sendEmail;
