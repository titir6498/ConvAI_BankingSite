import React, { useState, useRef, useEffect } from "react";
import "../ChatWidget.css";

/**
 * ChatWidget Component with Emotion Recognition
 * Features:
 * - Text-based chat with emotion detection
 * - Voice input with speech recognition
 * - Empathetic AI responses
 * - Emotion indicators and suggested actions
 */
const ChatWidgetNew = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [detectedEmotion, setDetectedEmotion] = useState("neutral");
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const recognitionRef = useRef(null);

  const emotionColors = {
    happy: "#4CAF50",
    sad: "#2196F3",
    angry: "#F44336",
    frustrated: "#FF9800",
    neutral: "#9E9E9E"
  };

  const emotionEmojis = {
    happy: "😊",
    sad: "😢",
    angry: "😠",
    frustrated: "😤",
    neutral: "😐"
  };

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInput(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
      };
    }
  }, []);

  // Scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /**
   * Send text message with emotion detection
   */
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { type: "user", text: input }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input })
      });

      const data = await response.json();

      // Update detected emotion
      setDetectedEmotion(data.emotion);

      // Add bot response with emotion metadata
      setMessages(prev => [...prev, {
        type: "bot",
        text: data.response,
        emotion: data.emotion,
        confidence: data.confidence,
        intensity: data.intensity,
        actions: data.suggestedActions
      }]);

      // Speak response if available
      if ('speechSynthesis' in window) {
        synthesizeAndPlaySpeech(data.response, data.emotion);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages(prev => [...prev, {
        type: "bot",
        text: "Sorry, I encountered an error. Please try again.",
        emotion: "neutral"
      }]);
    } finally {
      setIsLoading(false);
      setInput("");
    }
  };

  /**
   * Start voice input with speech recognition
   */
  const startVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  /**
   * Stop voice input and process
   */
  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      // Auto-send the transcribed text
      if (input.trim()) {
        setTimeout(() => {
          const form = document.querySelector(".input-form");
          if (form) {
            form.dispatchEvent(new Event("submit", { bubbles: true }));
          }
        }, 500);
      }
    }
  };

  /**
   * Text-to-speech with emotion-aware parameters
   */
  const synthesizeAndPlaySpeech = (text, emotion) => {
    const utterance = new SpeechSynthesisUtterance(text);

    const emotionParams = {
      happy: { pitch: 1.5, rate: 1.2 },
      sad: { pitch: 0.8, rate: 0.8 },
      angry: { pitch: 1.3, rate: 1.3 },
      frustrated: { pitch: 1.1, rate: 1.1 },
      neutral: { pitch: 1.0, rate: 1.0 }
    };

    const params = emotionParams[emotion] || emotionParams.neutral;
    utterance.pitch = params.pitch;
    utterance.rate = params.rate;
    utterance.volume = 1;

    window.speechSynthesis.speak(utterance);
  };

  /**
   * Render emotion indicator with confidence
   */
  const renderEmotionIndicator = (emotion, confidence, intensity) => {
    return (
      <div className={`emotion-indicator emotion-${emotion}`}>
        {emotionEmojis[emotion]} {emotion}
        {confidence && ` (${(confidence * 100).toFixed(0)}%)`}
        {intensity > 1 && ` [Intensity: ${intensity.toFixed(1)}x]`}
      </div>
    );
  };

  /**
   * Render suggested action buttons
   */
  const renderSuggestedActions = (actions) => {
    if (!actions || actions.length === 0) return null;
    
    return (
      <div className="suggested-actions">
        {actions.map((action, i) => (
          <button 
            key={i} 
            className="action-btn"
            onClick={() => setInput(action)}
          >
            {action}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="chat-widget">
      {/* Header */}
      <div
        className="chat-header"
        onClick={() => setIsOpen(!isOpen)}
        style={{ backgroundColor: emotionColors[detectedEmotion], cursor: "pointer" }}
      >
        <span>
          Banking Assistant {emotionEmojis[detectedEmotion]}
        </span>
        <button 
          className="close-btn"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
        >
          {isOpen ? "−" : "+"}
        </button>
      </div>

      {/* Messages Container */}
      {isOpen && (
        <div className="chat-container">
          <div className="chat-body">
            {messages.length === 0 && (
              <div className="welcome-message">
                <p>👋 Welcome to Banking Assistant</p>
                <p style={{fontSize: "0.9rem"}}>I'm here to help with empathy and understanding. How can I assist you today?</p>
              </div>
            )}
            
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.type}`}>
                <div className="message-content">
                  <p className={msg.type === "user" ? "user-msg" : "bot-msg"}>
                    {msg.text}
                  </p>
                  
                  {msg.emotion && msg.type === "bot" && (
                    renderEmotionIndicator(msg.emotion, msg.confidence, msg.intensity)
                  )}
                  
                  {msg.actions && msg.type === "bot" && (
                    renderSuggestedActions(msg.actions)
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="message bot">
                <div className="message-content">
                  <div style={{fontSize: "0.9rem", color: "#999"}}>
                    Thinking... 💭
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={sendMessage} className="input-form">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? "Listening... 🎤" : "Type or speak your message..."}
              disabled={isLoading}
            />
            <button 
              type="submit"
              disabled={isLoading}
              title="Send message"
            >
              Send
            </button>
            <button
              type="button"
              className={`voice-btn ${isListening ? "listening" : ""}`}
              onClick={isListening ? stopVoiceInput : startVoiceInput}
              disabled={isLoading}
              title={isListening ? "Stop listening" : "Start voice input"}
            >
              🎤
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatWidgetNew;
