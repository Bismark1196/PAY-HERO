// api/stkpush.js - PayHero STK Push Serverless Function

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    let { phone, amount } = req.body || {};

    // Validate inputs
    if (!phone || !amount) {
      return res.status(400).json({
        success: false,
        message: "Phone number and amount are required.",
      });
    }

    // Normalise phone: strip spaces/dashes then convert to 254XXXXXXXXX
    phone = phone.replace(/[\s\-+]/g, "");

    if (phone.startsWith("0")) {
      phone = "254" + phone.slice(1);
    } else if (phone.startsWith("7") || phone.startsWith("1")) {
      phone = "254" + phone;
    }

    if (!/^254\d{9}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number. Use format 0XXXXXXXXX or 254XXXXXXXXX.",
      });
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount < 1) {
      return res.status(400).json({
        success: false,
        message: "Amount must be a positive number (minimum KES 1).",
      });
    }

    // Validate environment variables are set
    const { PAYHERO_BASIC_TOKEN, PAYHERO_ACCOUNT_ID, BASE_URL } = process.env;

    if (!PAYHERO_BASIC_TOKEN || !PAYHERO_ACCOUNT_ID) {
      console.error("Missing required environment variables");
      return res.status(500).json({
        success: false,
        message: "Server configuration error. Contact support.",
      });
    }

    const reference = `REF-${Date.now()}`;
    const callbackUrl = BASE_URL
      ? `${BASE_URL}/api/callback`
      : "https://your-vercel-app.vercel.app/api/callback";

    const payload = {
      amount: numericAmount,
      phone_number: phone,
      channel_id: Number(PAYHERO_ACCOUNT_ID),
      provider: "m-pesa",
      external_reference: reference,
      callback_url: callbackUrl,
      description: "STK Payment",
      account_reference: "WEB-PAYMENT",
    };

    const payheroRes = await fetch("https://backend.payhero.co.ke/api/v2/payments", {
      method: "POST",
      headers: {
        // Ensure the token has the "Basic " prefix
        Authorization: PAYHERO_BASIC_TOKEN.startsWith("Basic ")
          ? PAYHERO_BASIC_TOKEN
          : `Basic ${PAYHERO_BASIC_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const rawText = await payheroRes.text();
    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      data = { raw: rawText };
    }

    if (!payheroRes.ok) {
      console.error("PayHero error:", payheroRes.status, rawText);
      return res.status(200).json({
        success: false,
        message: data?.message || "Payment initiation failed. Please try again.",
        details: data,
      });
    }

    return res.status(200).json({
      success: true,
      message: "STK push sent. Check your phone for the M-Pesa prompt.",
      reference,
      data,
    });
  } catch (error) {
    console.error("Unhandled error in stkpush:", error);
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred. Please try again.",
    });
  }
}