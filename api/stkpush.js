export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  try {
    let { phone, amount } = req.body;

    if (!phone || !amount) {
      return res.status(400).json({
        success: false,
        message: "Phone and amount are required",
      });
    }

    phone = phone.replace(/\s+/g, "");

    if (phone.startsWith("07")) {
      phone = "254" + phone.substring(1);
    }

    const username = process.env.PAYHERO_USERNAME;
    const password = process.env.PAYHERO_PASSWORD;
    const channelId = process.env.PAYHERO_ACCOUNT_ID;

    // Check env variables
    if (!username || !password || !channelId) {
      return res.status(500).json({
        success: false,
        message: "Missing environment variables",
      });
    }

    const auth = Buffer.from(
      `${username}:${password}`
    ).toString("base64");

    const response = await fetch(
      "https://backend.payhero.co.ke/api/v2/payments",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Number(amount),
          phone_number: phone,
          channel_id: Number(channelId),
          provider: "m-pesa",
          external_reference: `REF-${Date.now()}`,
          callback_url: "https://example.com/callback",
        }),
      }
    );

    const rawText = await response.text();

    console.log("PAYHERO RAW:", rawText);

    let data;

    try {
      data = JSON.parse(rawText);
    } catch {
      data = { raw: rawText };
    }

    return res.status(response.status).json(data);

  } catch (error) {
    console.error("SERVER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}