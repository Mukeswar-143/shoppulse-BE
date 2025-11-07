import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { OTPService } from '@/lib/services/otp.service';
import { JWTService } from '@/lib/services/jwt.service';
import { VerifyOTPRequest, AuthResponse } from '@/lib/types/auth.types';

const prisma = new PrismaClient();

export async function POST(req: NextRequest): Promise<NextResponse<AuthResponse>> {
  try {
    const body: VerifyOTPRequest = await req.json();
    const { phone, otp } = body;

    if (!phone || !otp) {
      return NextResponse.json({
        success: false,
        message: 'Phone number and OTP are required',
      }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found',
      }, { status: 404 });
    }

    const isValid = await OTPService.verifyOTP(phone, otp);

    if (!isValid) {
      return NextResponse.json({
        success: false,
        message: 'Invalid or expired OTP',
      }, { status: 400 });
    }

    // Generate JWT token
    const token = JWTService.generateToken(user.id, user.phone);

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
      token,
      user: {
        id: user.id,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Error in verify OTP:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to verify OTP',
    }, { status: 500 });
  }
}