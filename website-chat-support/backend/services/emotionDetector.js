/**
 * Emotion Detection Service
 * Identifies user emotions (happy, sad, angry, frustrated, neutral) from text input
 * Provides empathetic responses based on detected emotions
 */

class EmotionDetector {
  constructor() {
    this.emotionKeywords = {
      happy: ["great", "excellent", "wonderful", "amazing", "love", "happy", "excited", "thrilled", "delighted", "fantastic", "awesome", "perfect"],
      sad: ["sad", "unhappy", "disappointed", "upset", "worried", "concerned", "anxious", "stressed", "depressed", "down", "terrible"],
      angry: ["angry", "furious", "outraged", "unacceptable", "disgusting", "worst", "hate", "despise", "ridiculous", "infuriating"],
      frustrated: ["frustrated", "irritated", "annoyed", "fed up", "can't", "won't", "doesn't work", "broken", "useless", "pathetic", "nonsense"],
      neutral: []
    };

    this.intensityModifiers = {
      very: 1.5,
      extremely: 1.8,
      so: 1.4,
      really: 1.3,
      absolutely: 1.6,
      incredibly: 1.7,
      super: 1.5
    };
  }

  /**
   * Detect emotion from text input
   * @param {string} text - User input text
   * @returns {Object} - emotion, confidence score, and intensity
   */
  detectEmotion(text) {
    const lowerText = text.toLowerCase();
    const emotionScores = {
      happy: 0,
      sad: 0,
      angry: 0,
      frustrated: 0,
      neutral: 0.5
    };

    // Check for intensity modifiers
    let intensityMultiplier = 1;
    for (const [modifier, multiplier] of Object.entries(this.intensityModifiers)) {
      if (lowerText.includes(modifier)) {
        intensityMultiplier = multiplier;
        break;
      }
    }

    // Score each emotion based on keyword matches
    for (const [emotion, keywords] of Object.entries(this.emotionKeywords)) {
      for (const keyword of keywords) {
        if (lowerText.includes(keyword)) {
          emotionScores[emotion] += 1 * intensityMultiplier;
        }
      }
    }

    // Normalize scores to 0-1 range
    const totalScore = Object.values(emotionScores).reduce((a, b) => a + b, 0);
    for (const emotion in emotionScores) {
      emotionScores[emotion] = totalScore > 0 ? emotionScores[emotion] / totalScore : 0;
    }

    // Determine dominant emotion
    const dominantEmotion = Object.keys(emotionScores).reduce((a, b) =>
      emotionScores[a] > emotionScores[b] ? a : b
    );

    return {
      emotion: dominantEmotion,
      scores: emotionScores,
      confidence: emotionScores[dominantEmotion],
      intensity: intensityMultiplier
    };
  }

  /**
   * Get empathetic prefix based on detected emotion
   * @param {string} emotion - Detected emotion
   * @param {number} intensity - Emotion intensity level
   * @returns {string} - Empathetic opening phrase
   */
  getEmpatheticPrefix(emotion, intensity = 1) {
    const prefixes = {
      angry: [
        "I completely understand your frustration, and I sincerely apologize.",
        "Your anger is justified, and we take this very seriously.",
        "I hear you, and I'm truly sorry you're experiencing this.",
        "I acknowledge your strong feelings, and we're here to help."
      ],
      frustrated: [
        "I know this is frustrating, and I'm here to help fix it.",
        "I can feel your frustration, and let's resolve this together.",
        "This must be incredibly annoying. Let me make this right.",
        "I understand how frustrating this is. Let's get it sorted quickly."
      ],
      sad: [
        "I understand this is difficult, and I'm here to support you.",
        "Your concerns matter to us, and we'll work through this.",
        "I can sense your worry, and you're in good hands.",
        "I'm sorry you're feeling this way. Let's find a solution together."
      ],
      happy: [
        "That's wonderful! I'm excited to help.",
        "Your enthusiasm is contagious! Let's make this great.",
        "I love your positive energy! Let's get started.",
        "That's fantastic! I'm happy to assist you."
      ],
      neutral: [
        "I'm here to help.",
        "How can I assist you?",
        "What can I do for you today?",
        "I'm ready to help you."
      ]
    };

    const emotionPrefixes = prefixes[emotion] || prefixes.neutral;
    return emotionPrefixes[Math.floor(Math.random() * emotionPrefixes.length)];
  }

  /**
   * Analyze sentiment polarity (positive/negative/neutral)
   * @param {string} text - Input text
   * @returns {string} - Sentiment polarity
   */
  analyzeSentiment(text) {
    const lowerText = text.toLowerCase();
    
    const positiveWords = ["good", "great", "excellent", "happy", "thank", "appreciate", "love", "wonderful"];
    const negativeWords = ["bad", "terrible", "hate", "angry", "sad", "disappointed", "wrong", "broken"];

    let positiveScore = 0;
    let negativeScore = 0;

    positiveWords.forEach(word => {
      if (lowerText.includes(word)) positiveScore++;
    });

    negativeWords.forEach(word => {
      if (lowerText.includes(word)) negativeScore++;
    });

    if (positiveScore > negativeScore) return "positive";
    if (negativeScore > positiveScore) return "negative";
    return "neutral";
  }
}

module.exports = EmotionDetector;
