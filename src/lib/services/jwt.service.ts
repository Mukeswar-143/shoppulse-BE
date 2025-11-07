import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export class JWTService {
  static generateToken(userId: number, phone: string): string {
    return jwt.sign(
      {
        userId,
        phone,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  static verifyToken(token: string): { userId: number; phone: string } | null {
    try {
      return jwt.verify(token, JWT_SECRET) as { userId: number; phone: string };
    } catch (error) {
      return null;
    }
  }
}