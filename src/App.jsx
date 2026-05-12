import { useState, useCallback } from "react";

// ─── Icon SVGs ──────────────────────────────────────────────────────────────

function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.13 6.13l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  );
}

function AmountIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" style={{ animation: "spin 1s linear infinite", transformOrigin: "center" }}/>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  );
}

function MpesaIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill="#00b67a"/>
      <text x="16" y="21" textAnchor="middle" fontSize="13" fontWeight="700" fill="white" fontFamily="Inter,sans-serif">M</text>
    </svg>
  );
}

// ─── Validation ──────────────────────────────────────────────────────────────

function validatePhone(raw) {
  const cleaned = raw.replace(/[\s\-+]/g, "");
  if (!cleaned) return { valid: false, error: "Phone number is required." };
  if (!/^\d+$/.test(cleaned)) return { valid: false, error: "Phone must contain digits only." };
  let normalized = cleaned;
  if (normalized.startsWith("0")) normalized = "254" + normalized.slice(1);
  else if (normalized.startsWith("7") || normalized.startsWith("1")) normalized = "254" + normalized;
  if (!/^254\d{9}$/.test(normalized)) return { valid: false, error: "Enter a valid Safaricom number (e.g. 0712345678)." };
  return { valid: true, error: null };
}

function validateAmount(raw) {
  if (!raw) return { valid: false, error: "Amount is required." };
  const n = Number(raw);
  if (isNaN(n) || n < 1) return { valid: false, error: "Minimum amount is KES 1." };
  if (n > 150000) return { valid: false, error: "Maximum amount is KES 150,000." };
  if (!Number.isInteger(n)) return { valid: false, error: "Amount must be a whole number." };
  return { valid: true, error: null };
}

// ─── Step constants ───────────────────────────────────────────────────────────

const STEP = { FORM: "form", PENDING: "pending", SUCCESS: "success", FAILED: "failed" };

// ─── Main Component ──────────────────────────────────────────────────────────

export default function App() {
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [amountError, setAmountError] = useState("");
  const [step, setStep] = useState(STEP.FORM);
  const [statusMsg, setStatusMsg] = useState("");
  const [reference, setReference] = useState("");
  const [pollingCount, setPollingCount] = useState(0);

  // Real-time field validation
  const handlePhoneChange = (e) => {
    const val = e.target.value;
    setPhone(val);
    if (phoneError) setPhoneError(validatePhone(val).error || "");
  };

  const handleAmountChange = (e) => {
    const val = e.target.value;
    setAmount(val);
    if (amountError) setAmountError(validateAmount(val).error || "");
  };

  const pollStatus = useCallback(async (ref, attempts = 0) => {
    if (attempts >= 10) {
      setStep(STEP.FAILED);
      setStatusMsg("Payment timed out. If you approved the prompt, it will still be processed.");
      return;
    }

    setPollingCount(attempts + 1);

    try {
      const res = await fetch(`/api/status?reference=${encodeURIComponent(ref)}`);
      const data = await res.json();
      const status = data?.data?.status?.toLowerCase();

      if (status === "success" || status === "completed") {
        setStep(STEP.SUCCESS);
        return;
      } else if (status === "failed" || status === "cancelled") {
        setStep(STEP.FAILED);
        setStatusMsg("Payment was declined or cancelled. Please try again.");
        return;
      }
    } catch {
      // Network error – keep polling
    }

    // Try again in 4 seconds
    setTimeout(() => pollStatus(ref, attempts + 1), 4000);
  }, []);

  const handleSubmit = async () => {
    const pv = validatePhone(phone);
    const av = validateAmount(amount);

    setPhoneError(pv.error || "");
    setAmountError(av.error || "");

    if (!pv.valid || !av.valid) return;

    setStep(STEP.PENDING);
    setStatusMsg("Sending STK push to your phone…");

    try {
      const res = await fetch("/api/stkpush", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, amount }),
      });

      const data = await res.json();

      if (data.success) {
        const ref = data.reference || data.data?.reference || `REF-${Date.now()}`;
        setReference(ref);
        setStatusMsg("M-Pesa prompt sent! Enter your PIN on your phone.");
        // Start polling for confirmation after a short delay
        setTimeout(() => pollStatus(ref, 0), 5000);
      } else {
        setStep(STEP.FAILED);
        setStatusMsg(data.message || "Payment initiation failed. Please try again.");
      }
    } catch (err) {
      setStep(STEP.FAILED);
      setStatusMsg("Network error. Check your connection and try again.");
    }
  };

  const reset = () => {
    setPhone("");
    setAmount("");
    setPhoneError("");
    setAmountError("");
    setStep(STEP.FORM);
    setStatusMsg("");
    setReference("");
    setPollingCount(0);
  };

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
        .card { animation: fadeIn 0.35s ease; }
        .spin { animation: spin 1s linear infinite; }
        .pulse { animation: pulse 1.5s ease-in-out infinite; }
      `}</style>

      {/* Header */}
      <header style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 8 }}>
          <MpesaIcon />
          <span style={{ fontSize: 22, fontWeight: 700, color: "#1a202c" }}>PayHero</span>
        </div>
        <p style={{ color: "#6c757d", fontSize: 14 }}>Secure M-Pesa STK Push Payments</p>
      </header>

      {/* Card */}
      <div className="card" style={{
        background: "#ffffff",
        borderRadius: 16,
        padding: "36px 32px",
        width: "100%",
        maxWidth: 420,
        boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
      }}>

        {/* ── FORM STEP ── */}
        {step === STEP.FORM && (
          <>
            <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6, color: "#1a202c" }}>
              Make a Payment
            </h1>
            <p style={{ color: "#6c757d", fontSize: 14, marginBottom: 28 }}>
              Enter your M-Pesa number and the amount to pay.
            </p>

            {/* Phone */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Phone Number</label>
              <div style={inputWrapStyle(phoneError)}>
                <span style={iconStyle}><PhoneIcon /></span>
                <input
                  type="tel"
                  placeholder="0712 345 678"
                  value={phone}
                  onChange={handlePhoneChange}
                  onBlur={() => setPhoneError(validatePhone(phone).error || "")}
                  style={inputStyle}
                  maxLength={15}
                  autoComplete="tel"
                />
              </div>
              {phoneError && <p style={errorStyle}>{phoneError}</p>}
            </div>

            {/* Amount */}
            <div style={{ marginBottom: 28 }}>
              <label style={labelStyle}>Amount (KES)</label>
              <div style={inputWrapStyle(amountError)}>
                <span style={iconStyle}><AmountIcon /></span>
                <input
                  type="number"
                  placeholder="100"
                  value={amount}
                  onChange={handleAmountChange}
                  onBlur={() => setAmountError(validateAmount(amount).error || "")}
                  style={inputStyle}
                  min="1"
                  max="150000"
                />
              </div>
              {amountError && <p style={errorStyle}>{amountError}</p>}
            </div>

            <button onClick={handleSubmit} style={primaryBtnStyle}>
              Send M-Pesa Prompt
            </button>

            <p style={{ textAlign: "center", fontSize: 12, color: "#adb5bd", marginTop: 20 }}>
              🔒 Secured by PayHero · Your PIN is never shared
            </p>
          </>
        )}

        {/* ── PENDING STEP ── */}
        {step === STEP.PENDING && (
          <div style={{ textAlign: "center", padding: "8px 0" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#e6f9f2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <div className="spin" style={{ color: "#00b67a" }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
              </div>
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10, color: "#1a202c" }}>Waiting for Payment</h2>
            <p style={{ color: "#6c757d", fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>{statusMsg}</p>

            {reference && (
              <div style={{ background: "#f7f8fa", borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}>
                <p style={{ fontSize: 11, color: "#adb5bd", marginBottom: 2 }}>REFERENCE</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#2d3748", letterSpacing: "0.5px" }}>{reference}</p>
              </div>
            )}

            <div className="pulse" style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 24 }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#00b67a", animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>

            <p style={{ fontSize: 12, color: "#adb5bd" }}>
              Checking status… {pollingCount > 0 ? `(attempt ${pollingCount}/10)` : ""}
            </p>

            <button onClick={reset} style={{ ...ghostBtnStyle, marginTop: 20 }}>
              Cancel
            </button>
          </div>
        )}

        {/* ── SUCCESS STEP ── */}
        {step === STEP.SUCCESS && (
          <div style={{ textAlign: "center", padding: "8px 0" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#e6f9f2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: "#00b67a" }}>
              <CheckIcon />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: "#1a202c" }}>Payment Successful!</h2>
            <p style={{ color: "#6c757d", fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
              Your payment of <strong>KES {Number(amount).toLocaleString()}</strong> has been confirmed.
            </p>
            {reference && (
              <div style={{ background: "#f0fdf8", border: "1px solid #b7efd8", borderRadius: 8, padding: "10px 14px", marginBottom: 24 }}>
                <p style={{ fontSize: 11, color: "#00b67a", marginBottom: 2 }}>TRANSACTION REFERENCE</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#1a202c" }}>{reference}</p>
              </div>
            )}
            <button onClick={reset} style={primaryBtnStyle}>
              Make Another Payment
            </button>
          </div>
        )}

        {/* ── FAILED STEP ── */}
        {step === STEP.FAILED && (
          <div style={{ textAlign: "center", padding: "8px 0" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#fff5f5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: "#e53e3e" }}>
              <AlertIcon />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: "#1a202c" }}>Payment Failed</h2>
            <p style={{ color: "#6c757d", fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>{statusMsg}</p>
            <button onClick={reset} style={primaryBtnStyle}>
              Try Again
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{ marginTop: 24, textAlign: "center", color: "#adb5bd", fontSize: 12 }}>
        Powered by{" "}
        <a href="https://payhero.co.ke" target="_blank" rel="noopener noreferrer" style={{ color: "#00b67a", textDecoration: "none", fontWeight: 600 }}>
          PayHero
        </a>
        {" "}· KES payments via M-Pesa
      </footer>
    </>
  );
}

// ─── Shared Styles ────────────────────────────────────────────────────────────

const labelStyle = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "#2d3748",
  marginBottom: 8,
};

const inputWrapStyle = (hasError) => ({
  display: "flex",
  alignItems: "center",
  border: `1.5px solid ${hasError ? "#e53e3e" : "#e9ecef"}`,
  borderRadius: 10,
  background: "#f7f8fa",
  transition: "border-color 0.2s, box-shadow 0.2s",
  overflow: "hidden",
});

const iconStyle = {
  padding: "0 14px",
  color: "#adb5bd",
  display: "flex",
  alignItems: "center",
  flexShrink: 0,
};

const inputStyle = {
  flex: 1,
  border: "none",
  background: "transparent",
  padding: "14px 14px 14px 0",
  fontSize: 15,
  color: "#1a202c",
  outline: "none",
  width: "100%",
};

const errorStyle = {
  fontSize: 12,
  color: "#e53e3e",
  marginTop: 6,
};

const primaryBtnStyle = {
  width: "100%",
  padding: "14px 20px",
  background: "linear-gradient(135deg, #00c87a, #00a066)",
  color: "#fff",
  border: "none",
  borderRadius: 10,
  fontSize: 15,
  fontWeight: 700,
  cursor: "pointer",
  transition: "opacity 0.2s, transform 0.15s",
  letterSpacing: "0.3px",
};

const ghostBtnStyle = {
  background: "transparent",
  border: "1.5px solid #e9ecef",
  borderRadius: 10,
  padding: "10px 24px",
  fontSize: 14,
  color: "#6c757d",
  cursor: "pointer",
  fontWeight: 500,
};