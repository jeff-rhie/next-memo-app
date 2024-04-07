import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export default async function handler(req, res) {
    console.log(req.method, req.body);
  if (req.method !== 'POST') {
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { email, password } = req.body;

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ message: "Invalid email format." });
  }

  if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password)) {
    return res.status(400).json({ message: "Password must be at least 8 characters long and include at least one letter and one number." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 5);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });
    console.log("User created successfully");
    res.status(200).json({ message: "Signup successful.", userId: user.id });
  } catch (error) {
    console.error("Signup Error:", error);
    if (error.code === 'P2002') {
      return res.status(400).json({ message: "Error creating user. The email is already in use." });
    }
    else if (process.env.NODE_ENV === 'development') {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
      }
    else {
        return res.status(500).json({ message: "An unexpected error occurred.", error: error.message });
    }
  }
}
