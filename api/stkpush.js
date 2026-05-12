export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  try {
    const { phone, amount } = req.body;

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
          callback_url:
            "https://your-domain.vercel.app/api/payment-callback",
        }),
      }
    );

    const data = await response.json();

    return res.status(200).json(data);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Payment failed",
    });
  }
}