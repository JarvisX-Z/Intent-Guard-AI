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
        Powered by Replit
      </footer>

    </div>
  );
}
