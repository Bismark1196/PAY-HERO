export default async function handler(req, res) {
  try {
    console.log("PAYMENT CALLBACK RECEIVED:", req.body);

    return res.status(200).json({ received: true });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}