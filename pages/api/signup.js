import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/signup:
 *   post:
 *     summary: Handles user registration, including input validation and password hashing.
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
 *                 description: The email address of the user attempting to sign up. Must be a valid email format.
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 description: The password of the user attempting to sign up. Must be at least 8 characters long and include at least one letter and one number.
 *                 example: "Password123"
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Signup successful, returns a success message and the userId of the newly created user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Signup successful.
 *                 userId:
 *                   type: integer
 *                   example: 1
 *       400:
 *         description: If the input validation fails for email or password, or if the email is already in use, returns an error message indicating the reason.
 *       405:
 *         description: If the request method is not POST, returns an error message.
 *       500:
 *         description: If a server error occurs, returns an error message. The message is more detailed in development mode.
 */
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
