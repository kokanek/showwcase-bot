// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const expectedAuthHeader = process.env.ASD9_BOTH_AUTH_HEADER;

// asd9bot bot handler
export default async function handler(req, res) {
  if (req.headers.authorization != `Bearer ${expectedAuthHeader}`) {
    res.status(400).json({ message: 'Authentication error' });
  } else {
    res.status(200).json({ message: 'success' });
  }
}
