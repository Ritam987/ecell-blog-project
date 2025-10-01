import React, { useState, useRef, useEffect } from "react";

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! I am your assistant. Ask me anything about the site." }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const [loading, setLoading] = useState(false);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(
        `https://ecell-blog-project.onrender.com/api/chatbot/public?query=${encodeURIComponent(input)}`
      );
      const data = await response.json();

      const botMessage = { sender: "bot", text: data.answer || "Sorry, I could not generate a response." };
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      const errorMessage = { sender: "bot", text: `⚠️ Server/network error: ${err.message}` };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = e => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        width: "320px",
        height: "400px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        backgroundColor: "#fff",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        fontFamily: "Arial, sans-serif",
        zIndex: 1000
      }}
    >
      {/* Chat header */}
      <div
        style={{
          padding: "10px",
          backgroundColor: "#0077ff",
          color: "#fff",
          fontWeight: "bold",
          borderTopLeftRadius: "8px",
          borderTopRightRadius: "8px"
        }}
      >
        Chatbot
      </div>

      {/* Chat messages */}
      <div
        style={{
          flex: 1,
          padding: "10px",
          overflowY: "auto",
          scrollbarWidth: "thin",
          scrollbarColor: "#0077ff #e0e0e0"
        }}
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              marginBottom: "8px",
              textAlign: msg.sender === "user" ? "right" : "left"
            }}
          >
            <span
              style={{
                display: "inline-block",
                padding: "6px 12px",
                borderRadius: "16px",
                backgroundColor: msg.sender === "user" ? "#0077ff" : "#f0f0f0",
                color: msg.sender === "user" ? "#fff" : "#000",
                maxWidth: "80%",
                wordWrap: "break-word",
                fontSize: "14px"
              }}
            >
              {msg.text}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input box */}
      <div style={{ display: "flex", borderTop: "1px solid #ccc" }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: "10px",
            border: "none",
            borderRadius: "0 0 0 8px",
            outline: "none"
          }}
        />
        <button
          onClick={handleSend}
          disabled={loading}
          style={{
            padding: "0 15px",
            backgroundColor: "#0077ff",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            borderRadius: "0 0 8px 0"
          }}
        >
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
