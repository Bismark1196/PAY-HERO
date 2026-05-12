export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  try {
    let { phone, amount } = req.body;

    // Validation
    if (!phone || !amount) {
      return res.status(400).json({
        success: false,
        message: "Phone and amount are required",
      });
    }

    // Format phone number
    phone = phone.replace(/\s+/g, "");

    if (phone.startsWith("07")) {
      phone = "254" + phone.substring(1);
    }

    // Create Basic Auth token
    const auth = Buffer.from(
      `${process.env.PAYHERO_USERNAME}:${process.env.PAYHERO_PASSWORD}`
    ).toString("base64");

    // Send request to PayHero
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
          channel_id: Number(process.env.PAYHERO_ACCOUNT_ID),
          provider: "m-pesa",
          external_reference: `REF-${Date.now()}`,
          callback_url: "https://example.com/callback",
        }),
      }
    );

    // Parse response safely
    const text = await response.text();

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      data = {
        raw: text,
      };
    }

    console.log("PAYHERO STATUS:", response.status);
    console.log("PAYHERO RESPONSE:", data);

    // Return full PayHero response
    return res.status(response.status).json({
      success: response.ok,
      status: response.status,
      data,
    });
  } catch (error) {
    console.error("SERVER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}