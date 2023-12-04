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

///////2222//////

// const nodeMailer = require("nodemailer");
// const pug = require("pug");
// const htmlToText = require("html-to-text");

// module.exports = class Email {
//   constructor(user, url) {
//     this.to = user.email;
//     this.firstName = user.name.split(" ")[0];
//     this.url = url;
//     this.from = `wordsnap team <${process.env.EMAIL_FROM}>`;
//   }

//   newTransport() {
//     if (process.env.NODE_ENV === "production") {
//       // Use the transport for production (e.g., SendGrid)
//       // Replace the following with the appropriate transport configuration
//       return nodeMailer.createTransport({
//         service: "SendGrid",
//         auth: {
//           user: process.env.SENDGRID_USERNAME,
//           pass: process.env.SENDGRID_PASSWORD,
//         },
//       });
//     }

//     return nodeMailer.createTransport({
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
//   }

//   // Send actual email
//   async send(templates, subject) {
//     // Render HTML based on a Pug template
//     const html = pug.renderFile(
//       `${__dirname}/../templates/views/${templates}.pug`,
//       {
//         firstName: this.firstName,
//         url: this.url,
//         subject,
//       }
//     );

//     // Define EmailOptions
//     const mailOptions = {
//       from: this.from,
//       to: this.to,
//       subject,
//       html,
//       text: htmlToText.fromString(html), // Convert HTML to plain text
//     };

//     // Send the email using the transport
//     await this.newTransport().sendMail(mailOptions);
//   }

//   async sendWelcome() {
//     await this.send(
//       "welcome",
//       "Welcome to Wordsnap! Your registration is successful."
//     );
//   }

//   async sendPasswordReset() {
//     await this.send(
//       "passwordReset",
//       "Your password reset token (valid for 10 minutes)"
//     );
//   }
// };

// ////3333//////

const nodemailer = require("nodemailer");
const pug = require("pug");

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name;

    this.url = url;
    this.from = `WordSnap App <${process.env.GMAILUSER}>`;
  }

  newTransport() {
    // Send Grid
    return nodemailer.createTransport({
      service: "gmail",
      host: process.env.USER_HOST,
      // port: process.env.USER_PORT,
      auth: {
        user: process.env.GMAILUSER,
        pass: process.env.GMAILPASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
      // auth: {
      //   user: process.env.GMAILUSER,

      //   pass: process.env.GMAILPASS,
      // },
    });
  }
  async send(template, subject) {
    console.log(this.from);
    console.log(this.to);
    console.log(process.env.GMAILUSER);
    console.log(process.env.GMAILPASS);

    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      text: template,
    };
    // 3)Creat a transport and send email

    await this.newTransport().sendMail(mailOptions);
  }
  async sendWelcome(a) {
    console.log("sending mail...");
    await this.send(
      `Your OTP is: ${a}`,
      `Email Verification For WorldSnap App`
    );
  }

  // async sendGuardianWelcome(a) {
  //   console.log("sending mail...");
  //   await this.send(
  //     `Welcome, Your Join OTP is: ${a}`,
  //     `Account Setup Verification For Guardian Trace App`
  //   );
  // }

  async sendPasswordReset(a) {
    await this.send(
      `Password Reset Code is:${a}`,
      "Your password reset token ! ( valid for 10 minutes)"
    );
  }
};
