// pages/api/user/[userId]/memos.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


/**
 * @swagger
 * tags:
 *   name: Memos
 *   description: API for managing memos
 * 
 * /api/user/{userId}/memos:
 *   get:
 *     summary: Fetches all memos belonging to a specific user
 *     tags: [Memos]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user whose memos are being requested
 *     responses:
 *       200:
 *         description: Successfully fetched an array of memos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: The memo ID
 *                   content:
 *                     type: string
 *                     description: The memo content
 *       500:
 *         description: Server error while fetching memos
 * 
 *   post:
 *     summary: Creates a new memo for a specific user
 *     tags: [Memos]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user for whom the memo is being created
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: The content of the memo to be created
 *     responses:
 *       200:
 *         description: Successfully created and returned the new memo
 *       500:
 *         description: Server error while saving the memo
 */
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
