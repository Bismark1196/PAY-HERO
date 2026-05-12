import { useState } from "react";

export default function App() {
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [ref, setRef] = useState("");
  const [msg, setMsg] = useState("");

  const sendSTK = async () => {
    setMsg("Sending STK...");

    const res = await fetch("/api/stkpush", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, amount }),
    });

    const data = await res.json();

    console.log(data);

    if (data.success) {
      setRef(data.data?.reference || "N/A");
      setMsg("STK sent. Check your phone.");
    } else {
      setMsg("Payment failed.");
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
      <p>{ref && `Ref: ${ref}`}</p>
    </div>
  );
}