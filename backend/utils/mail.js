const nodemailer = require("nodemailer");
module.exports = async (emailOptions) => {
    // create transporter
    let transporter;
    if (process.env.ENV == 'delevelopment') {
        transporter = nodemailer.createTransport({
            host: "sandbox.smtp.mailtrap.io",
            port: 2525,
            auth: {
                user: process.env.MAILER_USERNAME,
                pass: process.env.MAILER_PASSWORD,
            }
        })
    } else {
        transporter = nodemailer.createTransport({
            host: 'smtp.sendgrid.net',
            port: 587,
            auth: {
                user: process.env.SENDGRID_APIKEY,
                pass: process.env.SENDGRID_PASSWORD
            }
        })
    }

    // send email from transport
    await transporter.sendMail({
        from: "GaugeHaus <abdorabie14@gmail.com>",
        to: emailOptions.email,
        subject: emailOptions.subject,
        html: emailOptions.html,
        text: emailOptions.text
    })
}