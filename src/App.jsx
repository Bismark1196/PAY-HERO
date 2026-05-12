import { useState } from "react";

export default function App() {
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const payNow = async () => {
    try {
      setLoading(true);

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

      console.log(data);

      if (data.success) {
        alert("STK Push sent successfully");
      } else {
        alert(data.message || "Failed");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "50px auto",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <h2>PayHero STK Push</h2>

      <input
        placeholder="2547XXXXXXXX"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <button onClick={payNow} disabled={loading}>
        {loading ? "Processing..." : "Pay Now"}
      </button>
    </div>
  );
}