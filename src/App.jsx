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

      // Read raw response first
      const text = await response.text();

      console.log("RAW RESPONSE:", text);

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        data = { raw: text };
      }

      console.log("PARSED DATA:", data);

      if (response.ok) {
        setMessage(
          data?.message ||
            data?.data?.message ||
            "STK Push sent successfully."
        );
      } else {
        setMessage(
          data?.message ||
            data?.data?.message ||
            "Payment failed."
        );
      }
    } catch (error) {
      console.error("FRONTEND ERROR:", error);

      setMessage(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={container}>
      <h1 style={title}>PayHero STK Push</h1>

      <input
        type="text"
        placeholder="07XXXXXXXX"
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

      {message && (
        <div style={messageStyle}>
          {message}
        </div>
      )}
    </div>
  );
}

const container = {
  maxWidth: "400px",
  margin: "60px auto",
  background: "#fff",
  padding: "24px",
  borderRadius: "12px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
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

const messageStyle = {
  marginTop: "10px",
  textAlign: "center",
};