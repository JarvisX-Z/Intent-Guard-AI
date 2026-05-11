import { useState } from "react";

export default function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Hello! I am Intent Guard AI. How can I help you today?",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "";

  const sendMessage = async () => {
    if (!input.trim()) return;

    if (!API_URL) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Backend API URL is not configured." },
      ]);
      return;
    }

    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);

    const currentInput = input;
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: currentInput }),
      });

      if (!res.ok) throw new Error("Server error");

      const data = await res.json();

      const botMsg = {
        role: "bot",
        text: data.reply || data.response || data.message || "No response.",
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Error connecting to backend." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        🧠 Intent Guard AI
      </div>

      {/* Chat Box */}
      <div style={styles.chatBox}>
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              ...styles.messageRow,
              justifyContent: m.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={{
                ...styles.bubble,
                background:
                  m.role === "user"
                    ? "linear-gradient(135deg, #3b82f6, #2563eb)"
                    : "#1f2937",
                borderBottomRightRadius: m.role === "user" ? 0 : 12,
                borderBottomLeftRadius: m.role === "bot" ? 0 : 12,
              }}
            >
              {m.text}
            </div>
          </div>
        ))}

        {loading && (
          <div style={styles.messageRow}>
            <div style={{ ...styles.bubble, background: "#1f2937" }}>
              Typing...
            </div>
          </div>
        )}
      </div>

      {/* Input Box */}
      <div style={styles.inputArea}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask anything..."
          style={styles.input}
        />

        <button onClick={sendMessage} style={styles.button}>
          Send
        </button>
      </div>
    </div>
  );
}

/* 🎨 STYLES */
const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "linear-gradient(135deg, #0f172a, #111827)",
    color: "white",
    fontFamily: "Arial",
  },

  header: {
    padding: 18,
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    borderBottom: "1px solid #1f2937",
  },

  chatBox: {
    flex: 1,
    padding: 15,
    overflowY: "auto",
  },

  messageRow: {
    display: "flex",
    marginBottom: 10,
  },

  bubble: {
    maxWidth: "75%",
    padding: "10px 14px",
    borderRadius: 14,
    color: "white",
    fontSize: 15,
    lineHeight: 1.4,
    wordBreak: "break-word",
  },

  inputArea: {
    display: "flex",
    padding: 12,
    borderTop: "1px solid #1f2937",
    background: "#0b1220",
  },

  input: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    border: "none",
    outline: "none",
    fontSize: 15,
    background: "#111827",
    color: "white",
  },

  button: {
    marginLeft: 10,
    padding: "10px 18px",
    borderRadius: 10,
    border: "none",
    background: "linear-gradient(135deg, #22c55e, #16a34a)",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
  },
};
