"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth, db, googleProvider } from "@/lib/firebaseClient";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import "./login.css";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const redirectParam = params.get("redirect");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [buttonText, setButtonText] = useState(
    <>
      <span className="material-symbols-outlined">login</span> Log In
    </>
  );
  const [googleButtonText, setGoogleButtonText] = useState(
    <>
      <img src="/google.svg" width="20px" alt="" />
      Continue with Google
    </>
  );
  const [success, setSuccess] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);

  // Load saved email and password from localStorage if "Remember Me" was checked
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    const savedPassword = localStorage.getItem("rememberedPassword");
    
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
    if (savedPassword) {
      setPassword(savedPassword);
    }
  }, []);

  // if already logged in, auto redirect to homepage
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        if (redirectParam) {
          router.replace(redirectParam);
        } else {
          const redirectTo = redirectParam || "/";
          window.location.href = redirectTo;
        }
      }
    });
    return () => unsubscribe();
  }, [router, redirectParam]);

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      setButtonText(
        <>
          <span className="material-symbols-outlined">hourglass_empty</span>{" "}
          Logging in...
        </>
      );

      await setPersistence(
        auth, 
        rememberMe ? browserLocalPersistence : browserSessionPersistence
      );

      const { user } = await signInWithEmailAndPassword(auth, email, password);

      // Save email and password to localStorage if "Remember Me" is checked
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
        localStorage.setItem("rememberedPassword", password);
      } else {
        // Remove from localStorage if not checked
        localStorage.removeItem("rememberedEmail");
        localStorage.removeItem("rememberedPassword");
      }

      setSuccess(true);
      setButtonText(
        <>
          <span className="material-symbols-outlined">check_circle</span>{" "}
          Success!
        </>
      );

      setTimeout(() => {
        if (redirectParam) {
          router.replace(redirectParam);
        } else {
          const redirectTo = redirectParam || "/";
          window.location.href = redirectTo;
        }
      }, 1500);
    } catch (err) {
      console.error(err);
      
      let errorMessage = "Invalid email or password";
      if (err.code === 'auth/invalid-credential') {
        errorMessage = "Invalid email or password";
      } else if (err.code === 'auth/user-not-found') {
        errorMessage = "No account found with this email";
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = "Too many failed attempts. Please try again later.";
      } else if (err.code === 'auth/user-disabled') {
        errorMessage = "This account has been disabled";
      }
      
      setError(errorMessage);
      setButtonText(
        <>
          <span className="material-symbols-outlined">login</span> Log In
        </>
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    setGoogleButtonText(
      <>
        <span className="material-symbols-outlined">hourglass_empty</span>{" "}
        Connecting...
      </>
    );
    try {
      await setPersistence(
        auth, 
        rememberMe ? browserLocalPersistence : browserSessionPersistence
      );

      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      await setDoc(
        doc(db, "users", user.uid),
        {
          uid: user.uid,
          email: user.email,
          username: user.displayName || user.email.split("@")[0],
          photoURL: user.photoURL || null,
          provider: "google",
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      setSuccess(true);
      setGoogleButtonText(
        <>
          <span className="material-symbols-outlined">check_circle</span>{" "}
          Success!
        </>
      );

      setTimeout(() => {
        if (redirectParam) {
          router.replace(redirectParam);
        } else {
          const redirectTo = redirectParam || "/";
          window.location.href = redirectTo;
        }
      }, 1500);
    } catch (err) {
      console.error(err);
      setError("Google sign-in failed");
      setGoogleButtonText(
        <>
          <img src="/google.svg" width="20px" alt="" />
          Continue with Google
        </>
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError("");
    setForgotPasswordSuccess(false);

    if (!validateEmail(forgotPasswordEmail)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setForgotPasswordLoading(true);
      
      await sendPasswordResetEmail(auth, forgotPasswordEmail);
      
      setForgotPasswordSuccess(true);
      setError("");
      
      setTimeout(() => {
        setShowForgotPassword(false);
        setForgotPasswordEmail("");
        setForgotPasswordSuccess(false);
      }, 3000);
      
    } catch (err) {
      console.error(err);
      
      let errorMessage = "Failed to send reset email";
      if (err.code === 'auth/user-not-found') {
        errorMessage = "No account found with this email";
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = "Invalid email address";
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = "Too many attempts. Please try again later.";
      }
      
      setError(errorMessage);
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  return (
    <div className={`login-container ${showForgotPassword ? 'modal-open' : ''}`}>
      <div className="login-header">
        <div className="logo-container">
          <img src="/looma-logo.png" alt="Looma Logo" />
        </div>
        <h1>Welcome Back!</h1>
        <p>Login or create an account to continue.</p>
      </div>

      <div className="login-form-container">
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="input-container">
              <span className="material-symbols-outlined input-icon">mail</span>
              <input
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={error.toLowerCase().includes("email") ? "input-error" : ""}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-container">
              <span className="material-symbols-outlined input-icon">lock</span>
              <input
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={error.toLowerCase().includes("password") ? "input-error" : ""}
              />
            </div>
          </div>

          <div className="login-options">
            <label className="remember-me">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="checkmark"></span>
              Remember me
            </label>
            
            <button 
              type="button" 
              className="forgot-password-btn"
              onClick={() => setShowForgotPassword(true)}
            >
              Forgot password?
            </button>
          </div>

          {error && (
            <p className="error-message">{error}</p>
          )}
          {success && (
            <p className="success-message">
              <span className="material-symbols-outlined">check_circle</span>
              Login successful! Redirecting...
            </p>
          )}

          <button type="submit" className="login-button" disabled={loading}>
            {buttonText}
          </button>

          <div className="divider">
            <span>Or continue with</span>
          </div>

          <button
            type="button"
            className="google-button"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            {googleButtonText}
          </button>
        </form>

        <p className="signup-link">
          Don't have an account? <a href="/signup">Sign up</a>
        </p>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="modal-overlay">
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Reset Your Password</h2>
              <button 
                className="modal-close"
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotPasswordEmail("");
                  setError("");
                  setForgotPasswordSuccess(false);
                }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleForgotPassword}>
              <div className="form-group">
                <label htmlFor="forgot-email">Enter your email address</label>
                <div className="input-container">
                  <span className="material-symbols-outlined input-icon">mail</span>
                  <input
                    type="email"
                    id="forgot-email"
                    placeholder="you@example.com"
                    required
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    disabled={forgotPasswordLoading}
                  />
                </div>
              </div>

              {forgotPasswordSuccess ? (
                <div className="success-message">
                  <span className="material-symbols-outlined">check_circle</span>
                  <p>Password reset email sent! Check your inbox.</p>
                </div>
              ) : (
                <div className="modal-actions">
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setForgotPasswordEmail("");
                      setError("");
                    }}
                    disabled={forgotPasswordLoading}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary"
                    disabled={forgotPasswordLoading || !forgotPasswordEmail}
                  >
                    {forgotPasswordLoading ? (
                      <>
                        <span className="material-symbols-outlined spin">autorenew</span>
                        Sending...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined">send</span>
                        Send Reset Link
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}