const nodemailer = require("nodemailer");
module.exports = async (emailOptions) => {
    // create transporter
    const transporter = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
            user: process.env.MAILER_USERNAME,
            pass: process.env.MAILER_PASSWORD,
        }
    })

    // send email from transport
    await transporter.sendMail({
        from: "A.azim <a.azim.rabie@gmail.com>",
        to: emailOptions.email,
        subject: emailOptions.subject,
        text: emailOptions.content
    })
}