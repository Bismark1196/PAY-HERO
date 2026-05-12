// api/callback.js - PayHero Payment Callback / Webhook Handler

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(204).end();
  }

  try {
    const payload = req.body;

    // Log the full callback for debugging in Vercel function logs
    console.log("[PayHero Callback]", JSON.stringify(payload, null, 2));

    // PayHero expects a 200 OK response immediately
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("[PayHero Callback Error]", error.message);
    return res.status(200).json({ received: true }); // Always ACK to avoid retries
  }
}