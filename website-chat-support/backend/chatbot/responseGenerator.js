const intentsData = require('./intents.json');

// Helper function to find intent based on message
function findIntent(message) {
  const lowerMessage = message.toLowerCase();
  
  for (const intent of intentsData.intents) {
    // Skip fallback intent for pattern matching
    if (intent.tag === 'fallback') continue;
    
    for (const pattern of intent.patterns) {
      if (lowerMessage.includes(pattern.toLowerCase())) {
        return intent;
      }
    }
  }
  
  return null;
}

// Generate response based on user message
function getResponse(userMessage, context = "") {
  // Check for empty message
  if (!userMessage || userMessage.trim().length === 0) {
    return "Please type your question or select an option above.";
  }
  
  // Find matching intent
  const intent = findIntent(userMessage);
  
  if (intent) {
    // Select random response from intent's responses array
    const responses = intent.responses;
    const randomIndex = Math.floor(Math.random() * responses.length);
    return responses[randomIndex];
  }
  
  // Use fallback response
  const fallbackIntent = intentsData.intents.find(i => i.tag === 'fallback');
  const fallbackResponses = fallbackIntent.responses;
  const randomIndex = Math.floor(Math.random() * fallbackResponses.length);
  return fallbackResponses[randomIndex];
}

module.exports = {
  getResponse,
  intents: intentsData
};