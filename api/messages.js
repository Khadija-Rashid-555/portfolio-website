const { MongoClient } = require('mongodb');
 
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
 
  // ── auth check ─────────────────────────────────────────────────────────
  const key = req.query.key;
  if (!key || key !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized. Provide ?key=YOUR_ADMIN_KEY' });
  }
 
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
 
  // ── fetch from MongoDB ─────────────────────────────────────────────────
  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db('portfolio');
    const messages = await db
      .collection('messages')
      .find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();
    await client.close();
 
    return res.status(200).json({
      success: true,
      count: messages.length,
      messages
    });
  } catch (err) {
    console.error('[messages] MongoDB error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch messages.' });
  }
};
 
