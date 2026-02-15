const express = require('express');
const cors = require('cors');
const path = require('path');
const responseGenerator = require('./chatbot/responseGenerator');
const ragService = require('./services/ragService');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
}

// Initialize RAG-based chatbot
console.log('\n Initializing RAG-based Banking Chatbot...');
console.log('\n Knowledge base loaded and ready for semantic search');

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Chat server is running',
    services: ['rag-chat', 'emotion-detection', 'voice-chat'],
    ragEnabled: true
  });
});

// =============================================
// EMOTION-AWARE CHAT ROUTES WITH RAG (NEW)
// =============================================
const chatRoutes = require('./routes/chat');
app.use('/api/chat', chatRoutes);

// =============================================
// LEGACY ENDPOINT (For backward compatibility)
// =============================================
// This endpoint is kept for backward compatibility with old frontend
app.post('/api/legacy-chat', (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid request. Message is required.' 
      });
    }
    
    // Generate response based on user message (old method)
    const response = responseGenerator.getResponse(message.trim());
    
    res.json({ 
      reply: response,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error processing legacy chat request:', error);
    res.status(500).json({ 
      response: 'Sorry, I encountered an error. Please try again or contact admin for advanced queries.'
    });
  }
});

// =============================================
// DEBUG ENDPOINT - RAG Metrics
// =============================================
app.post('/api/rag-metrics', (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message required' });
    }
    
    const metrics = ragService.getRetrievalMetrics(message);
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving metrics' });
  }
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`\n Banking Chatbot Server Running`);
  console.log(` Base URL: http://localhost:${PORT}`);
  console.log(`\n Available Endpoints:`);
  console.log(`\n RAG-Powered Emotion-Aware Chat:`);
  console.log(`      POST   /api/chat              - Text chat with emotion detection + RAG`);
  console.log(`      POST   /api/chat/voice        - Voice chat with emotion adaptation + RAG`);
  console.log(`      GET    /api/chat/history      - Get conversation history`);
  console.log(`      POST   /api/chat/clear        - Clear conversation`);
  console.log(`\n Utilities:`);
  console.log(`      GET    /api/health            - Health check`);
  console.log(`      POST   /api/legacy-chat       - Legacy endpoint (backward compatible)`);
  console.log(`      POST   /api/rag-metrics       - RAG retrieval metrics (debug)`);
  //console.log(`\n RAG System + Emotion Recognition Active\n`);
});

module.exports = app;