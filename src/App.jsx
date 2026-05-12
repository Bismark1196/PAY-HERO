import { useState } from "react";

export default function App() {
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [status, setStatus] = useState("");

  const pay = async () => {
    const res = await fetch("/api/stkpush", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, amount }),
    });

    const data = await res.json();
    setReference(data.reference);
    setStatus("STK Sent... check phone");
  };

  const checkStatus = async () => {
    const res = await fetch(`/api/status?reference=${reference}`);
    const data = await res.json();
    setStatus(JSON.stringify(data, null, 2));
  };

  return (
    <div style={{ maxWidth: 400, margin: "60px auto" }}>
      <h2>Production PayHero System</h2>

      <input
        placeholder="2547XXXXXXXX"
        onChange={(e) => setPhone(e.target.value)}
      />

      <input
        placeholder="Amount"
        type="number"
        onChange={(e) => setAmount(e.target.value)}
      />

      <button onClick={pay}>Send STK</button>

      {reference && (
        <>
          <button onClick={checkStatus}>Check Status</button>
          <p>Ref: {reference}</p>
        </>
      )}

      <pre>{status}</pre>
    </div>
  );
}