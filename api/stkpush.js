export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  try {
    const { phone, amount } = req.body;

    if (!phone || !amount) {
      return res.status(400).json({
        success: false,
        message: "Phone and amount are required",
      });
    }

    const auth = Buffer.from(
      `${process.env.PAYHERO_USERNAME}:${process.env.PAYHERO_PASSWORD}`
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
          channel_id: Number(process.env.PAYHERO_ACCOUNT_ID),
          provider: "m-pesa",
          external_reference: `REF-${Date.now()}`,
          callback_url: "https://example.com/callback",
        }),
      }
    );

    const data = await response.json();

    return res.status(response.status).json(data);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}