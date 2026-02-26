import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../data/messages.json');

// In-memory store for new messages (during deployment)
let messagesCache = null;

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

// Save message (in-memory + attempt to write to file)
function saveMessage(name, email, message) {
  const messages = getMessages();
  const newMessage = {
    id: messages.length > 0 ? Math.max(...messages.map(m => m.id)) + 1 : 1,
    name: name.trim(),
    email: email.trim(),
    message: message.trim(),
    timestamp: new Date().toISOString()
  };
  
  messages.push(newMessage);
  messagesCache = messages;
  
  // Try to write to file (may fail on Vercel but works locally)
  try {
    fs.writeFileSync(dbPath, JSON.stringify(messages, null, 2), 'utf-8');
    console.log(`[Saved] Message #${newMessage.id} persisted to file`);
  } catch (writeError) {
    console.warn(`[Cache] Message #${newMessage.id} saved in memory (not persisted to file)`);
  }
  
  return newMessage;
}}

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

      if (!name || !email || !message) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const saved = saveMessage(name, email, message);
      return res.status(200).json({
        success: true,
        message: 'Message saved successfully ✅',
        data: saved
      });
    } catch (error) {
      return res.status(500).json({ error: error.message || 'Failed to save message' });
    }
  }

  if (req.method === 'GET') {
    try {
      const messages = getMessages();
      return res.status(200).json(messages);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to retrieve messages' });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
