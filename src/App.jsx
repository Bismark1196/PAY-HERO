import { useState } from "react";

export default function App() {
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [msg, setMsg] = useState("");
  const [ref, setRef] = useState("");

  const sendSTK = async () => {
    setMsg("Processing STK...");

    try {
      const res = await fetch("/api/stkpush", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, amount }),
      });

      const data = await res.json();

      console.log("RESPONSE:", data);

      if (data.success) {
        setRef(data.data?.data?.reference || "N/A");
        setMsg("STK sent successfully. Check your phone.");
      } else {
        setMsg(
          data.data?.raw
            ? `Failed: ${data.data.raw}`
            : "Payment failed"
        );
      }
    } catch (err) {
      setMsg("Error: " + err.message);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "60px auto" }}>
      <h2>PayHero STK Push</h2>

      <input
        placeholder="2547XXXXXXXX"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <input
        placeholder="Amount"
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <button onClick={sendSTK}>Send STK</button>

      <p>{msg}</p>
      {ref && <p>Ref: {ref}</p>}
    </div>
  );
}