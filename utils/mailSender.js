// const nodemailer = require("nodemailer");
// const { options } = require("../app");

// const sendEmail = async (options) => {
//   try {
//     // 1) Create a transporter
//     const transporter = nodemailer.createTransport({
//       host: process.env.EMAIL_HOST,
//       port: process.env.EMAIL_PORT,
//       auth: {
//         user: process.env.EMAIL_USERNAME,
//         pass: process.env.EMAIL_PASSWORD,
//       },
//       tls: {
//         rejectUnauthorized: false,
//       },
//       timeout: 40000,
//     });

//     // 2) Define the email options
//     const mailOptions = {
//       from: `islahuddin <${process.env.EMAIL_USERNAME}>`,
//       to: options.email,
//       subject: options.subject,
//       text: options.message,
//     };

//     // 3) Actually send the email
//     await transporter.sendMail(mailOptions);

//     console.log("Email sent successfully!");
//   } catch (error) {
//     console.error("Error sending email:", error);
//   }
// };

// module.exports = sendEmail;

const nodeMailer = require("nodemailer");
const pug = require("pug");
const htmlToText = require("html-to-text");

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split("")[0];
    this.url = url;
    this.from = `wordsnap team <${process.env.EMAIL_FROM}>`;
  }
  newTransport() {
    if (process.env.NODE_ENV === "prduction") {
      //sandgrid
      return 1;
    }
    return nodeMailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  //send actual email

  async send(template, subject) {
    // Render HTML based on a Pug template
    const html = pug.renderFile(
      `${__dirname}/../templates/email/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      }
    );

    //Define EmailOptions
    const mailOptions = {
      from: this.from,
      to: this.email,
      subject,
      html,
      text: htmlToText.fromString(html),
    };

    await this.newTransport().sendMail(mailOptions);
  }
  async sendWelcome() {
    await this.send("welcome", "welcome to the worldsnap!");
  }
};
const sendEmail = async (options) => {
  //define the email options
  const mailOptions = {
    from: "worldsnap team <hello@worldsnap.io>",
    to: options.email,
    subject: options.subject,
    text: options.message,
    //html
  };
  //actually send the email
  await transporter.sendMail(mailOptions);
};
