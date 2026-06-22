const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();
const db = admin.firestore();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: functions.config().gmail.email,
        pass: functions.config().gmail.password,
    },
});

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;");
}

const MAX_PER_WINDOW = 3;
const WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

exports.submitContact = functions.https.onCall(async (data, context) => {
    const { name, email, message } = data || {};

    // Input validation
    if (!name || !email || !message ||
        typeof name !== "string" || typeof email !== "string" || typeof message !== "string") {
        throw new functions.https.HttpsError("invalid-argument", "All fields are required.");
    }
    if (name.length > 100 || email.length > 200 || message.length > 2000) {
        throw new functions.https.HttpsError("invalid-argument", "Input exceeds maximum length.");
    }
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
        throw new functions.https.HttpsError("invalid-argument", "Invalid email address.");
    }

    // IP-based rate limiting: max 3 submissions per IP per 24 hours
    const rawIp =
        context.rawRequest.headers["x-forwarded-for"] ||
        context.rawRequest.ip ||
        "unknown";
    const ip = rawIp.split(",")[0].trim().replace(/[^a-zA-Z0-9._-]/g, "_");
    const now = Date.now();
    const rateLimitRef = db.collection("rate_limits").doc(ip);

    const allowed = await db.runTransaction(async (tx) => {
        const doc = await tx.get(rateLimitRef);
        if (!doc.exists || doc.data().resetAt < now) {
            tx.set(rateLimitRef, { count: 1, resetAt: now + WINDOW_MS });
            return true;
        }
        const { count } = doc.data();
        if (count >= MAX_PER_WINDOW) return false;
        tx.update(rateLimitRef, { count: count + 1 });
        return true;
    });

    if (!allowed) {
        throw new functions.https.HttpsError(
            "resource-exhausted",
            "Too many messages from your location. Please try again tomorrow."
        );
    }

    // Send email first — if this fails the user sees an error and can retry
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeMessage = escapeHtml(message);

    await transporter.sendMail({
        from: `"Portfolio Contact" <${functions.config().gmail.email}>`,
        to: "saditya495@gmail.com",
        subject: `New message from ${safeName}`,
        html: `
            <h2>New portfolio contact</h2>
            <p><strong>Name:</strong> ${safeName}</p>
            <p><strong>Email:</strong> <a href="mailto:${safeEmail}">${safeEmail}</a></p>
            <p><strong>Message:</strong></p>
            <p style="white-space:pre-wrap">${safeMessage}</p>
        `,
        replyTo: email,
    });

    // Store contact record after successful email
    await db.collection("contacts").add({
        name,
        email,
        message,
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
});
