import { useState } from "react";
import "./ChatWidget.css";

function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    setMessages([...messages, { sender: "user", text: input }]);

    const res = await fetch("http://localhost:5000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input })
    });

    const data = await res.json();
    setMessages(prev => [...prev, { sender: "bot", text: data.reply }]);
    setInput("");
  };

  return (
    <>
      <div className="chat-icon" onClick={() => setOpen(!open)}>💬</div>

      {open && (
        <div className="chat-window">
          <div className="chat-header">BAYLI (Banking As You Like It)</div>
          <div className="chat-body">
            {messages.map((m, i) => (
              <div key={i} className={m.sender}>{m.text}</div>
            ))}
          </div>
          <div className="chat-footer">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type your question..."
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatWidget;