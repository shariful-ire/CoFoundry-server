import 'dotenv/config';
import app from './src/app.js';
import connectDB from './src/config/db.js';

let dbPromise = null;

function getDB() {
  if (!dbPromise) dbPromise = connectDB();
  return dbPromise;
}

// Vercel serverless: await DB before every request
async function handler(req, res) {
  try {
    await getDB();
  } catch (err) {
    console.error('DB connection failed:', err.message);
    return res.status(503).json({ message: 'Database unavailable' });
  }
  return app(req, res);
}

export default handler;

// Local development
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  getDB().then(() => {
    app.listen(PORT, () =>
      console.log(`CoFoundry server running on http://localhost:${PORT}`)
    );
  });
}
