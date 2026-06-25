// api/messages.js — Vercel Serverless Function
// GET /api/messages?key=YOUR_ADMIN_KEY  →  returns all saved messages

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'portfolio';
const COLLECTION = 'messages';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed.' });

  const key = req.query.key;
  if (!process.env.ADMIN_KEY || key !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const messages = await db.collection(COLLECTION).find({}).sort({ receivedAt: -1 }).toArray();
    return res.status(200).json(messages);
  } catch (err) {
    console.error('MongoDB read failed:', err.message);
    return res.status(500).json({ error: 'Could not retrieve messages.' });
  } finally {
    await client.close();
  }
};
