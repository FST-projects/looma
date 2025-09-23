// app/api/test-smtp/route.js
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Dynamically import nodemailer
    const nodemailer = await import('nodemailer');
    
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    await transporter.verify();
    
    return NextResponse.json({ 
      success: true, 
      message: 'SMTP connection successful',
      config: {
        host: process.env.SMTP_HOST,
        user: process.env.SMTP_USER ? 'Configured' : 'Missing',
        port: process.env.SMTP_PORT
      }
    });
  } catch (error) {
    console.error('SMTP test error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'SMTP connection failed',
      error: error.message,
      config: {
        host: process.env.SMTP_HOST,
        user: process.env.SMTP_USER ? 'Configured' : 'Missing',
        port: process.env.SMTP_PORT
      }
    }, { status: 500 });
  }
}