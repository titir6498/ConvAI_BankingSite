const express = require("express");
const router = express.Router();
const ResponseEngine = require("../services/responseEngine");
const VoiceEmotionDetector = require("../services/voiceEmotionDetector");
const ragService = require("../services/ragService");
const intents = require("../chatbot/intents.json");

// Initialize response engine with emotion awareness
const responseEngine = new ResponseEngine(intents.intents);
const voiceEmotionDetector = new VoiceEmotionDetector();

/**
 * POST /api/chat
 * Handle text-based chat messages with emotion detection, RAG, and LLM
 * Detects user emotion, retrieves relevant context, generates responses via LLM
 */
router.post("/", async (req, res) => {
  try {
    const { message, userId = "anonymous", context = [] } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({ error: "Message cannot be empty" });
    }

    //console.log('Context received by bank: ', contextString);

    // Build context string from last 2 interactions
    const contextString = context && context.length > 0
      ? `Recent conversation: ${context.join(" | ")}\n`
      : "";

    // Step 1: Detect emotion from user message
    const emotionResult = responseEngine.detectEmotion(message);
    const emotion = emotionResult.emotion || "neutral";
    const emotionConfidence = emotionResult.confidence || 0.5;
    const intensity = emotionResult.intensity || 1.0;

    // Step 2: Retrieve relevant context using RAG (Retrieval-Augmented Generation)
    const retrievedDocs = ragService.retrieveContext(message, 3);

    // Step 3: Generate response using LLM with RAG context and conversation history
    const generatedResponse = await ragService.generateResponse(
      message,
      retrievedDocs,
      emotion,
      contextString
    );

    // Step 4: Prepare final response
    res.json({
      response: generatedResponse.text,
      emotion: emotion,
      confidence: emotionConfidence,
      intensity: intensity,
      requiresEscalation: generatedResponse.requiresEscalation,
      suggestedActions: generatedResponse.suggestedActions,
      source: generatedResponse.source,
      retrievalScore: generatedResponse.confidence,
      matchedIntent: generatedResponse.matchedIntent,
      usedLLM: generatedResponse.usedLLM,
      userId: userId
    });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({
      error: "Internal server error",
      response: "I apologize for the technical difficulty. Please try again.",
      emotion: "neutral"
    });
  }
});

/**
 * POST /api/chat/voice
 * Handle voice-based chat with emotion detection from speech and RAG+LLM retrieval
 * Processes transcribed text and voice characteristics with context-aware responses
 */
router.post("/voice", async (req, res) => {
  try {
    const { audioFrequencyData, transcribedText, userId = "anonymous" } = req.body;

    if (!transcribedText || transcribedText.trim() === "") {
      return res.status(400).json({ error: "Transcribed text cannot be empty" });
    }

    // Step 1: Detect emotion from transcribed text and audio
    const emotionResult = responseEngine.detectEmotion(transcribedText);
    const emotion = emotionResult.emotion || "neutral";
    const emotionConfidence = emotionResult.confidence || 0.5;

    // Step 2: Retrieve relevant context using RAG
    const retrievedDocs = ragService.retrieveContext(transcribedText, 3);

    // Step 3: Generate response using LLM with RAG context
    const generatedResponse = await ragService.generateResponse(
      transcribedText,
      retrievedDocs,
      emotion
    );

    // Step 4: Generate audio response parameters based on emotion
    const audioResponse = voiceEmotionDetector.generateAudioResponse(
      generatedResponse.text,
      emotion
    );

    res.json({
      response: generatedResponse.text,
      emotion: emotion,
      confidence: emotionConfidence,
      audioResponse: {
        text: audioResponse.text,
        pitch: audioResponse.speechSynthesisParams.pitch,
        rate: audioResponse.speechSynthesisParams.rate,
        volume: audioResponse.speechSynthesisParams.volume
      },
      suggestedActions: generatedResponse.suggestedActions,
      source: generatedResponse.source,
      usedLLM: generatedResponse.usedLLM,
      userId: userId
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