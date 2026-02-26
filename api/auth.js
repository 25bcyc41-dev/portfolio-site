// Demo credentials
const DEMO_USERNAME = 'admin';
const DEMO_PASSWORD = 'demo123';

// API handler
export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          error: 'Missing username or password'
        });
      }

      if (username === DEMO_USERNAME && password === DEMO_PASSWORD) {
        return res.status(200).json({
          success: true,
          message: 'Login successful ✅',
          token: Buffer.from(`${username}:${password}`).toString('base64')
        });
      }

      return res.status(401).json({
        error: 'Invalid credentials'
      });
    } catch (error) {
      console.error('Auth error:', error.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
