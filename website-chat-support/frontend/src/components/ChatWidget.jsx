import React, { useState } from "react";

function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    setMessages([...messages, userMsg]);

    const response = await fetch("http://localhost:5000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input })
    });

    const data = await response.json();
    setMessages(prev => [...prev, { sender: "bot", text: data.reply }]);
    setInput("");
  };

  return (
    <div className="chat-container">
      <button className="chat-toggle" onClick={() => setOpen(!open)}>
        Help
      </button>

      {open && (
        <div className="chat-box">
          <div className="chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={m.sender}>
                {m.text}
              </div>
            ))}
          </div>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type your question..."
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      )}
    </div>
  );
}

export default ChatWidget;