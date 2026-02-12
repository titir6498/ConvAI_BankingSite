const express = require("express");
const router = express.Router();
const ResponseEngine = require("../services/responseEngine");
const VoiceEmotionDetector = require("../services/voiceEmotionDetector");
const intents = require("../chatbot/intents.json");

// Initialize response engine with emotion awareness
const responseEngine = new ResponseEngine(intents.intents);
const voiceEmotionDetector = new VoiceEmotionDetector();

/**
 * POST /api/chat
 * Handle text-based chat messages with emotion detection
 * Detects user emotion and generates empathetic, context-aware responses
 */
router.post("/", (req, res) => {
  try {
    const { message, userId = "anonymous" } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({ error: "Message cannot be empty" });
    }

    // Generate emotionally aware response
    const result = responseEngine.generateResponse(message, { userId });

    res.json({
      response: result.text,
      emotion: result.metadata.emotion,
      confidence: result.metadata.confidence,
      intensity: result.metadata.intensity,
      requiresEscalation: result.metadata.requiresEscalation,
      suggestedActions: result.metadata.suggestedActions,
      conversationContext: result.conversationContext
    });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/chat/voice
 * Handle voice-based chat with emotion detection from speech
 * Processes transcribed text and voice characteristics
 */
router.post("/voice", (req, res) => {
  try {
    const { audioFrequencyData, transcribedText, userId = "anonymous" } = req.body;

    if (!transcribedText || transcribedText.trim() === "") {
      return res.status(400).json({ error: "Transcribed text cannot be empty" });
    }

    // Generate emotionally aware response
    const result = responseEngine.generateResponse(transcribedText, { userId });

    // Generate audio response parameters based on emotion
    const audioResponse = voiceEmotionDetector.generateAudioResponse(
      result.text,
      result.metadata.emotion
    );

    res.json({
      response: result.text,
      emotion: result.metadata.emotion,
      confidence: result.metadata.confidence,
      audioResponse: {
        text: audioResponse.text,
        pitch: audioResponse.speechSynthesisParams.pitch,
        rate: audioResponse.speechSynthesisParams.rate,
        volume: audioResponse.speechSynthesisParams.volume
      },
      suggestedActions: result.metadata.suggestedActions
    });
  } catch (error) {
    console.error("Voice chat error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/chat/history
 * Retrieve conversation history with emotion analysis
 * Returns conversation turns and emotion statistics
 */
router.get("/history", (req, res) => {
  try {
    const history = responseEngine.getHistory();
    res.json({
      history,
      summary: {
        totalTurns: history.length,
        emotionDistribution: calculateEmotionDistribution(history),
        dominantEmotion: getDominantEmotion(history)
      }
    });
  } catch (error) {
    console.error("History retrieval error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/chat/clear
 * Clear conversation history
 */
router.post("/clear", (req, res) => {
  try {
    responseEngine.clearHistory();
    res.json({ message: "Conversation history cleared" });
  } catch (error) {
    console.error("Clear history error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Helper: Calculate emotion distribution in conversation
 */
function calculateEmotionDistribution(history) {
  const distribution = {};
  history.forEach(turn => {
    const emotion = turn.emotion.emotion;
    distribution[emotion] = (distribution[emotion] || 0) + 1;
  });
  return distribution;
}

/**
 * Helper: Get dominant emotion in conversation
 */
function getDominantEmotion(history) {
  const distribution = calculateEmotionDistribution(history);
  return Object.keys(distribution).reduce((a, b) =>
    distribution[a] > distribution[b] ? a : b, "neutral"
  );
}

module.exports = router;