import { useState } from "react";

export default function App() {
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handlePayment = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await fetch("/api/stkpush", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone,
          amount,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("STK Push sent successfully.");
      } else {
        setMessage(data.message || "Payment failed.");
      }
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={container}>
      <h2 style={title}>PayHero STK Push</h2>

      <input
        type="text"
        placeholder="2547XXXXXXXX"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        style={input}
      />

      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={input}
      />

      <button
        onClick={handlePayment}
        disabled={loading}
        style={button}
      >
        {loading ? "Processing..." : "Pay Now"}
      </button>

      {message && <p>{message}</p>}
    </div>
  );
}

const container = {
  maxWidth: "400px",
  margin: "50px auto",
  background: "#fff",
  padding: "24px",
  borderRadius: "12px",
  display: "flex",
  flexDirection: "column",
  gap: "12px",
};

const title = {
  textAlign: "center",
};

const input = {
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #ccc",
};

const button = {
  padding: "12px",
  border: "none",
  borderRadius: "8px",
  background: "#16a34a",
  color: "#fff",
  cursor: "pointer",
};