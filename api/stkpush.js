const transactions = global.transactions || (global.transactions = new Map());

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    let { phone, amount } = req.body;

    phone = phone.replace(/\s+/g, "");
    if (phone.startsWith("0")) phone = "254" + phone.slice(1);

    const external_reference = `REF-${Date.now()}`;

    const response = await fetch(
      "https://backend.payhero.co.ke/api/v2/payments",
      {
        method: "POST",
        headers: {
          Authorization: process.env.PAYHERO_BASIC_TOKEN,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Number(amount),
          phone_number: phone,
          channel_id: Number(process.env.PAYHERO_ACCOUNT_ID),
          provider: "m-pesa",
          external_reference,
          callback_url: `${process.env.BASE_URL}/api/callback`,
        }),
      }
    );

    const raw = await response.text();
    let data;

    try {
      data = JSON.parse(raw);
    } catch {
      data = { raw };
    }

    // store transaction
    transactions.set(external_reference, {
      status: "PENDING",
      phone,
      amount,
      createdAt: new Date(),
      payhero: data,
    });

    return res.status(200).json({
      success: true,
      reference: external_reference,
      data,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}