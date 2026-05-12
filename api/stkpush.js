export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    let { phone, amount } = req.body;

    if (!phone || !amount) {
      return res.status(400).json({
        success: false,
        message: "Phone and amount required",
      });
    }

    // normalize phone
    phone = phone.replace(/\s+/g, "");
    if (phone.startsWith("0")) {
      phone = "254" + phone.slice(1);
    }

    const payload = {
      amount: Number(amount),
      phone_number: phone,
      channel_id: Number(process.env.PAYHERO_ACCOUNT_ID),
      provider: "m-pesa",
      external_reference: `REF-${Date.now()}`,
      callback_url: `${process.env.BASE_URL}/api/callback`,
    };

    const response = await fetch(
      "https://backend.payhero.co.ke/api/v2/payments",
      {
        method: "POST",
        headers: {
          Authorization: process.env.PAYHERO_BASIC_TOKEN,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const raw = await response.text();

    console.log("PAYHERO STATUS:", response.status);
    console.log("PAYHERO RESPONSE:", raw);

    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      data = { raw };
    }

    return res.status(200).json({
      success: response.ok,
      status: response.status,
      data,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}