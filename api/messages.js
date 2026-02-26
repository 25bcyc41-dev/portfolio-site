import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../data/messages.json');

// Helper to validate token
function validateToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  // Token format: Bearer <base64(username:password)>
  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  const expectedToken = Buffer.from('admin:password123').toString('base64');
  return token === expectedToken;
}

// Get all messages
function getMessages() {
  try {
    if (!fs.existsSync(dbPath)) {
      return [];
    }
    const data = fs.readFileSync(dbPath, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (error) {
    console.error('Error reading messages:', error.message);
    return [];
  }
}

// API handler
export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    try {
      // Check authorization
      const authHeader = req.headers.authorization;
      if (!validateToken(authHeader)) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const messages = getMessages();
      return res.status(200).json(messages);
    } catch (error) {
      console.error('Error:', error.message);
      return res.status(500).json({ error: 'Failed to retrieve messages' });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
