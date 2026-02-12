import React, { useState, useRef, useEffect } from "react";
import "../ChatWidget.css";

/**
 * ChatWidget Component with Emotion Recognition & Empathetic Responses
 * Features:
 * - Real-time emotion detection from user input
 * - Context-aware empathetic responses
 * - Voice input support with speech recognition
 * - Text-to-speech with emotion-adapted parameters
 * - Suggested actions based on user emotion and intent
 */
function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [detectedEmotion, setDetectedEmotion] = useState("neutral");
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
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
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInput(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };
    }
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /**
   * Send message with emotion detection
   */
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setMessages(prev => [...prev, { sender: "user", text: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage })
      });

      const data = await response.json();
      console.log('Response data:', data);

      // Update detected emotion
      setDetectedEmotion(data.emotion);

      // Add bot response with emotion metadata
      setMessages(prev => [...prev, {
        sender: "bot",
        text: data.response,
        emotion: data.emotion,
        confidence: data.confidence,
        intensity: data.intensity,
        actions: data.suggestedActions
      }]);

      // Synthesize speech response
      if (window.speechSynthesis) {
        synthesizeSpeech(data.response, data.emotion);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages(prev => [...prev, {
        sender: "bot",
        text: "Sorry, I encountered an error. Please try again.",
        emotion: "neutral"
      }]);
    } finally {
      setIsLoading(false);
      setInput("");
    }
  };

  /**
   * Synthesize speech with emotion-adapted parameters
   */
  const synthesizeSpeech = (text, emotion) => {
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

    window.speechSynthesis.speak(utterance);
  };

  /**
   * Start voice input
   */
  const startVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  /**
   * Stop voice input
   */
  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  /**
   * Render emotion indicator
   */
  const renderEmotionIndicator = (emotion, confidence) => {
    if (!emotion) return null;
    return (
      <div className={`emotion-indicator emotion-${emotion}`}>
        {emotionEmojis[emotion]} {emotion}
        {confidence && ` (${(confidence * 100).toFixed(0)}%)`}
      </div>
    );
  };

  /**
   * Render suggested action buttons
   */
  const renderActions = (actions) => {
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
    <div className="chat-wrapper">
      {/* Chat Button */}
      <button
        className="chat-btn"
        onClick={() => setOpen(!open)}
        style={{ backgroundColor: emotionColors[detectedEmotion] }}
        title="Chat with Banking Assistant"
      >
        💬 Assistant {emotionEmojis[detectedEmotion]}
      </button>

      {/* Chat Window */}
      {open && (
        <div className="chat-window">
          {/* Header */}
          <div className="chat-header" style={{ backgroundColor: emotionColors[detectedEmotion] }}>
            <span>Banking Assistant {emotionEmojis[detectedEmotion]}</span>
            <button
              className="close-btn"
              onClick={() => setOpen(false)}
              style={{ background: "none", border: "none", color: "white", cursor: "pointer", fontSize: "1.2rem" }}
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div className="chat-body">
            {messages.length === 0 && (
              <div style={{ textAlign: "center", color: "#999", padding: "20px" }}>
                <p>👋 Welcome to Banking Assistant</p>
                <p style={{ fontSize: "0.9rem" }}>Ask me anything about banking services</p>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div key={idx}>
                {msg.sender === "user" ? (
                  <div className="user-msg">{msg.text}</div>
                ) : (
                  <div>
                    <div className="bot-msg">
                      {msg.text}
                      {msg.emotion && renderEmotionIndicator(msg.emotion, msg.confidence)}
                    </div>
                    {msg.actions && renderActions(msg.actions)}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="bot-msg" style={{ fontStyle: "italic", color: "#666" }}>
                Thinking... 💭
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="chat-footer">
            <form onSubmit={sendMessage} style={{ display: "flex", width: "100%", gap: "5px" }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? "Listening... 🎤" : "Type your message..."}
                style={{ flex: 1, border: "none", padding: "10px" }}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading}
                style={{ 
                  background: "#0562bf", 
                  color: "white", 
                  border: "none", 
                  padding: "10px 15px", 
                  cursor: isLoading ? "default" : "pointer",
                  opacity: isLoading ? 0.6 : 1
                }}
              >
                Send
              </button>
              <button
                type="button"
                className={`voice-btn ${isListening ? "listening" : ""}`}
                onClick={isListening ? stopVoiceInput : startVoiceInput}
                disabled={isLoading}
                style={{
                  background: isListening ? "#FF5722" : "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  width: "40px",
                  height: "40px",
                  cursor: isLoading ? "default" : "pointer",
                  fontSize: "1.2rem",
                  opacity: isLoading ? 0.6 : 1
                }}
              >
                🎤
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatWidget;