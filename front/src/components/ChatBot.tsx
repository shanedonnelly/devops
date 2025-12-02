import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { chatbotApi } from "../services/chatbot";
import "./ChatBot.css";

interface Message {
  from: "user" | "bot";
  text: string;
}

export default function ChatBot() {
  const location = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const [siteId, setSiteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const pathParts = location.pathname.split('/');
    const lastPart = pathParts[pathParts.length - 1];
    if (pathParts.length >= 3 && pathParts[1] === 'devops' && pathParts[2] === 'shanify' && lastPart) {
      setSiteId(lastPart);
    }
  }, [location]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (query: string) => {
    if (!query.trim()) return;

    const userMessage: Message = { from: "user", text: query };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const data = await chatbotApi.sendMessage({
        query,
        state: null,
        site_id: siteId,
      });

      const botMessage: Message = {
        from: "bot",
        text: data.response,
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        from: "bot",
        text: "❌ Désolé, une erreur s'est produite. Veuillez réessayer.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => {
    if (!input.trim() || loading) return;
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !loading) {
      handleSend();
    }
  };

  return (
    <>
      {!open && (
        <button className="chat-bubble" onClick={() => setOpen(true)}>
          💬
        </button>
      )}

      {open && (
        <div className="chat-window">
          <div className="chat-header">
            <h3>Assistant</h3>
            <button className="close-btn" onClick={() => setOpen(false)}>
              ✖
            </button>
          </div>

          <div className="chat-box">
            {messages.length === 0 && (
              <div className="message bot">
                👋 Bonjour ! Comment puis-je vous aider aujourd'hui ?
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`message ${msg.from === "user" ? "user" : "bot"}`}
              >
                {msg.text}
              </div>
            ))}
            {loading && (
              <div className="message bot">
                <span className="typing-indicator">...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="input-area">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Écrivez votre message..."
              disabled={loading}
            />
            <button onClick={handleSend} disabled={loading}>
              {loading ? "..." : "Envoyer"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}