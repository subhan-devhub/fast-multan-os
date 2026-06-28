import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase/config';
import { stripHtml, validateLength, validateInputFormat } from '../utils/validation';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [lockoutTimeLeft, setLockoutTimeLeft] = useState(0);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Forgot password states
  const [modalOpen, setModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    const sanitizedResetEmail = stripHtml(resetEmail.trim());
    const resetEmailLower = sanitizedResetEmail.toLowerCase();

    if (!validateLength(sanitizedResetEmail, 500)) {
      setResetError('Invalid input format.');
      return;
    }

    if (!validateInputFormat(sanitizedResetEmail)) {
      setResetError('Invalid input format.');
      return;
    }

    // Validate email format strictly (accept student format on any campus subdomain, or faculty/admin)
    const isValidStudent = /^[a-z]\d{6}@[a-z]{3}\.nu\.edu\.pk$/.test(resetEmailLower);
    const isValidFaculty = /^[a-z0-9._%+-]+@nu\.edu\.pk$/.test(resetEmailLower);

    if (!isValidStudent && !isValidFaculty) {
      setResetError('Please enter your FAST Multan university email');
      return;
    }

    try {
      setResetLoading(true);
      setResetError('');
      setResetSuccess(false);

      await sendPasswordResetEmail(auth, resetEmailLower);
      setResetSuccess(true);
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        setResetError('No account found with this email');
      } else if (err.code === 'auth/invalid-email') {
        setResetError('Please enter your FAST Multan university email');
      } else if (err.code === 'auth/too-many-requests') {
        setResetError('Too many attempts. Try again later');
      } else {
        setResetError(err.message || 'An error occurred. Please try again.');
      }
    } finally {
      setResetLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Check for active lockout when email changes
  useEffect(() => {
    if (email) {
      const emailLower = email.toLowerCase();
      const lockoutUntil = localStorage.getItem(`lockout_until_${emailLower}`);
      if (lockoutUntil) {
        const timeLeft = Math.ceil((parseInt(lockoutUntil) - Date.now()) / 1000);
        if (timeLeft > 0) {
          setLockoutTimeLeft(timeLeft);
          setError(`Too many attempts. Please try again in ${formatTime(timeLeft)} minutes.`);
          return;
        }
      }
    }
    setLockoutTimeLeft(0);
    setError((prev) => (prev && prev.includes('Too many attempts') ? '' : prev));
  }, [email]);

  // Handle countdown timer for lockout
  useEffect(() => {
    if (lockoutTimeLeft <= 0) return;
    const timer = setInterval(() => {
      setLockoutTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setError('');
          return 0;
        }
        const nextTime = prev - 1;
        setError(`Too many attempts. Please try again in ${formatTime(nextTime)} minutes.`);
        return nextTime;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutTimeLeft]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const sanitizedEmail = stripHtml(email.trim());
    const sanitizedPassword = stripHtml(password);
    const emailLower = sanitizedEmail.toLowerCase();

    // Length check
    if (!validateLength(sanitizedEmail, 500) || !validateLength(sanitizedPassword, 500)) {
      setError('Invalid input format.');
      return;
    }

    // Malformed check
    if (!validateInputFormat(sanitizedEmail) || !validateInputFormat(sanitizedPassword)) {
      setError('Invalid input format.');
      return;
    }

    // Check if currently locked out
    const lockoutUntil = localStorage.getItem(`lockout_until_${emailLower}`);
    if (lockoutUntil) {
      const timeLeft = Math.ceil((parseInt(lockoutUntil) - Date.now()) / 1000);
      if (timeLeft > 0) {
        setError(`Too many attempts. Please try again in ${formatTime(timeLeft)} minutes.`);
        setLockoutTimeLeft(timeLeft);
        return;
      }
    }

    // Validate email format strictly
    let isEmailValid = false;
    if (/^[a-z]\d{6}@[a-z]{3}\.nu\.edu\.pk$/.test(emailLower)) {
      isEmailValid = true;
    } else if (/^[a-z0-9._%+-]+@nu\.edu\.pk$/.test(emailLower)) {
      isEmailValid = true;
    }
    
    if (!isEmailValid) {
      setError('Incorrect email or password.');
      return;
    }

    // Password character limit check
    if (sanitizedPassword.length < 6 || sanitizedPassword.length > 30) {
      setError('Password must be between 6 and 30 characters.');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await login(sanitizedEmail, sanitizedPassword);
      
      // Clear attempts on successful sign-in
      localStorage.removeItem(`login_attempts_${emailLower}`);
      localStorage.removeItem(`lockout_until_${emailLower}`);
      localStorage.removeItem(`attempts_start_${emailLower}`);
      
      navigate('/dashboard');
    } catch (err) {
      // Manage sliding 15-minute window for failed attempts
      const now = Date.now();
      let attempts = parseInt(localStorage.getItem(`login_attempts_${emailLower}`) || '0');
      let attemptsStartTime = parseInt(localStorage.getItem(`attempts_start_${emailLower}`) || '0');

      if (!attemptsStartTime || (now - attemptsStartTime > 15 * 60 * 1000)) {
        attempts = 1;
        localStorage.setItem(`attempts_start_${emailLower}`, now.toString());
      } else {
        attempts += 1;
      }
      localStorage.setItem(`login_attempts_${emailLower}`, attempts.toString());
      
      if (attempts >= 5) {
        const lockoutUntilTime = now + 15 * 60 * 1000;
        localStorage.setItem(`lockout_until_${emailLower}`, lockoutUntilTime.toString());
        setLockoutTimeLeft(15 * 60); // 15 minutes lockout
        setError('Too many attempts. Please try again in 15:00 minutes.');
      } else {
        // Generic error message
        setError('Incorrect email or password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EEF2F6] relative flex items-center justify-center px-4 overflow-hidden">
      {/* Background Aurora Glow Effects */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-blue-400/10 to-indigo-400/10 blur-[120px] pointer-events-none animate-pulse duration-[8000ms]"></div>
      <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-purple-400/8 to-pink-400/8 blur-[130px] pointer-events-none animate-pulse duration-[10000ms]"></div>

      {/* Centered card container */}
      <div className="max-w-md w-full bg-white/60 backdrop-blur-md border border-white/50 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-8 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
              FAST Multan OS
            </span>
          </h1>
          <p className="text-slate-500 text-sm">Sign in to your account</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm font-medium animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/90 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm"
              placeholder="m25____@mtn.nu.edu.pk"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="password" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="text-xs text-blue-600 hover:text-blue-500 hover:underline font-semibold"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                maxLength={30}
                className="w-full px-4 py-3 bg-white/90 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm pr-11"
                placeholder="Enter password (6-30 chars)"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || lockoutTimeLeft > 0}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-3 rounded-xl transition-all duration-300 disabled:opacity-50 shadow-[0_4px_12px_rgba(37,99,235,0.15)] text-sm mt-2"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Signing in...
              </span>
            ) : lockoutTimeLeft > 0 ? (
              `Locked Out (${formatTime(lockoutTimeLeft)})`
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-500 text-sm">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-600 hover:text-blue-500 font-semibold transition-colors">
              Sign Up
            </Link>
          </p>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in">
          <div className="bg-white/95 border border-slate-200/60 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] p-8 max-w-md w-full m-4 relative text-slate-800">
            <button
              onClick={() => {
                setModalOpen(false);
                setResetSuccess(false);
                setResetError('');
                setResetEmail('');
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {!resetSuccess ? (
              <>
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 mb-2">
                    Reset Your Password
                  </h2>
                  <p className="text-sm text-slate-500">
                    Enter your university email and we'll send you a reset link
                  </p>
                </div>

                {resetError && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm font-medium">
                    {resetError}
                  </div>
                )}

                <form onSubmit={handleResetSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="resetEmail" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                      Email Address
                    </label>
                    <input
                      id="resetEmail"
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-white/90 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm"
                      placeholder="m25____@mtn.nu.edu.pk"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-3 rounded-xl transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                  >
                    {resetLoading ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      'Send Reset Link'
                    )}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-6">
                <div className="flex items-center justify-center w-12 h-12 bg-green-500/10 border border-green-500/20 rounded-full mx-auto mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Reset link sent!</h3>
                <div className="text-sm text-slate-500 space-y-2 mb-6">
                  <p>Check your email inbox and spam folder</p>
                  <p className="font-semibold text-blue-600">Link expires in 1 hour</p>
                </div>
                <button
                  onClick={() => {
                    setModalOpen(false);
                    setResetSuccess(false);
                    setResetEmail('');
                  }}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-3 rounded-xl transition-all duration-300 text-sm"
                >
                  Close
                </button>
              </div>
            )}

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => {
                  setModalOpen(false);
                  setResetSuccess(false);
                  setResetError('');
                  setResetEmail('');
                }}
                className="text-sm text-blue-600 hover:text-blue-500 hover:underline font-semibold"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignIn;
