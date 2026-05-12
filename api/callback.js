export default async function handler(req, res) {
  try {
    console.log("PAYMENT CALLBACK RECEIVED:", req.body);

    // You will later store this in DB
    return res.status(200).json({ received: true });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}