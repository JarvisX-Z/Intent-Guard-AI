import { useState } from "react";

export default function App() {
  const [signature, setSignature] = useState("");
  const [intent, setIntent] = useState("");
  const [rpc, setRpc] = useState("https://api.mainnet-beta.solana.com");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const analyzeIntent = async () => {
    setLoading(true);

    // Fake analysis (replace with backend later)
    setTimeout(() => {
      setResult({
        risk: "LOW",
        message: "Transaction intent looks consistent with swap behavior.",
        recommendation: "Safe to proceed"
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div style={styles.page}>
      
      {/* Header */}
      <div style={styles.header}>
        <h1>IntentGuard AI</h1>
        <p>Verify your Solana transaction intent before signing.</p>
      </div>

      {/* Card */}
      <div style={styles.card}>
        
        <h2>New Analysis</h2>
        <p style={styles.subText}>
          Paste a transaction signature and describe what you are trying to do.
        </p>

        {/* Signature */}
        <label>Transaction Signature</label>
        <input
          style={styles.input}
          placeholder="e.g. 5xXy... or base64 raw tx"
          value={signature}
          onChange={(e) => setSignature(e.target.value)}
        />

        {/* Intent */}
        <label>Your Intent</label>
        <textarea
          style={styles.textarea}
          placeholder="I want to swap 1 SOL for USDC on Jupiter..."
          value={intent}
          onChange={(e) => setIntent(e.target.value)}
        />

        {/* RPC */}
        <label>Custom RPC URL (Optional)</label>
        <input
          style={styles.input}
          value={rpc}
          onChange={(e) => setRpc(e.target.value)}
        />

        {/* Button */}
        <button style={styles.button} onClick={analyzeIntent}>
          {loading ? "Analyzing..." : "Analyze Intent"}
        </button>

        {/* Result */}
        <div style={styles.resultBox}>
          {!result ? (
            <p>Awaiting Transaction</p>
          ) : (
            <>
              <h3>Risk: {result.risk}</h3>
              <p>{result.message}</p>
              <p><b>{result.recommendation}</b></p>
            </>
          )}
        </div>

      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        © 2026 IntentGuard AI. Verifying Solana transactions.
        <br />
        Powered by Jarvis Z-X
      </footer>

    </div>
  );
}
const styles = {
  page: {
    minHeight: "100vh",
    background: "radial-gradient(circle at top, #0b0f19, #05070f)",
    color: "white",
    fontFamily: "Inter, Arial, sans-serif",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "40px"
  },

  header: {
    textAlign: "center",
    marginBottom: "30px"
  },

  card: {
    width: "100%",
    maxWidth: "520px",
    background: "rgba(18, 26, 42, 0.85)",
    padding: "24px",
    borderRadius: "16px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.6)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.08)"
  },

  input: {
    width: "100%",
    padding: "12px",
    margin: "10px 0 16px 0",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.1)",
    outline: "none",
    background: "#0f172a",
    color: "white"
  },

  textarea: {
    width: "100%",
    height: "90px",
    padding: "12px",
    margin: "10px 0 16px 0",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.1)",
    outline: "none",
    background: "#0f172a",
    color: "white",
    resize: "none"
  },

  button: {
    width: "100%",
    padding: "12px",
    background: "linear-gradient(90deg, #4f46e5, #7c3aed)",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "0.2s ease"
  },

  resultBox: {
    marginTop: "20px",
    padding: "16px",
    background: "#0b1220",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.08)"
  },

  subText: {
    fontSize: "13px",
    opacity: 0.7
  },

  footer: {
    marginTop: "25px",
    fontSize: "12px",
    opacity: 0.6,
    textAlign: "center"
  }
};
