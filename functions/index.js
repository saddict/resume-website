const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: functions.config().gmail.email,
        pass: functions.config().gmail.password,
    },
});

exports.sendContactEmail = functions.firestore
    .document("contacts/{docId}")
    .onCreate(async (snap) => {
        const { name, email, message } = snap.data();

        const mailOptions = {
            from: `"Portfolio Contact" <${functions.config().gmail.email}>`,
            to: "saditya495@gmail.com",
            subject: `New message from ${name}`,
            html: `
                <h2>New portfolio contact</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                <p><strong>Message:</strong></p>
                <p style="white-space:pre-wrap">${message}</p>
            `,
            replyTo: email,
        };

        await transporter.sendMail(mailOptions);
    });
