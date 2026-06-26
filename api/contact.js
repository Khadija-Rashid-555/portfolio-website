const { MongoClient } = require('mongodb');
const nodemailer = require('nodemailer');
 
// ── helpers ────────────────────────────────────────────────────────────────
function setCors(res, origin) {
  const allowed = process.env.ALLOWED_ORIGIN || '*';
  const o = allowed === '*' ? '*' : (origin === allowed ? origin : '');
  if (o) res.setHeader('Access-Control-Allow-Origin', o);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}
 
// ── main handler ───────────────────────────────────────────────────────────
module.exports = async function handler(req, res) {
  setCors(res, req.headers.origin);
 
  // preflight
  if (req.method === 'OPTIONS') return res.status(200).end();
 
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
 
  // ── 1. validate input ──────────────────────────────────────────────────
  const { name, email, message } = req.body || {};
 
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
 
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }
 
  // ── 2. save to MongoDB ─────────────────────────────────────────────────
  let savedToDb = false;
  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db('portfolio');
    await db.collection('messages').insertOne({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
      createdAt: new Date(),
      ip: req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown'
    });
    await client.close();
    savedToDb = true;
  } catch (dbErr) {
    console.error('[contact] MongoDB error:', dbErr.message);
    // continue – still try to send email
  }
 
  // ── 3. send email ──────────────────────────────────────────────────────
  let emailSent = false;
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
 
    await transporter.sendMail({
      from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO,
      replyTo: email,
      subject: `New message from ${name} — Portfolio`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:auto;padding:24px;background:#f9f9f9;border-radius:8px;">
          <h2 style="color:#ff2d8b;margin:0 0 16px;">New portfolio message</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <hr style="margin:16px 0;border:none;border-top:1px solid #ddd;">
          <p style="white-space:pre-wrap;">${message}</p>
        </div>`
    });
    emailSent = true;
  } catch (mailErr) {
    console.error('[contact] Email error:', mailErr.message);
  }
 
  // ── 4. respond ─────────────────────────────────────────────────────────
  if (!savedToDb && !emailSent) {
    return res.status(500).json({
      error: 'Could not save message. Please try again later.'
    });
  }
 
  return res.status(200).json({
    success: true,
    message: "Message received! I'll get back to you soon 💌"
  });
};
 
