import { NextResponse } from 'next/server';
import { sendOTP } from '@/lib/emailService';

// Store OTPs temporarily
const otpStorage = new Map();

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request) {
  console.log('=== OTP API CALLED ===');
  
  try {
    const body = await request.json();
    console.log('Request body:', body);
    
    const { email } = body;

    if (!email) {
      console.log('Missing email');
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    console.log('Processing OTP for:', email);

    // Generate OTP
    const otp = generateOTP();

    // Send OTP via email
    let emailResult;
    try {
      emailResult = await sendOTP(email, otp);
      console.log('OTP email sent successfully:', emailResult);
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      // For now, let's continue even if email fails (for testing)
      console.log('Email sending failed, but continuing for testing...');
      
      // Store OTP anyway for testing
      const expiresAt = Date.now() + 10 * 60 * 1000;
      otpStorage.set(email, {
        otp,
        expiresAt,
        attempts: 0
      });

      // Return success with debug info
      return NextResponse.json({ 
        success: true, 
        message: 'OTP generated successfully (email may not have been sent)',
        otp: otp, // Include OTP for debugging
        debug: true
      });
    }

    // Store OTP temporarily (10 minutes expiry)
    const expiresAt = Date.now() + 10 * 60 * 1000;
    otpStorage.set(email, {
      otp,
      expiresAt,
      attempts: 0
    });

    console.log('OTP stored:', { email, otp, expiresAt });

    // Log to server console (terminal) - for debugging only
    console.log(`📧 OTP for ${email}: ${otp}`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'OTP sent successfully',
      debug: process.env.NODE_ENV === 'development'
    });

  } catch (error) {
    console.error('Error in OTP API:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const { email, otp } = await request.json();
    console.log('Verifying OTP for:', email, 'code:', otp);

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    const storedData = otpStorage.get(email);

    if (!storedData) {
      return NextResponse.json(
        { error: 'OTP not found or expired' },
        { status: 404 }
      );
    }

    if (Date.now() > storedData.expiresAt) {
      otpStorage.delete(email);
      return NextResponse.json(
        { error: 'OTP has expired' },
        { status: 400 }
      );
    }

    if (storedData.attempts >= 5) {
      otpStorage.delete(email);
      return NextResponse.json(
        { error: 'Too many attempts' },
        { status: 400 }
      );
    }

    if (storedData.otp === otp) {
      otpStorage.delete(email);
      return NextResponse.json({ 
        success: true, 
        message: 'OTP verified successfully' 
      });
    } else {
      storedData.attempts++;
      otpStorage.set(email, storedData);
      return NextResponse.json(
        { error: 'Invalid OTP' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error in OTP verification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}