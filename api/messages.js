import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../data/messages.json');

// In-memory store for messages (shared across requests in same deployment)
let messagesCache = null;

// Validate authentication token
function validateToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  const token = authHeader.substring(7);
  const expectedToken = Buffer.from('admin:password123').toString('base64');
  return token === expectedToken;
}

// Initialize cache from stored JSON file
function initializeCache() {
  if (messagesCache !== null) return messagesCache;
  
  try {
    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath, 'utf-8');
      const parsed = JSON.parse(data || '[]');
      messagesCache = Array.isArray(parsed) ? parsed : [];
    } else {
      messagesCache = [];
    }
  } catch (error) {
    console.error('Error loading messages:', error.message);
    messagesCache = [];
  }
  return messagesCache;
}

// Get all messages
function getMessages() {
  return initializeCache();
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
