import { PrismaClient } from '@prisma/client';

// Create a single instance of PrismaClient to be reused
const prisma = new PrismaClient();

export class OTPService {
  private static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static async createOTP(phone: string): Promise<string> {
    const otp = this.generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Update user with new OTP
    await prisma.user.update({
      where: { phone },
      data: { 
        otp,
        otpExpiresAt,
        isVerified: false, // Reset verification status when new OTP is generated
      },
    });

    // TODO: Integrate with an SMS service provider
    console.log(`OTP for ${phone}: ${otp}`);
    
    return otp;
  }

  static async verifyOTP(phone: string, otpToVerify: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { phone },
      select: {
        otp: true,
        otpExpiresAt: true,
      },
    });

    // Check if user exists and has OTP data
    if (!user?.otp || !user?.otpExpiresAt) {
      return false;
    }

    // Check if OTP matches
    if (user.otp !== otpToVerify) {
      return false;
    }

    // Check if OTP is expired
    if (new Date() > user.otpExpiresAt) {
      return false;
    }

    // Clear OTP and mark as verified
    await prisma.user.update({
      where: { phone },
      data: {
        isVerified: true,
        otp: null,
        otpExpiresAt: null,
      },
    });

    return true;
  }
}

// Export a singleton instance
export const otpService = new OTPService();