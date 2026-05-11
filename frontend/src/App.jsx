import { useState } from "react";

export default function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Hello! I am Intent Guard AI. How can I help you today?",
    },
  ]);

  const API_URL = import.meta.env.VITE_API_URL || "";

  const sendMessage = async () => {
    if (!API_URL) {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "Backend API URL is not configured.",
        },
      ]);
      return;
    }
    if (!input.trim()) return;

    // Add user message
    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);

    const currentInput = input;
    setInput("");

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: currentInput,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();

      const botMsg = {
        role: "bot",
        text:
          data.reply ||
          data.response ||
          data.message ||
          "No response from AI.",
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error("Fetch error:", error);

      const botMsg = {
        role: "bot",
        text: "Error connecting to backend.",
      };

      setMessages((prev) => [...prev, botMsg]);
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        background: "#0f172a",
        color: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ marginTop: 20 }}>🧠 Intent Guard AI</h1>

      <div
        style={{
          width: "90%",
          maxWidth: 600,
          flex: 1,
          overflowY: "auto",
          marginTop: 20,
        }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              textAlign: m.role === "user" ? "right" : "left",
              margin: "10px 0",
            }}
          >
            <span
              style={{
                display: "inline-block",
                padding: "10px 14px",
                borderRadius: 10,
                background:
                  m.role === "user" ? "#2563eb" : "#1e293b",
                maxWidth: "80%",
                wordBreak: "break-word",
              }}
            >
              {m.text}
            </span>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          width: "90%",
          maxWidth: 600,
          marginBottom: 20,
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage();
            }
          }}
          placeholder="Ask something..."
          style={{
            flex: 1,
            padding: 12,
            borderRadius: 8,
            border: "none",
            outline: "none",
            fontSize: 16,
          }}
        />

        <button
          onClick={sendMessage}
          style={{
            marginLeft: 10,
            padding: "12px 20px",
            background: "#22c55e",
            color: "white",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
