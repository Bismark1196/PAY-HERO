// api/status.js - Query PayHero for real-time transaction status

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { reference } = req.query;

  if (!reference) {
    return res.status(400).json({ success: false, message: "Missing reference parameter." });
  }

  try {
    const { PAYHERO_BASIC_TOKEN } = process.env;

    if (!PAYHERO_BASIC_TOKEN) {
      return res.status(500).json({ success: false, message: "Server configuration error." });
    }

    const payheroRes = await fetch(
      `https://backend.payhero.co.ke/api/v2/transaction-status?reference=${encodeURIComponent(reference)}`,
      {
        method: "GET",
        headers: {
          Authorization: PAYHERO_BASIC_TOKEN.startsWith("Basic ")
            ? PAYHERO_BASIC_TOKEN
            : `Basic ${PAYHERO_BASIC_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    const rawText = await payheroRes.text();
    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      data = { raw: rawText };
    }

    return res.status(200).json({
      success: payheroRes.ok,
      data,
    });
  } catch (error) {
    console.error("[Status Check Error]", error.message);
    return res.status(500).json({ success: false, message: "Failed to check transaction status." });
  }
}