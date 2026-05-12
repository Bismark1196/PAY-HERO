const transactions = global.transactions || (global.transactions = new Map());

export default function handler(req, res) {
  const { reference } = req.query;

  if (!reference) {
    return res.status(400).json({ message: "Missing reference" });
  }

  const tx = transactions.get(reference);

  if (!tx) {
    return res.status(404).json({ message: "Transaction not found" });
  }

  return res.status(200).json(tx);
}