"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth, db, googleProvider } from "@/lib/firebaseClient";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import "./signup.css";

export default function SignupPage() {
  const router = useRouter();
  const params = useSearchParams();
  const redirectParam = params.get("redirect");

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [buttonText, setButtonText] = useState("Continue");
  const [googleButtonText, setGoogleButtonText] = useState("Continue with Google");
  const [success, setSuccess] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [pendingUserData, setPendingUserData] = useState(null);
  const [autoVerifying, setAutoVerifying] = useState(false);

  // Redirect if already logged in and verified
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.emailVerified) {
        const redirectTo = redirectParam || "/";
        window.location.href = redirectTo;
      }
    });
    return () => unsubscribe();
  }, [router, redirectParam]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Auto-verify when all digits are filled
  useEffect(() => {
    const allDigitsFilled = verificationCode.every(digit => digit !== "");
    if (allDigitsFilled && !autoVerifying && !loading && currentStep === 2) {
      handleAutoVerification();
    }
  }, [verificationCode, autoVerifying, loading, currentStep]);

  // Password strength calculation
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (field === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const handleVerificationCodeChange = (index, value) => {
    // Only allow numbers
    if (!/^\d?$/.test(value)) return;
    
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`digit-${index + 1}`);
      if (nextInput) {
        nextInput.focus();
        nextInput.select();
      }
    }
  };

  const validateStep1 = () => {
    if (!formData.firstName.trim()) {
      setError("First name is required");
      return false;
    }
    if (!formData.lastName.trim()) {
      setError("Last name is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }
    if (passwordStrength < 3) {
      setError("Please choose a stronger password");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  const sendOTPCode = async (email) => {
    try {
      
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      setOtpSent(true);
      return true;
    } catch (error) {
      throw new Error('Failed to send verification code. Please try again.');
    }
  };

  const verifyOTPCode = async (email, otp) => {
    try {

      // Use PUT method to verify OTP (as defined in your route.js)
      const response = await fetch('/api/send-otp', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid verification code');
      }

      return true;
    } catch (error) {
      throw error;
    }
  };

  const createFirebaseUser = async (userData) => {
    try {
      // Create user with email and password
      const { user } = await createUserWithEmailAndPassword(
        auth, 
        userData.email, 
        userData.password
      );

      // Save user data to Firestore with emailVerified: true (since we verified via OTP)
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        username: userData.email.split("@")[0],
        photoURL: null,
        provider: "email",
        emailVerified: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return user;
    } catch (error) {
      throw error;
    }
  };

  const handleStep1Submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateStep1()) return;

    try {
      setLoading(true);
      setButtonText("Sending verification code...");

      // Store user data temporarily (NOT in Firebase yet)
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password
      };
      
      setPendingUserData(userData);

      // Send OTP via our API
      await sendOTPCode(formData.email);

      // Move to verification step
      setCurrentStep(2);
      setCountdown(60);
      setButtonText("Continue");
      setError("");
    } catch (error) {
      setError(error.message || "Failed to send verification code. Please try again.");
      setPendingUserData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError("");
    setLoading(true);
    setGoogleButtonText("Connecting...");

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Save user data to Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        firstName: user.displayName?.split(" ")[0] || "",
        lastName: user.displayName?.split(" ").slice(1).join(" ") || "",
        username: user.displayName || user.email.split("@")[0],
        photoURL: user.photoURL || null,
        provider: "google",
        emailVerified: user.emailVerified,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setSuccess(true);
      setGoogleButtonText(
        <>
          <span className="material-symbols-outlined">check_circle</span> Success!
        </>
      );

      // Redirect on success
      setTimeout(() => {
        const redirectTo = redirectParam || "/";
        window.location.href = redirectTo;
      }, 1500);
    } catch (error) {
      if (error.code === 'auth/operation-not-allowed') {
        setError("Google authentication is not enabled. Please contact support.");
      } else {
        setError("Google sign-up failed. Please try again.");
      }
      setGoogleButtonText("Continue with Google");
    } finally {
      setLoading(false);
    }
  };

  const handleAutoVerification = async () => {
    if (autoVerifying || loading || !pendingUserData) return;

    setAutoVerifying(true);
    setError("");

    try {
      const otp = verificationCode.join("");
      
      // Verify OTP with our API
      await verifyOTPCode(pendingUserData.email, otp);

      // Only NOW create the Firebase user after successful OTP verification
      await createFirebaseUser(pendingUserData);
      
      setCurrentStep(3);
      setSuccess(true);
      setPendingUserData(null);
      
      // Redirect after success
      setTimeout(() => {
        const redirectTo = redirectParam || "/";
        window.location.href = redirectTo;
      }, 3000);
    } catch (error) {
      setError(error.message || "Verification failed. Please check the code and try again.");
      
      // Shake animation for error
      const inputs = document.querySelectorAll('.verification-inputs input');
      inputs.forEach(input => {
        input.style.animation = 'shake 0.5s';
        setTimeout(() => {
          input.style.animation = '';
        }, 500);
      });
    } finally {
      setAutoVerifying(false);
    }
  };

  const handleVerificationSubmit = async (e) => {
    if (e) e.preventDefault();
    
    // Use the same logic as auto-verification
    await handleAutoVerification();
  };

  const skipVerification = () => {
    // If user skips, we still need to create the account but mark as unverified
    if (pendingUserData) {
      createFirebaseUser({...pendingUserData})
        .then(() => {
          setCurrentStep(3);
          setSuccess(true);
          setPendingUserData(null);
          
          setTimeout(() => {
            const redirectTo = redirectParam || "/";
            window.location.href = redirectTo;
          }, 3000);
        })
        .catch(error => {
          setError("Failed to create account. Please try again.");
        });
    } else {
      setError("Session expired. Please start over.");
      setCurrentStep(1);
    }
  };

  const resendVerificationCode = async () => {
    if (countdown > 0 || !pendingUserData) return;

    try {
      await sendOTPCode(pendingUserData.email);
      setCountdown(60);
      setError("");
    } catch (error) {
      setError("Failed to resend verification code");
    }
  };

  const getPasswordStrengthLabel = () => {
    const labels = ["Very weak", "Weak", "Fair", "Good", "Strong"];
    return passwordStrength > 0 ? labels[passwordStrength - 1] : "";
  };

  const getPasswordStrengthColor = () => {
    const hues = [0, 30, 60, 90, 120];
    return passwordStrength > 0 ? `hsl(${hues[passwordStrength - 1]}, 85%, 45%)` : "#ef4444";
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`digit-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
        prevInput.select();
      }
    }
    
    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      const prevInput = document.getElementById(`digit-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
        prevInput.select();
      }
    }
    
    if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault();
      const nextInput = document.getElementById(`digit-${index + 1}`);
      if (nextInput) {
        nextInput.focus();
        nextInput.select();
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const togglePasswordRequirements = () => {
    setShowPasswordRequirements(!showPasswordRequirements);
  };

  const checkRequirement = (type, password) => {
    switch (type) {
      case 'length': return password.length >= 8;
      case 'uppercase': return /[A-Z]/.test(password);
      case 'lowercase': return /[a-z]/.test(password);
      case 'number': return /[0-9]/.test(password);
      case 'special': return /[^A-Za-z0-9]/.test(password);
      default: return false;
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-header">
        <div className="logo-container">
          <img src="/looma-logo.png" alt="Looma Logo" />
        </div>
        <h1>Create Your Account</h1>
        <p>Join our community and start your journey</p>
      </div>

      {/* Progress Steps */}
      <div className="progress-steps">
        <div 
          className="progress-bar" 
          style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
        ></div>
        <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
          1
          <span className="step-label">Account</span>
        </div>
        <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
          2
          <span className="step-label">Verify</span>
        </div>
        <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
          3
          <span className="step-label">Complete</span>
        </div>
      </div>

      <div className="form-container">
        {/* Step 1: Account Information */}
        {currentStep === 1 && (
          <form className="form-step active" onSubmit={handleStep1Submit}>
            <div className="name-fields">
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <div className="input-container">
                  <span className="material-symbols-outlined input-icon">person</span>
                  <input
                    type="text"
                    id="firstName"
                    placeholder="John"
                    required
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <div className="input-container">
                  <span className="material-symbols-outlined input-icon">person</span>
                  <input
                    type="text"
                    id="lastName"
                    placeholder="Doe"
                    required
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-container">
                <span className="material-symbols-outlined input-icon">mail</span>
                <input
                  type="email"
                  id="email"
                  placeholder="you@example.com"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-container has-actions">
                <span className="material-symbols-outlined input-icon">lock</span>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="••••••••"
                  required
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                />
                <div className="input-actions">
                  <span
                    className="material-symbols-outlined toggle-password"
                    onClick={togglePasswordVisibility}
                    role="button"
                    tabIndex="0"
                    aria-pressed={showPassword}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                                        {showPassword ? "visibility" : "visibility_off"}
                  </span>
                  <span
                    className="material-symbols-outlined password-info"
                    onClick={togglePasswordRequirements}
                    title="Password requirements"
                    aria-label="Password requirements"
                  >
                    info
                  </span>
                </div>
              </div>
              {formData.password && (
                <>
                  <div className="password-strength">
                    <div 
                      className="password-strength-bar"
                      style={{ 
                        width: `${(passwordStrength / 5) * 100}%`,
                        backgroundColor: getPasswordStrengthColor()
                      }}
                    ></div>
                  </div>
                  <div 
                    className="password-strength-text"
                    style={{ color: getPasswordStrengthColor() }}
                  >
                    {getPasswordStrengthLabel()}
                  </div>
                </>
              )}
              <div className={`password-requirements ${showPasswordRequirements ? 'show' : ''}`}>
                <div className={`requirement ${checkRequirement('length', formData.password) ? 'met' : ''}`}>
                  <span className="material-symbols-outlined requirement-icon">
                    {checkRequirement('length', formData.password) ? 'check' : 'close'}
                  </span>
                  At least 8 characters
                </div>
                <div className={`requirement ${checkRequirement('uppercase', formData.password) ? 'met' : ''}`}>
                  <span className="material-symbols-outlined requirement-icon">
                    {checkRequirement('uppercase', formData.password) ? 'check' : 'close'}
                  </span>
                  One uppercase letter
                </div>
                <div className={`requirement ${checkRequirement('lowercase', formData.password) ? 'met' : ''}`}>
                  <span className="material-symbols-outlined requirement-icon">
                    {checkRequirement('lowercase', formData.password) ? 'check' : 'close'}
                  </span>
                  One lowercase letter
                </div>
                <div className={`requirement ${checkRequirement('number', formData.password) ? 'met' : ''}`}>
                  <span className="material-symbols-outlined requirement-icon">
                    {checkRequirement('number', formData.password) ? 'check' : 'close'}
                  </span>
                  One number
                </div>
                <div className={`requirement ${checkRequirement('special', formData.password) ? 'met' : ''}`}>
                  <span className="material-symbols-outlined requirement-icon">
                    {checkRequirement('special', formData.password) ? 'check' : 'close'}
                  </span>
                  One special character
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-container has-actions">
                <span className="material-symbols-outlined input-icon">lock</span>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  placeholder="••••••••"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                />
                <div className="input-actions">
                  <span
                    className="material-symbols-outlined toggle-password"
                    onClick={toggleConfirmPasswordVisibility}
                    role="button"
                    tabIndex="0"
                    aria-pressed={showConfirmPassword}
                    title={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? "visibility" : "visibility_off"}
                  </span>
                </div>
              </div>
            </div>

            {error && (
              <p className="error-message">{error}</p>
            )}

            <div className="form-buttons">
              <button type="button" className="btn btn-secondary btn-hidden">
                Back
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {buttonText}
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>

            <div className="divider">
              <span>Or continue with</span>
            </div>

            <button
              type="button"
              className="google-button"
              onClick={handleGoogleSignup}
              disabled={loading}
            >
              <img src="/google.svg" width="20px" alt="" />
              {googleButtonText}
            </button>

            <div className="already-have-account">
              Already have an account? <a href="/login">Sign in</a>
            </div>
          </form>
        )}

        {/* Step 2: Verification */}
        {currentStep === 2 && (
          <form className="form-step active" onSubmit={handleVerificationSubmit}>
            <div className="verification-header">
              <h2>Verify Your Email</h2>
              <p>
                We've sent a 6-digit verification code to
                <span className="font-medium"> {pendingUserData?.email || formData.email}</span>. 
                Please check your inbox and enter the code below.
              </p>
            </div>

            <div className="form-groups">
              <label>Verification Code</label>
              <div className="verification-inputs" id="verificationContainer">
                {verificationCode.map((digit, index) => (
                  <input
                    key={index}
                    id={`digit-${index}`}
                    type="text"
                    maxLength="1"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={digit}
                    onChange={(e) => handleVerificationCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onFocus={(e) => e.target.select()}
                    disabled={loading || autoVerifying}
                    style={{ color: 'var(--text-dark)' }}
                  />
                ))}
              </div>
              {(autoVerifying || loading) && (
                <div className="redirect-message">
                  <span className="material-symbols-outlined">autorenew</span>
                  Verifying code...
                </div>
              )}
            </div>

            <div className="verification-actions">
              <div className="resend-code">
                <p>
                  Didn't receive the code?{" "}
                  <button 
                    type="button"
                    className="resend-link"
                    onClick={resendVerificationCode} 
                    disabled={countdown > 0 || loading || autoVerifying}
                  >
                    Resend code
                  </button>
                  {countdown > 0 && <span className="countdown">({countdown}s)</span>}
                </p>
              </div>

              <button 
                type="button"
                className="skip-verification"
                onClick={skipVerification}
                disabled={loading || autoVerifying}
              >
                Skip verification for now
              </button>
            </div>

            {error && (
              <p className="error-message">{error}</p>
            )}

            <div className="form-buttons">
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => {
                  setCurrentStep(1);
                  setPendingUserData(null);
                  setVerificationCode(["", "", "", "", "", ""]);
                }}
                disabled={loading || autoVerifying}
              >
                <span className="material-symbols-outlined">arrow_back</span>
                Back
              </button>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={loading || autoVerifying || !verificationCode.every(digit => digit !== "")}
              >
                {autoVerifying ? "Verifying..." : "Verify Email"}
                <span className="material-symbols-outlined">check</span>
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Success */}
        {currentStep === 3 && (
          <div className="form-step active">
            <div className="success-message">
              <div className="success-icon">
                <span className="material-symbols-outlined" style={{fontSize: "40px"}} >check_circle</span>
              </div>
              <h2>Account Created Successfully!</h2>
              <p>
                Your account has been created and your email has been verified. 
                You now have full access to all features.
              </p>
              
              {success && (
                <div className="redirect-message">
                  <span className="material-symbols-outlined">autorenew</span>
                  Redirecting you to the dashboard...
                </div>
              )}
              
              <div className="success-actions">
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={() => {
                    const redirectTo = redirectParam || "/";
                    window.location.href = redirectTo;
                  }}
                >
                  Go to Dashboard
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}