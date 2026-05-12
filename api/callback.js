const transactions = global.transactions || (global.transactions = new Map());

export default async function handler(req, res) {
  try {
    const body = req.body;

    console.log("PAYHERO CALLBACK:", body);

    const reference = body.external_reference;

    if (transactions.has(reference)) {
      const tx = transactions.get(reference);

      transactions.set(reference, {
        ...tx,
        status: body.status || "SUCCESS",
        callback: body,
        updatedAt: new Date(),
      });
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}