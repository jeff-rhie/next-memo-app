// pages/api/login.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { createClient } from 'redis';

const prisma = new PrismaClient();
const redisClient = createClient({ url: 'redis://localhost:6379' });
redisClient.connect();


/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Handles user login, including authentication and rate limiting.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email address of the user trying to log in.
 *               password:
 *                 type: string
 *                 description: The password of the user trying to log in.
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Login successful, returns a message and the userId.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 userId:
 *                   type: integer
 *       401:
 *         description: Login fails due to invalid credentials or too many attempts, returns an error message.
 *       405:
 *         description: If the request method is not POST, returns an error message.
 *       500:
 *         description: If a server error occurs, returns an error message.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { email, password } = req.body;
  const attemptsKey = `loginAttempts:${email}`;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (isPasswordValid) {
      await redisClient.del(attemptsKey);
      res.json({ message: "Login successful", userId: user.id });
    } else {
      const failedAttempts = parseInt(await redisClient.incr(attemptsKey)) || 1;
      await redisClient.expire(attemptsKey, 3600);
      if (failedAttempts >= 3) {
        const newPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({ where: { email }, data: { password: hashedPassword } });
        await redisClient.del(attemptsKey);
        res.status(401).json({ message: `Too many failed login attempts. Your password has been reset.` });
      } else {
        res.status(401).json({ message: `Invalid email or password. You have ${3 - failedAttempts} attempt(s) left.` });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred during the login process." });
  }
}
