/**
 * Response Generation Engine with Emotion Awareness
 * Generates contextually relevant responses with emotional intelligence
 * Maintains conversation history for multi-turn understanding
 */

const EmotionDetector = require('./emotionDetector');

class ResponseEngine {
  constructor(intents) {
    this.intents = intents || [];
    this.emotionDetector = new EmotionDetector();
    this.conversationHistory = [];
  }

  /**
   * Generate contextual response with emotion awareness
   * @param {string} userInput - User message
   * @param {Object} userData - User context (optional)
   * @returns {Object} - Response with metadata
   */
  generateResponse(userInput, userData = {}) {
    // Detect emotion from user input
    const emotionData = this.emotionDetector.detectEmotion(userInput);

    // Find matching intent
    const matchedIntent = this.findBestIntent(userInput);

    // Build response
    let response = "";
    let metadata = {
      emotion: emotionData.emotion,
      confidence: emotionData.confidence,
      intensity: emotionData.intensity,
      requiresEscalation: false,
      suggestedActions: []
    };

    if (matchedIntent) {
      // Use base response from matched intent
      response = matchedIntent.responses[
        Math.floor(Math.random() * matchedIntent.responses.length)
      ];

      // Add empathetic prefix if intent is marked as empathetic
      if (matchedIntent.empathetic) {
        const prefix = this.emotionDetector.getEmpatheticPrefix(
          emotionData.emotion,
          emotionData.intensity
        );
        response = `${prefix} ${response}`;
      }

      // Check for escalation scenarios
      if (matchedIntent.escalate && emotionData.confidence > 0.7) {
        metadata.requiresEscalation = true;
        response += " I'm connecting you with our specialist team to ensure your concerns are handled with priority.";
      }
    } else {
      // Generate fallback response based on detected emotion
      response = this.generateFallbackResponse(emotionData, userInput);
    }

    // Add context-aware suggested actions
    metadata.suggestedActions = this.getSuggestedActions(
      emotionData.emotion,
      matchedIntent
    );

    // Store in conversation history
    this.conversationHistory.push({
      timestamp: new Date(),
      userInput,
      emotion: emotionData,
      response,
      intent: matchedIntent?.tag
    });

    return {
      text: response,
      metadata,
      conversationContext: this.getConversationContext()
    };
  }

  /**
   * Find best matching intent using pattern matching
   * @param {string} userInput - User message
   * @returns {Object} - Matched intent or null
   */
  findBestIntent(userInput) {
    const lowerInput = userInput.toLowerCase();
    let bestMatch = null;
    let highestScore = 0;

    for (const intent of this.intents) {
      if (!intent.patterns) continue;
      
      for (const pattern of intent.patterns) {
        if (lowerInput.includes(pattern.toLowerCase())) {
          const score = pattern.length / userInput.length;
          if (score > highestScore) {
            highestScore = score;
            bestMatch = intent;
          }
        }
      }
    }

    return bestMatch;
  }

  /**
   * Generate fallback response for unmatched intents
   * @param {Object} emotionData - Detected emotion
   * @param {string} userInput - Original user input
   * @returns {string} - Fallback response
   */
  generateFallbackResponse(emotionData, userInput) {
    const fallbacks = {
      angry: "I understand this is frustrating. Could you tell me more about what you need? I want to help resolve this.",
      frustrated: "I know this is annoying. Let me find the right solution for you. Can you give me more details?",
      sad: "I'm here to support you. Tell me what's wrong, and we'll work through it together.",
      happy: "That's great! I'm happy to help with whatever you need.",
      neutral: "I want to make sure I understand correctly. Could you provide more details about what you need?"
    };

    return fallbacks[emotionData.emotion] || fallbacks.neutral;
  }

  /**
   * Get suggested actions based on emotion and context
   * @param {string} emotion - Detected emotion
   * @param {Object} intent - Matched intent
   * @returns {Array} - Suggested actions
   */
  getSuggestedActions(emotion, intent) {
    const actions = [];

    if (emotion === "angry" || emotion === "frustrated") {
      actions.push("Connect with support specialist");
      actions.push("View help documentation");
    }

    if (emotion === "sad") {
      actions.push("View available support resources");
      actions.push("Schedule callback");
    }

    if (emotion === "happy") {
      actions.push("Explore premium services");
      actions.push("Share feedback");
    }

    if (intent?.tag?.includes("account_issue") || intent?.tag?.includes("complaint")) {
      actions.push("Reset account credentials");
      actions.push("Verify identity");
    }

    return actions.slice(0, 2);
  }

  /**
   * Get conversation context for multi-turn understanding
   * @returns {Object} - Recent conversation context
   */
  getConversationContext() {
    const recentHistory = this.conversationHistory.slice(-5);
    const emotionalTrend = this.analyzeEmotionalTrend(recentHistory);

    return {
      recentTurns: recentHistory.length,
      dominantEmotion: emotionalTrend,
      conversationLength: this.conversationHistory.length
    };
  }

  /**
   * Analyze emotional trend in conversation
   * @param {Array} history - Recent conversation history
   * @returns {string} - Trend emotion
   */
  analyzeEmotionalTrend(history) {
    if (history.length === 0) return "neutral";

    const emotionCounts = {};
    history.forEach(turn => {
      const emotion = turn.emotion.emotion;
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
    });

    return Object.keys(emotionCounts).reduce((a, b) =>
      emotionCounts[a] > emotionCounts[b] ? a : b
    );
  }

  /**
   * Clear conversation history
   */
  clearHistory() {
    this.conversationHistory = [];
  }

  /**
   * Get conversation history
   * @returns {Array} - Conversation history
   */
  getHistory() {
    return this.conversationHistory;
  }
}

module.exports = ResponseEngine;