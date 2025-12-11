import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, User, Lock, Sun, Moon, ArrowRight, ShieldCheck, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import Loader from '../components/Loader';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // 2FA State
  const [verificationId, setVerificationId] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState('');
  
  const { login, setUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Polling for Verification Status
  useEffect(() => {
    let interval;
    if (isPolling && verificationId && !showOtpInput) {
      interval = setInterval(async () => {
        try {
          const res = await axios.get(API_ENDPOINTS.authStatus, {
            params: { verificationId }
          });
          
          if (res.data.status === 'email_verified') {
            setShowOtpInput(true);
            // Don't stop polling completely if you want to detect denial? 
            // Actually, once email is verified, we wait for user to input OTP.
            // So we can stop polling.
            clearInterval(interval);
          } else if (res.data.status === 'denied') {
            clearInterval(interval);
            setIsPolling(false);
            setShowOtpInput(false);
            setError("Login attempt was denied.");
            setVerificationId(null);
          }
        } catch (err) {
            console.error("Polling error", err);
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isPolling, verificationId, showOtpInput]);

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    try {
        const res = await axios.post(API_ENDPOINTS.verifyOtp, {
            verificationId,
            otp
        });
        
        if (res.data.success) {
            localStorage.setItem("spsi_user", JSON.stringify(res.data.user));
            setUser(res.data.user);
            setIsPolling(false);
            setShowOtpInput(false);
            navigate('/');
        } else {
            setError(res.data.message || "Invalid OTP");
        }
    } catch (err) {
        setError("Failed to verify OTP");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Quick local check before hitting server
    if (!email || !password) {
        setError("Please fill in all fields");
        return;
    }

    setIsLoading(true);
    try {
      const result = await login(email, password);
      
      if (result.requireVerification) {
          setVerificationId(result.verificationId);
          setIsPolling(true);
          setShowOtpInput(false);
          setOtp('');
      } else if (result.success) {
          navigate('/');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex overflow-hidden bg-white dark:bg-slate-950 transition-colors duration-500 relative">
      {isLoading && <Loader text="Signing in..." />}
      
      {/* Verification Modal */}
      <AnimatePresence>
        {isPolling && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4"
            >
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center"
                >
                    {!showOtpInput ? (
                        <>
                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                <ShieldCheck className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-pulse" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Step 1: Email Approval</h3>
                            <p className="text-slate-600 dark:text-slate-400 mb-6">
                                We've sent a verification link to your email. Please click <strong>"Yes, It's Me"</strong> to proceed.
                            </p>
                            <div className="flex justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Lock className="w-8 h-8 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Step 2: Enter OTP</h3>
                            <p className="text-slate-600 dark:text-slate-400 mb-6">
                                Enter the 6-digit code sent to your email and mobile.
                            </p>
                            <form onSubmit={handleOtpSubmit} className="space-y-4">
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => {
                                        setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                                        if (error === "Invalid OTP" || error === "Failed to verify OTP") {
                                            setError(''); // Clear OTP error on input change
                                        }
                                    }}
                                    className="w-full text-center text-2xl tracking-widest py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white font-mono"
                                    placeholder="000000"
                                    maxLength="6"
                                    autoFocus
                                />
                                {error && (error === "Invalid OTP" || error === "Failed to verify OTP") && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-2 text-red-600 dark:text-red-400 text-sm font-medium"
                                    >
                                        <XCircle className="inline-block w-4 h-4 mr-1" /> {error}. Please try again.
                                    </motion.div>
                                )}
                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition-colors"
                                >
                                    Verify & Login
                                </button>
                            </form>
                        </>
                    )}

                    <button 
                        onClick={() => { setIsPolling(false); setVerificationId(null); setShowOtpInput(false); }}
                        className="mt-6 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline"
                    >
                        Cancel Login
                    </button>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Left Side - Artistic/Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 via-indigo-900/90 to-slate-900/90"></div>
        
        {/* Abstract Shapes */}
        <motion.div 
            animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 90, 0], 
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-pink-500/30 rounded-full blur-3xl"
        />
        <motion.div 
             animate={{ 
                scale: [1, 1.3, 1],
                x: [0, 100, 0],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px]" 
        />

        <div className="relative z-10 p-12 text-white max-w-xl">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <div className="h-16 w-16 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-center mb-8 shadow-xl">
                    <span className="text-3xl">💎</span>
                </div>
                <h1 className="text-5xl font-bold mb-6 leading-tight tracking-tight">
                    SPSI <br/> 
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-teal-200">
                        Management System
                    </span>
                </h1>
                <p className="text-lg text-blue-100/80 leading-relaxed mb-8">
                    Experience the next generation of workflow management. 
                    Secure, fast, and beautifully designed for professionals.
                </p>

                <div className="flex items-center gap-4 text-sm font-medium text-blue-200/60">
                    <div className="flex -space-x-3">
                        {[1,2,3].map(i => (
                            <div key={i} className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs">
                                <User size={12} />
                            </div>
                        ))}
                    </div>
                    <span>Trusted by teams everywhere.</span>
                </div>
            </motion.div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-24 relative">
         {/* Theme Toggle */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={toggleTheme}
          className="absolute top-6 right-6 p-3 rounded-full bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </motion.button>

        <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md space-y-8"
        >
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Welcome Back</h2>
            <p className="mt-2 text-slate-500 dark:text-slate-400">Please enter your details to sign in.</p>
          </div>

          {error && (
             <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-2"
            >
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                {error}
             </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Email Address</label>
              <div className="relative group">
                 <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                 <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-500 transition-all outline-none dark:text-white placeholder:text-slate-400 font-medium"
                    placeholder="Enter your email"
                    required
                 />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
              </div>
              <div className="relative group">
                 <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                 <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-500 transition-all outline-none dark:text-white placeholder:text-slate-400 font-medium"
                    placeholder="••••••••"
                    required
                 />
                 <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                 >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                 </button>
              </div>
            </div>

            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all"
            >
                Sign In
                <ArrowRight size={18} />
            </motion.button>
          </form>
          
          <p className="text-center text-sm text-slate-400 dark:text-slate-500 mt-8">
            &copy; {new Date().getFullYear()} SPSI Inc. All rights reserved.
          </p>
        </motion.div>
      </div>
    </div>
  );
}