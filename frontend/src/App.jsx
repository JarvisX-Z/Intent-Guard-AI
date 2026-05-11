import { useState } from "react";

export default function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    try {
      const res = await fetch("https://intent-guard-ai-3.onrender.com/");

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.text();

      const botMsg = { role: "bot", text: data };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      const botMsg = {
        role: "bot",
        text: "Error connecting to backend.",
      };

      setMessages((prev) => [...prev, botMsg]);
      console.error("Fetch error:", error);
    }
  };
      
  return (
    <div style={{
      height: "100vh",
      background: "#0f172a",
      color: "white",
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    }}>

      <h1 style={{ marginTop: 20 }}>🧠 Intent Guard AI</h1>

      <div style={{
        width: "90%",
        maxWidth: 600,
        flex: 1,
        overflowY: "auto",
        marginTop: 20
      }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            textAlign: m.role === "user" ? "right" : "left",
            margin: "10px"
          }}>
            <span style={{
              display: "inline-block",
              padding: "10px",
              borderRadius: 10,
              background: m.role === "user" ? "#2563eb" : "#1e293b"
            }}>
              {m.text}
            </span>
          </div>
        ))}
      </div>

      <div style={{
        display: "flex",
        width: "90%",
        maxWidth: 600,
        marginBottom: 20
      }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something..."
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 8,
            border: "none"
          }}
        />
        <button
          onClick={sendMessage}
          style={{
            marginLeft: 10,
            padding: "10px 20px",
            background: "#22c55e",
            borderRadius: 8,
            border: "none"
          }}
        >
          Send
        </button>
      </div>

    </div>
  );
}
