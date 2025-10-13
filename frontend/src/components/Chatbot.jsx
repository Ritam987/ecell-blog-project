// src/components/Chatbot.jsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { FaRobot, FaCopy, FaExpand, FaCompress } from "react-icons/fa";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dark } from "react-syntax-highlighter/dist/esm/styles/prism";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// --- CONFIGURATION ---
const CHAT_PROXY_URL = "https://ecell-blog-project.onrender.com/api/chatbot";
const NEON_BLUE = "#39ff14";
const NEON_PINK = "#ff00ff";
const DARK_BG = "#0a0a0a";
const NEON_GREEN = "#00ff99";

// --- RULE-BASED RESPONSES ---
const ruleBasedQA = {
  "User Actions": [
    { question: "How to login?", answer: "Click on the Login button in the navbar and enter your credentials." },
    { question: "How to register?", answer: "Click on Register, fill in the details, and submit." },
    { question: "How to logout?", answer: "Click on your profile and select Logout." },
    { question: "How to create a blog?", answer: "Click on 'Create Blog' in the navbar and fill out the form." },
    { question: "How to edit my blog?", answer: "Go to your blog details page and click 'Edit' if you are the author." },
    { question: "How to delete my blog?", answer: "Go to your blog details page and click 'Delete' if you are the author." },
    { question: "How can I read the full blog?", answer: "Click on 'More' on the blog card to view the full content." },
    { question: "How can I like a blog?", answer: "On any blog page or blog card, click the 'Like' button to like or unlike a blog." },
    { question: "How can I comment on a blog?", answer: "Go to the blog details page, type your comment in the comment box, and click 'Submit'." },
  ],
  "Admin Actions": [
    { question: "How to access admin panel?", answer: "If your account has admin rights, click on 'Admin Panel' in the navbar to manage users and blogs." },
  ],
};

// --- CHATBOT COMPONENT ---
const Chatbot = () => {
  const [messages, setMessages] = useState([
    { type: "bot", text: "👋 Hello! I’m Scooby Doo, your assistant. Click a suggested question or ask below." },
  ]);
  const [visible, setVisible] = useState(false);
  const [compact, setCompact] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // size state for manual resize
  const [size, setSize] = useState({ width: 360, height: 520 });
  const resizingRef = useRef(false);

  const chatEndRef = useRef(null);
  const chatBoxRef = useRef(null);
  const location = useLocation();

  // always keep scroll at bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isProcessing, size]);

  // reset on route change
  useEffect(() => {
    setVisible(false);
    setMessages([
      { type: "bot", text: "👋 Hello! I’m Scooby Doo, your assistant. Click a suggested question or ask below." },
    ]);
  }, [location.pathname]);

  // helper: rule-based answer
  const getRuleBasedAnswer = useCallback((question) => {
    const categories = Object.values(ruleBasedQA).flat();
    const match = categories.find((qa) => qa.question.toLowerCase().trim() === question.toLowerCase().trim());
    return match ? match.answer : null;
  }, []);

  // copy helper
  const copyToClipboard = (text) => {
    if (!navigator?.clipboard) {
      alert("Clipboard API not available.");
      return;
    }
    navigator.clipboard.writeText(text).then(() => {
      // small unobtrusive feedback
      // avoid alert noise; console + optional toast could be added
      console.log("Copied AI response to clipboard");
    });
  };

  // handle clicking suggested question
  const handleQuestionClick = (qa) => {
    if (isProcessing) return;
    setMessages((prev) => [...prev, { type: "user", text: qa.question }, { type: "bot", text: qa.answer }]);
  };

  // typing animation: chunked to avoid too many state updates for extremely long texts
  const typeText = async (fullText) => {
    // chunk size trades off performance vs visual smoothness
    const CHUNK = 40; // increase chunk for very long texts to be faster
    let index = 0;
    // append progressively in chunks, then finish character-by-character for last chunk for smoothness
    while (index < fullText.length) {
      const nextIndex = Math.min(fullText.length, index + CHUNK);
      const snippet = fullText.slice(0, nextIndex);
      // update last message text
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = { ...copy[copy.length - 1], text: snippet };
        return copy;
      });
      index = nextIndex;
      // small pause between chunks (faster for short messages)
      // if remaining length small, make a shorter pause
      await new Promise((r) => setTimeout(r, Math.max(6, Math.floor(180 / Math.sqrt(fullText.length + 1)))));
    }
  };

  // robust fetch: handle JSON or plain text error body
  const fetchReply = async (payload) => {
    const res = await fetch(CHAT_PROXY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await res.json();
      return { ok: res.ok, body: data };
    } else {
      // fallback: text body (could be HTML error page)
      const text = await res.text();
      return { ok: res.ok, body: { reply: text } };
    }
  };

  // sendMessage: main entry
  const sendMessage = async (text) => {
    const query = (text || "").trim();
    if (!query) return;

    // push user + empty bot placeholder
    setMessages((prev) => [...prev, { type: "user", text: query }, { type: "bot", text: "" }]);
    setInputText("");
    setIsProcessing(true);

    // rule-based quick answer
    const rule = getRuleBasedAnswer(query);
    if (rule) {
      await typeText(rule);
      setIsProcessing(false);
      return;
    }

    try {
      const result = await fetchReply({ message: query });

      if (result.ok) {
        // data may contain reply, response, or choices etc. try to find preferred text
        const data = result.body;
        // prefer `reply` or `response` or `content`; fallback to JSON-stringify
        const reply =
          (data && (data.reply || data.response || data.content)) ||
          // openrouter style: choices[0].message.content
          (data && data.choices && Array.isArray(data.choices) && data.choices[0]?.message?.content) ||
          JSON.stringify(data, null, 2);
        await typeText(String(reply));
      } else {
        // non-2xx: include message body if present
        const body = result.body;
        const errText = (body && (body.error || body.message || body.reply)) || `Server returned ${result.status || "error"}`;
        await typeText(`⚠️ Server Error: ${errText}`);
      }
    } catch (err) {
      console.error("Chat fetch error:", err);
      await typeText("❌ Network Error: Unable to reach chat service.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInputSubmit = (e) => {
    if (e.key === "Enter" && inputText.trim() && !isProcessing) {
      sendMessage(inputText);
    }
  };

  // manual resize: mousedown starts, window mousemove changes size, mouseup stops
  useEffect(() => {
    const onMove = (ev) => {
      if (!resizingRef.current) return;
      const box = chatBoxRef.current?.getBoundingClientRect();
      if (!box) return;
      const newW = Math.max(280, ev.clientX - box.left);
      const newH = Math.max(380, ev.clientY - box.top);
      setSize((s) => ({ width: Math.min(newW, 900), height: Math.min(newH, 900) }));
    };
    const onUp = () => {
      if (resizingRef.current) resizingRef.current = false;
      document.body.style.cursor = "default";
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  const startResize = (ev) => {
    ev.preventDefault();
    resizingRef.current = true;
    document.body.style.cursor = "nwse-resize";
  };

  // message bubble renderer with markdown, codeblock handling, copy button and scroll inside bubble
  const renderMessage = (msg) => {
    const bubbleClasses =
      msg.type === "user"
        ? "ml-auto bg-pink-600 text-white rounded-xl rounded-br-none p-2 sm:p-3 max-w-[90%] break-words text-sm sm:text-base"
        : "mr-auto bg-neutral-800 text-white rounded-xl rounded-tl-none p-2 sm:p-3 max-w-[90%] break-words text-sm sm:text-base relative";

    return (
      <div className={bubbleClasses}>
        {msg.type === "bot" ? (
          <>
            <button
              className="absolute top-1 right-1 text-xs text-gray-300 hover:text-white"
              onClick={() => copyToClipboard(msg.text)}
              title="Copy response"
            >
              <FaCopy />
            </button>

            <div className="overflow-auto max-h-[60vh] pr-1">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                className="prose prose-invert max-w-none text-sm sm:text-base"
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    if (!inline && match) {
                      return (
                        <div className="overflow-auto max-h-[55vh] my-2 rounded border border-gray-700">
                          <SyntaxHighlighter style={dark} language={match[1]} {...props}>
                            {String(children).replace(/\n$/, "")}
                          </SyntaxHighlighter>
                        </div>
                      );
                    }
                    return (
                      <code className="bg-gray-700 text-white px-1 rounded text-xs sm:text-sm" {...props}>
                        {children}
                      </code>
                    );
                  },
                  a: ({ node, ...props }) => <a {...props} className="text-blue-300 underline" />,
                  img: ({ node, ...props }) => <img {...props} className="max-w-full rounded my-2" />,
                }}
              >
                {msg.text}
              </ReactMarkdown>
            </div>
          </>
        ) : (
          <div style={{ whiteSpace: "pre-wrap" }}>{msg.text}</div>
        )}
      </div>
    );
  };

  // ensure the floating icon remains visible even if chat was closed after large content
  // (we render robot icon when visible === false)
  return (
    <motion.div
      drag
      dragMomentum={false}
      className="fixed bottom-4 right-3 z-50"
      style={{ touchAction: "none" }}
    >
      {/* Floating Icon - always available when closed */}
      {!visible && (
        <motion.div
          className="p-3 rounded-full cursor-pointer flex items-center justify-center"
          style={{ backgroundColor: NEON_BLUE, boxShadow: `0 0 25px ${NEON_BLUE}` }}
          onClick={() => setVisible(true)}
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          whileHover={{ scale: 1.12 }}
        >
          <FaRobot size={28} color={DARK_BG} />
        </motion.div>
      )}

      <AnimatePresence>
        {visible && !compact && (
          <motion.div
            ref={chatBoxRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.22 }}
            className="rounded-lg flex flex-col overflow-hidden relative"
            style={{
              width: size.width,
              height: size.height,
              backgroundColor: DARK_BG,
              border: `2px solid ${NEON_BLUE}`,
              boxShadow: `0 0 20px ${NEON_BLUE}`,
            }}
          >
            {/* Header */}
            <div
              className="px-4 py-3 font-bold text-lg flex justify-between items-center"
              style={{ backgroundColor: NEON_BLUE, color: DARK_BG }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <FaRobot color={DARK_BG} />
                <span>Scooby Doo Assistant</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCompact((c) => !c)}
                  title="Toggle compact mode"
                  className="p-1 rounded hover:bg-gray-200/20"
                >
                  {compact ? <FaExpand /> : <FaCompress />}
                </button>

                {/* minimize close but not remove icon */}
                <button
                  onClick={() => {
                    setVisible(false);
                    // keep compact false so reopening gives full view
                    setCompact(false);
                  }}
                  className="p-1 rounded font-bold"
                  title="Close"
                >
                  &times;
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              className="flex-1 p-3 overflow-y-auto custom-scrollbar space-y-3"
              style={{ minHeight: 0 }} // keeps flexbox scroll stable
            >
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: msg.type === "user" ? 30 : -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  {renderMessage(msg)}
                </motion.div>
              ))}

              {isProcessing && (
                <div className="text-xs text-gray-300 italic px-2">Scooby is typing...</div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-gray-700 flex gap-2 items-center">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleInputSubmit}
                placeholder={isProcessing ? "Please wait..." : "Ask Scooby..."}
                disabled={isProcessing}
                className="flex-1 px-3 py-2 rounded-full outline-none text-white"
                style={{ backgroundColor: "rgba(50,50,50,0.6)", border: `1px solid ${NEON_BLUE}` }}
              />
              <motion.button
                onClick={() => sendMessage(inputText)}
                disabled={!inputText.trim() || isProcessing}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`px-4 py-2 rounded-full font-semibold ${
                  !inputText.trim() || isProcessing ? "opacity-50 cursor-not-allowed" : "bg-neonBlue text-black"
                }`}
                style={{ boxShadow: `0 0 10px ${NEON_BLUE}` }}
                title="Send"
              >
                Send
              </motion.button>
            </div>

            {/* Quick Rule Buttons */}
            <div className="p-3 border-t border-gray-700 overflow-auto max-h-36">
              {Object.entries(ruleBasedQA).map(([category, qas], idx) => (
                <div key={idx} className="mb-2">
                  <div className="font-semibold text-white mb-1">{category}</div>
                  <div className="flex flex-wrap gap-2">
                    {qas.map((qa, i) => (
                      <motion.button
                        key={i}
                        onClick={() => handleQuestionClick(qa)}
                        whileHover={{ scale: 1.03 }}
                        className="bg-gray-800 text-white px-3 py-1 rounded shadow-sm text-sm"
                        style={{ border: `1px solid ${NEON_PINK}` }}
                      >
                        {qa.question}
                      </motion.button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* resize handle bottom-right */}
            <div
              onMouseDown={startResize}
              role="button"
              aria-label="Resize chat"
              title="Drag to resize"
              style={{
                position: "absolute",
                right: 4,
                bottom: 4,
                width: 18,
                height: 18,
                cursor: "nwse-resize",
                zIndex: 30,
                // subtle neon corner for affordance:
                background: `linear-gradient(135deg, transparent 50%, ${NEON_BLUE} 50%)`,
                transform: "translate(2px, 2px)",
                borderRadius: 2,
              }}
            />

            <style>{`
              .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
              .custom-scrollbar::-webkit-scrollbar-track { background: ${DARK_BG}; }
              .custom-scrollbar::-webkit-scrollbar-thumb { background: ${NEON_BLUE}; border-radius: 6px; }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: ${NEON_GREEN}; }
            `}</style>
          </motion.div>
        )}

        {/* compact mode: small bar (keeps icon visible / quick open) */}
        {visible && compact && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="w-56 bg-neutral-900 rounded-lg p-2 flex items-center gap-2"
            style={{ border: `2px solid ${NEON_BLUE}`, boxShadow: `0 0 12px ${NEON_BLUE}` }}
          >
            <FaRobot color={NEON_BLUE} />
            <div className="flex-1 text-sm text-white">Scooby Doo Assistant</div>
            <div className="flex gap-1">
              <button onClick={() => setCompact(false)} className="px-2 py-1 rounded bg-gray-800 text-white">Expand</button>
              <button onClick={() => setVisible(false)} className="px-2 py-1 rounded bg-gray-800 text-white">Close</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Chatbot;
