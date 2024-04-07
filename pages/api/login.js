// pages/api/login.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { createClient } from 'redis';

const prisma = new PrismaClient();
const redisClient = createClient({ url: 'redis://localhost:6379' });
redisClient.connect();

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
