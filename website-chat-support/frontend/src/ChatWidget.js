// ChatWidget.js
import React, { useState } from "react";
import "./ChatWidget.css";

function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Welcome! How can we help you today?" }
  ]);

  const toggleChat = () => setIsOpen(!isOpen);

  const sendMessage = async (text) => {
    if (!text) return;
    setMessages([...messages, { sender: "user", text }]);

    const res = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text })
      });
  
    const data = await res.json();

    setMessages((prev) => [
      ...prev,
      //{ sender: "user", text },
      { sender: "bot", text: data.reply }
    ]);
  };

  return (
    <>
      <button className="chat-btn" onClick={toggleChat}>
        💬 Chat
      </button>

      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            Customer Service
            <span className="close-btn" onClick={toggleChat}>✖</span>
          </div>
          <div className="chat-body">
            {messages.map((msg, i) => (
              <p key={i} className={msg.sender === "user" ? "user-msg" : "bot-msg"}>
                {msg.sender === "user" ? "You: " : "Bot: "}
                {msg.text}
              </p>
            ))}
          </div>
          <div className="chat-footer">
            <input
              type="text"
              placeholder="Type a message..."
              onKeyDown={(e) => {
                if (e.key === "Enter") { 
                    sendMessage(e.target.value);
                    e.target.value = ""; 
                }
              }}
            />
            <button
              onClick={() => {
                const input = document.querySelector(".chat-footer input");
                sendMessage(input.value);
                input.value = "";
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatWidget;