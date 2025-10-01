import React, { useState, useRef, useEffect } from "react";

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hello! I am your assistant. Ask me anything about the site." },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setMessages((prev) => [...prev, { from: "user", text: userMsg }]);
    setInput("");

    try {
      const res = await fetch(
        `https://ecell-blog-project.onrender.com/api/chatbot/public?query=${encodeURIComponent(userMsg)}`
      );
      const data = await res.json();
      setMessages((prev) => [...prev, { from: "bot", text: data.answer }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "⚠️ Server/network error: " + err.message },
      ]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div style={{
      position: "fixed",
      bottom: "20px",
      right: "20px",
      width: "350px",
      height: "450px",
      backgroundColor: "#fff",
      border: "1px solid #ccc",
      borderRadius: "10px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      fontFamily: "Arial, sans-serif"
    }}>
      {/* Chat header */}
      <div style={{
        padding: "10px",
        backgroundColor: "#0077ff",
        color: "#fff",
        fontWeight: "bold",
        textAlign: "center"
      }}>
        Chatbot
      </div>

      {/* Chat messages */}
      <div style={{
        flex: 1,
        padding: "10px",
        overflowY: "auto",
        scrollbarWidth: "thin",
      }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{
            margin: "5px 0",
            textAlign: msg.from === "user" ? "right" : "left"
          }}>
            <span style={{
              display: "inline-block",
              padding: "8px 12px",
              borderRadius: "15px",
              backgroundColor: msg.from === "user" ? "#0077ff" : "#f1f0f0",
              color: msg.from === "user" ? "#fff" : "#000",
              maxWidth: "80%",
              wordWrap: "break-word"
            }}>
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
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          style={{
            flex: 1,
            padding: "10px",
            border: "none",
            outline: "none",
            fontSize: "14px"
          }}
        />
        <button
          onClick={sendMessage}
          style={{
            padding: "10px",
            backgroundColor: "#0077ff",
            color: "#fff",
            border: "none",
            cursor: "pointer"
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
