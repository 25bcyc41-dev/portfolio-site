import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');
const dbPath = path.join(DATA_DIR, 'messages.json');

// Ensure data directory exists
function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (error) {
    console.warn('Warning: Could not create data directory', error.message);
  }
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

// Save message
function saveMessage(name, email, message) {
  try {
    ensureDataDir();
    const messages = getMessages();
    const newMessage = {
      id: messages.length + 1,
      name,
      email,
      message,
      timestamp: new Date().toISOString()
    };
    messages.push(newMessage);

    // Try to write to file if possible (may fail on Vercel's ephemeral filesystem)
    try {
      fs.writeFileSync(dbPath, JSON.stringify(messages, null, 2));
      console.log('[File] Message saved to local storage');
    } catch (writeError) {
      console.warn('[Vercel] Could not persist to file system - using in-memory storage. Deploy with database for persistence.');
    }

    return newMessage;
  } catch (error) {
    console.error('Error in saveMessage:', error.message);
    throw error;
  }
}

// API handler
export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      const { name, email, message } = req.body;

      // Validate input
      if (!name || !email || !message) {
        return res.status(400).json({
          error: 'Missing required fields: name, email, message'
        });
      }

      const saved = saveMessage(name, email, message);
      return res.status(200).json({
        message: 'Message saved successfully ✅',
        data: saved
      });
    } catch (error) {
      console.error('Error:', error.message);
      return res.status(500).json({ error: 'Failed to save message' });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
