// lib/emailService.js
import nodemailer from 'nodemailer';

let transporter;

const initializeTransporter = () => {
  if (transporter) return transporter;

  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    throw new Error('SMTP configuration missing');
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
  });

  transporter.verify(function(error, success) {
    if (error) {
      console.error('SMTP transporter verification failed:', error);
    } else {
      console.log('SMTP transporter is ready to send messages');
    }
  });

  return transporter;
};

export const sendOTP = async (email, otp) => {
  try {
    console.log('Attempting to send OTP to:', email);
    
    const mailTransporter = initializeTransporter();
    
    // Your Google Drive logo URL (converted to direct link)
    const logoUrlWhite = "https://drive.google.com/uc?export=view&id=1pkNMJkd_kmcaCBKxKPdPYmVCZq6CWan4";
    const logoUrlBlack = "https://drive.google.com/uc?export=view&id=17TnXQJtxP67FbOCdnzfVw8GmE03UQkub";

    const mailOptions = {
      from: {
        name: process.env.SMTP_FROM_NAME || 'Looma',
        address: process.env.SMTP_USER
      },
      to: email,
      subject: 'Your Looma Verification Code',
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Looma Verification Code</title>
    <link href="https://fonts.googleapis.com/css2?family=Exo+2:ital,wght@0,100..900;1,100..900&family=Exo:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: "Exo 2", sans-serif;
        }
        
        body {
            font-family: "Exo 2", sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
            min-height: 100vh;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
        
        .email-header {
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        
        .logo {
            width: 120px;
            height: auto;
            margin-bottom: 20px;
            display: inline-block;
            border-radius: 8px;
        }
        
        .logo-fallback {
            width: 120px;
            height: 40px;
            background: #ffffff;
            border-radius: 8px;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 24px;
            color: #2563eb;
        }
        
        .email-header h1 {
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 10px;
            letter-spacing: -0.5px;
        }
        
        .email-header p {
            font-size: 16px;
            opacity: 0.9;
            font-weight: 300;
        }
        
        .email-content {
            padding: 40px 30px;
        }
        
        .greeting {
            font-size: 18px;
            color: #374151;
            margin-bottom: 20px;
            font-weight: 500;
        }
        
        .instructions {
            font-size: 16px;
            color: #6b7280;
            line-height: 1.6;
            margin-bottom: 30px;
        }
        
        .otp-container {
            background: #f8fafc;
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
        }
        
        .otp-label {
            font-size: 14px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 10px;
            font-weight: 500;
        }
        
        .otp-code {
            font-size: 42px;
            font-weight: 700;
            color: #2563eb;
            letter-spacing: 8px;
            background: #ffffff;
            padding: 15px;
            border-radius: 8px;
            display: inline-block;
            min-width: 280px;
            border: 2px dashed #dbeafe;
        }
        
        .expiry-notice {
            background: #fffbeb;
            border: 1px solid #fed7aa;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            text-align: center;
            font-size: 14px;
            color: #92400e;
        }
        
        .expiry-notice .icon {
            font-size: 20px;
            margin-right: 8px;
            vertical-align: middle;
        }
        
        .security-note {
            background: #f0f9ff;
            border: 1px solid #bae6fd;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            font-size: 14px;
            color: #0369a1;
        }
        
        .button-container {
            text-align: center;
            margin: 30px 0;
        }
        
        .support-button {
            display: inline-block;
            background: #2563eb;
            color: white;
            text-decoration: none;
            padding: 12px 30px;
            border-radius: 8px;
            font-weight: 500;
            transition: all 0.3s ease;
        }
        
        .support-button:hover {
            background: #1d4ed8;
            transform: translateY(-2px);
        }
        
        .email-footer {
            background: #f8fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        
        .footer-logo {
            width: 100px;
            height: auto;
            margin-bottom: 20px;
            opacity: 0.7;
            border-radius: 6px;
        }
        
        .footer-text {
            font-size: 14px;
            color: #64748b;
            line-height: 1.5;
            margin-bottom: 15px;
        }
        
        .social-links {
            margin: 20px 0;
        }
        
        .social-link {
            display: inline-block;
            margin: 0 8px;
            color: #64748b;
            text-decoration: none;
            font-size: 13px;
            transition: color 0.3s ease;
        }
        
        .social-link:hover {
            color: #2563eb;
        }
        
        .copyright {
            font-size: 12px;
            color: #94a3b8;
            margin-top: 20px;
            line-height: 1.4;
        }
        
        @media (max-width: 600px) {
            .email-content {
                padding: 30px 20px;
            }
            
            .email-header {
                padding: 30px 20px;
            }
            
            .otp-code {
                font-size: 32px;
                letter-spacing: 6px;
                min-width: 240px;
                padding: 12px;
            }
            
            .logo {
                width: 100px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header with your actual logo -->
        <div class="email-header">
            <img src="${logoUrlWhite}" alt="Looma" class="logo" onerror="this.style.display='none'; document.querySelector('.logo-fallback').style.display='flex';">
            <div class="logo-fallback" style="display: none;">LOOMA</div>
            <h1>Verify Your Email</h1>
            <p>Complete your account setup with the code below</p>
        </div>
        
        <!-- Content -->
        <div class="email-content">
            <p class="greeting">Hello,</p>
            <p class="instructions">
                Thank you for choosing Looma! To complete your registration and start your journey with us, 
                please use the following verification code:
            </p>
            
            <div class="otp-container">
                <div class="otp-label">Verification Code</div>
                <div class="otp-code">${otp}</div>
            </div>
            
            <div class="expiry-notice">
                <span class="icon">⏰</span>
                This code will expire in <strong>10 minutes</strong> for security reasons.
            </div>
            
            <div class="security-note">
                <strong>Security Tip:</strong> Never share this code with anyone. Looma will never ask for your verification code.
            </div>
        </div>
        
        <!-- Footer -->
        <div class="email-footer">
            <img src="${logoUrlBlack}" alt="Looma" class="footer-logo" onerror="this.style.display='none';">
            
            <p class="footer-text">
                Looma - Your premier destination for technology and gaming insights, reviews, and news.
            </p>
            
           
            
            <p class="copyright">
                © 2025 Looma. All rights reserved.<br>
                This is an automated message, please do not reply to this email.<br>
            </p>
        </div>
    </div>
    
    <script>
        // Fallback handling for logo images
        document.addEventListener('DOMContentLoaded', function() {
            const logos = document.querySelectorAll('img.logo, img.footer-logo');
            logos.forEach(logo => {
                logo.onerror = function() {
                    this.style.display = 'none';
                };
            });
        });
    </script>
</body>
</html>
      `,
      text: `
VERIFY YOUR LOOMA ACCOUNT

Hello,

Thank you for choosing Looma! To complete your registration, please use the following verification code:

Verification Code: ${otp}

This code will expire in 10 minutes for security reasons.

Security Tip: Never share this code with anyone. Looma will never ask for your verification code.

If you need help, contact our support team at ${process.env.SUPPORT_EMAIL || 'support@looma.com'}

© 2024 Looma. All rights reserved.
This is an automated message, please do not reply to this email.
      `
    };

    console.log('Sending email with options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });

    const result = await mailTransporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('Error sending OTP email:', error);
    
    if (error.code) {
      console.error('Error code:', error.code);
    }
    if (error.response) {
      console.error('SMTP response:', error.response);
    }
    
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
};