const express = require('express');
const cors = require('cors');
const path = require('path');
const responseGenerator = require('./chatbot/responseGenerator');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Chat server is running' });
});

// Chat endpoint
app.post('/api/chat', (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid request. Message is required.' 
      });
    }
    
    // Generate response based on user message
    const response = responseGenerator.getResponse(message.trim());
    
    res.json({ 
      reply: response,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error processing chat request:', error);
    res.status(500).json({ 
      response: 'Sorry, I encountered an error. Please try again or contact admin for advanced queries.'
    });
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
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api/chat`);
});

module.exports = app;