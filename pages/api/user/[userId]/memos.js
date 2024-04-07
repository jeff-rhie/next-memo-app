// pages/api/user/[userId]/memos.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { userId } = req.query;

  switch (req.method) {
    case 'GET':
      try {
        const memos = await prisma.memo.findMany({
          where: { userId: parseInt(userId) },
        });
        res.json(memos);
      } catch (error) {
        console.error(error);
        res.status(500).send("Error fetching memos.");
      }
      break;
    
    case 'POST':
      const { content } = req.body;
      try {
        const memo = await prisma.memo.create({
          data: {
            content,
            userId: parseInt(userId),
          },
        });
        res.json(memo);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error saving memo." });
      }
      break;
    
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
