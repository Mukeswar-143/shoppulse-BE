import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { OTPService } from '@/lib/services/otp.service';
import { SendOTPRequest, AuthResponse } from '@/lib/types/auth.types';

const prisma = new PrismaClient();

export async function POST(req: NextRequest): Promise<NextResponse<AuthResponse>> {
  try {
    const body: SendOTPRequest = await req.json();
    const { phone } = body;

    if (!phone) {
      return NextResponse.json({
        success: false,
        message: 'Phone number is required',
      }, { status: 400 });
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          phone,
          userType: 'USER',
        },
      });
    }

    // Generate and send OTP
    await OTPService.createOTP(phone);

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
    });
  } catch (error) {
    console.error('Error in send OTP:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to send OTP',
    }, { status: 500 });
  }
}