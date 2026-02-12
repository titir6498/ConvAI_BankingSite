/**
 * Voice Emotion Detection Service
 * Analyzes voice characteristics (pitch, energy, speed) to detect emotions
 * Generates empathetic audio responses with adaptive speech parameters
 */

class VoiceEmotionDetector {
  constructor() {
    this.voiceCharacteristics = {
      pitch: { happy: "high", sad: "low", angry: "high", frustrated: "high", neutral: "medium" },
      speed: { happy: "fast", sad: "slow", angry: "fast", frustrated: "variable", neutral: "normal" },
      volume: { happy: "high", sad: "low", angry: "very_high", frustrated: "high", neutral: "normal" },
      articulation: { happy: "clear", sad: "mumbled", angry: "sharp", frustrated: "tense", neutral: "clear" }
    };
  }

  /**
   * Analyze voice characteristics from audio frequency data
   * Uses Web Audio API frequency analysis for emotion detection
   * @param {AnalyserNode} analyser - Web Audio API analyser node
   * @returns {Object} - Voice characteristics metrics
   */
  analyzeVoiceCharacteristics(analyser) {
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);

    const averageFrequency = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
    const energyLevel = this.calculateEnergy(dataArray);
    const frequencyVariance = this.calculateVariance(dataArray);

    return {
      estimatedPitch: this.estimatePitch(averageFrequency),
      energyLevel, // Correlates with volume and emotion intensity
      frequencyVariance, // Higher for emotional speech
      timestamp: Date.now()
    };
  }

  /**
   * Estimate pitch level from frequency data
   * @param {number} averageFrequency - Average frequency from FFT
   * @returns {string} - Pitch level (low/medium/high)
   */
  estimatePitch(averageFrequency) {
    if (averageFrequency < 85) return "low";
    if (averageFrequency < 170) return "medium";
    return "high";
  }

  /**
   * Calculate energy level from frequency data
   * @param {Uint8Array} dataArray - Frequency data
   * @returns {number} - Energy level (0-100)
   */
  calculateEnergy(dataArray) {
    const sum = dataArray.reduce((a, b) => a + Math.pow(b, 2), 0);
    const energy = Math.sqrt(sum / dataArray.length);
    return Math.min(100, (energy / 128) * 100);
  }

  /**
   * Calculate variance in frequency data (emotional fluctuation)
   * @param {Uint8Array} dataArray - Frequency data
   * @returns {number} - Variance (0-100)
   */
  calculateVariance(dataArray) {
    const mean = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
    const variance = dataArray.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / dataArray.length;
    return Math.min(100, Math.sqrt(variance) / 20);
  }

  /**
   * Detect emotion from voice characteristics and transcribed text
   * @param {Object} voiceMetrics - Voice analysis metrics
   * @param {string} transcribedText - Speech-to-text output
   * @returns {Object} - Detected emotion and confidence
   */
  detectVoiceEmotion(voiceMetrics, transcribedText = "") {
    const scores = {
      happy: 0,
      sad: 0,
      angry: 0,
      frustrated: 0,
      neutral: 0.1
    };

    // Analyze pitch characteristics
    if (voiceMetrics.estimatedPitch === "high") {
      scores.happy += 0.2;
      scores.angry += 0.15;
    } else if (voiceMetrics.estimatedPitch === "low") {
      scores.sad += 0.2;
    }

    // Analyze energy (volume level)
    if (voiceMetrics.energyLevel > 70) {
      scores.angry += 0.25;
      scores.happy += 0.15;
    } else if (voiceMetrics.energyLevel < 30) {
      scores.sad += 0.25;
    } else if (voiceMetrics.energyLevel > 40 && voiceMetrics.energyLevel < 60) {
      scores.neutral += 0.2;
    }

    // Analyze frequency variance (emotional intensity)
    if (voiceMetrics.frequencyVariance > 60) {
      scores.frustrated += 0.2;
      scores.angry += 0.15;
    } else if (voiceMetrics.frequencyVariance < 20) {
      scores.sad += 0.15;
    }

    // Normalize scores
    const total = Object.values(scores).reduce((a, b) => a + b, 0);
    for (const emotion in scores) {
      scores[emotion] = total > 0 ? scores[emotion] / total : 0;
    }

    const dominantEmotion = Object.keys(scores).reduce((a, b) =>
      scores[a] > scores[b] ? a : b
    );

    return {
      emotion: dominantEmotion,
      voiceScores: scores,
      confidence: scores[dominantEmotion],
      voiceMetrics
    };
  }

  /**
   * Generate speech synthesis parameters based on emotion
   * @param {string} text - Response text
   * @param {string} emotion - Detected emotion
   * @returns {Object} - TTS parameters for speech synthesis
   */
  generateAudioResponse(text, emotion) {
    const audioParams = {
      happy: { rate: 1.2, pitch: 1.5, volume: 1.0 },
      sad: { rate: 0.8, pitch: 0.8, volume: 0.8 },
      angry: { rate: 1.3, pitch: 1.3, volume: 1.1 },
      frustrated: { rate: 1.1, pitch: 1.1, volume: 0.9 },
      neutral: { rate: 1.0, pitch: 1.0, volume: 1.0 }
    };

    const params = audioParams[emotion] || audioParams.neutral;

    return {
      text,
      speechSynthesisParams: {
        pitch: params.pitch,
        rate: params.rate,
        volume: params.volume
      },
      emotion,
      timestamp: Date.now()
    };
  }

  /**
   * Combine voice and text emotion detection for holistic analysis
   * @param {Object} voiceMetrics - Voice analysis data
   * @param {string} transcribedText - Transcribed speech
   * @param {Object} textEmotion - Emotion detected from text
   * @returns {Object} - Combined emotion analysis
   */
  combinedEmotionAnalysis(voiceMetrics, transcribedText, textEmotion) {
    const voiceEmotion = this.detectVoiceEmotion(voiceMetrics, transcribedText);

    // Weight voice and text emotion detection
    const textWeight = 0.6;
    const voiceWeight = 0.4;

    const combinedScores = {};
    const emotions = ["happy", "sad", "angry", "frustrated", "neutral"];

    emotions.forEach(emotion => {
      combinedScores[emotion] =
        (textEmotion.scores[emotion] || 0) * textWeight +
        (voiceEmotion.voiceScores[emotion] || 0) * voiceWeight;
    });

    const dominantEmotion = Object.keys(combinedScores).reduce((a, b) =>
      combinedScores[a] > combinedScores[b] ? a : b
    );

    return {
      emotion: dominantEmotion,
      textEmotion: textEmotion.emotion,
      voiceEmotion: voiceEmotion.emotion,
      combinedScores,
      confidence: combinedScores[dominantEmotion],
      analysis: {
        textBased: textEmotion,
        voiceBased: voiceEmotion
      }
    };
  }
}

module.exports = VoiceEmotionDetector;
