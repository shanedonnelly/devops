import React, { useState, useEffect, useRef } from "react";
import "./ChatBot.css";

export default function ChatBot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = { from: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Simuler une réponse automatique
    setTimeout(() => {
      const botMessage = {
        from: "bot",
        text: `🤖 Salut ! Tu as dit : "${input}". Comment puis-je t’aider ?`,
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 800);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <>
      {/* 🟡 Bulle flottante */}
      {!open && (
        <button className="chat-bubble" onClick={() => setOpen(true)}>
          💬
        </button>
      )}

      {/* 💬 Fenêtre du chatbot */}
      {open && (
        <div className="chat-window">
          <div className="chat-header">
            <h3>Mon Chatbot</h3>
            <button className="close-btn" onClick={() => setOpen(false)}>
              ✖
            </button>
          </div>

          <div className="chat-box">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`message ${msg.from === "user" ? "user" : "bot"}`}
              >
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="input-area">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Écris ton message..."
            />
            <button onClick={handleSend}>Envoyer</button>
          </div>
        </div>
      )}
    </>
  );
}
