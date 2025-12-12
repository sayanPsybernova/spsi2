import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, User, Lock, Sun, Moon, ArrowRight, ShieldCheck, XCircle, Sparkles, Zap } from 'lucide-react';
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
  const [isFocused, setIsFocused] = useState({ email: false, password: false });

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

  // Floating particles for background
  const particles = [...Array(30)].map((_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 15,
    delay: Math.random() * 5,
  }));

  return (
    <div className="min-h-screen w-full flex overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-700 relative">
      {isLoading && <Loader text="Signing in..." />}

      {/* Verification Modal */}
      <AnimatePresence>
        {isPolling && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4"
            >
                <motion.div
                    initial={{ scale: 0.8, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="relative bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-700/50 rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center overflow-hidden"
                >
                    {/* Animated gradient border */}
                    <div className="absolute inset-0 rounded-3xl p-[1px] bg-gradient-to-r from-primary-500 via-accent-500 to-primary-500 bg-[length:200%_100%] animate-gradient opacity-50" />
                    <div className="absolute inset-[1px] rounded-3xl bg-white dark:bg-slate-900" />

                    <div className="relative z-10">
                      {!showOtpInput ? (
                          <>
                              <motion.div
                                  animate={{ scale: [1, 1.1, 1] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                  className="w-20 h-20 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary-500/30"
                              >
                                  <ShieldCheck className="w-10 h-10 text-white" />
                              </motion.div>
                              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Step 1: Email Approval</h3>
                              <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm leading-relaxed">
                                  We've sent a verification link to your email. Please click <strong className="text-primary-600 dark:text-primary-400">"Yes, It's Me"</strong> to proceed.
                              </p>
                              <div className="flex justify-center gap-2">
                                  {[0, 1, 2].map((i) => (
                                    <motion.div
                                      key={i}
                                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                                      className="w-3 h-3 rounded-full bg-gradient-to-r from-primary-500 to-accent-500"
                                    />
                                  ))}
                              </div>
                          </>
                      ) : (
                          <>
                              <motion.div
                                  initial={{ rotateY: 180 }}
                                  animate={{ rotateY: 0 }}
                                  className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30"
                              >
                                  <Lock className="w-10 h-10 text-white" />
                              </motion.div>
                              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Step 2: Enter OTP</h3>
                              <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
                                  Enter the 6-digit code sent to your email and mobile.
                              </p>
                              <form onSubmit={handleOtpSubmit} className="space-y-4">
                                  <div className="flex gap-2 justify-center">
                                    {[...Array(6)].map((_, i) => (
                                      <input
                                        key={i}
                                        type="text"
                                        maxLength="1"
                                        value={otp[i] || ''}
                                        onChange={(e) => {
                                          const val = e.target.value.replace(/\D/g, '');
                                          const newOtp = otp.split('');
                                          newOtp[i] = val;
                                          setOtp(newOtp.join(''));
                                          if (val && e.target.nextElementSibling) {
                                            e.target.nextElementSibling.focus();
                                          }
                                          if (error) setError('');
                                        }}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Backspace' && !otp[i] && e.target.previousElementSibling) {
                                            e.target.previousElementSibling.focus();
                                          }
                                        }}
                                        className="w-12 h-14 text-center text-2xl font-bold bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none dark:text-white transition-all"
                                        autoFocus={i === 0}
                                      />
                                    ))}
                                  </div>
                                  {error && (error === "Invalid OTP" || error === "Failed to verify OTP") && (
                                      <motion.div
                                          initial={{ opacity: 0, y: -5 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          className="p-2 text-red-600 dark:text-red-400 text-sm font-medium flex items-center justify-center gap-1"
                                      >
                                          <XCircle className="w-4 h-4" /> {error}
                                      </motion.div>
                                  )}
                                  <motion.button
                                      whileHover={{ scale: 1.02 }}
                                      whileTap={{ scale: 0.98 }}
                                      type="submit"
                                      className="w-full bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-primary-500/25 transition-all"
                                  >
                                      Verify & Login
                                  </motion.button>
                              </form>
                          </>
                      )}

                      <button
                          onClick={() => { setIsPolling(false); setVerificationId(null); setShowOtpInput(false); }}
                          className="mt-6 text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                      >
                          Cancel Login
                      </button>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Left Side - Premium Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-primary-950 to-slate-900" />

        {/* Animated mesh overlay */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(99, 102, 241, 0.3) 0%, transparent 50%),
                              radial-gradient(circle at 75% 75%, rgba(168, 85, 247, 0.3) 0%, transparent 50%),
                              radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.2) 0%, transparent 50%)`
          }} />
        </div>

        {/* Floating orbs */}
        <motion.div
            animate={{
                scale: [1, 1.3, 1],
                x: [0, 50, 0],
                y: [0, -30, 0],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-br from-primary-500/40 to-accent-500/20 rounded-full blur-3xl"
        />
        <motion.div
            animate={{
                scale: [1, 0.8, 1],
                x: [0, -40, 0],
                y: [0, 40, 0],
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-cyan-500/30 to-blue-500/20 rounded-full blur-3xl"
        />
        <motion.div
            animate={{
                scale: [1, 1.2, 0.9, 1],
                rotate: [0, 180, 360],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-conic from-primary-500/20 via-accent-500/10 to-primary-500/20 rounded-full blur-3xl"
        />

        {/* Floating particles */}
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-white/20"
            style={{
              width: particle.size,
              height: particle.size,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
            }}
          />
        ))}

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />

        {/* Content */}
        <div className="relative z-10 p-12 text-white max-w-xl">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
            >
                {/* Logo/Icon */}
                <motion.div
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    className="w-20 h-20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/10 flex items-center justify-center mb-8 shadow-2xl relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-accent-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <Sparkles className="w-10 h-10 text-white relative z-10" />
                </motion.div>

                <h1 className="text-5xl lg:text-6xl font-black mb-6 leading-tight tracking-tight">
                    <span className="block">SPSI</span>
                    <span className="block mt-2 bg-gradient-to-r from-primary-300 via-accent-300 to-cyan-300 bg-clip-text text-transparent">
                        Management
                    </span>
                </h1>

                <p className="text-lg text-slate-300 leading-relaxed mb-10 max-w-md">
                    Experience the future of workflow management.
                    Secure, intelligent, and designed for modern teams.
                </p>

                {/* Feature pills */}
                <div className="flex flex-wrap gap-3">
                    {['Real-time Sync', '2FA Security', 'Smart Analytics'].map((feature, i) => (
                      <motion.div
                        key={feature}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-sm font-medium"
                      >
                        <Zap className="w-4 h-4 text-primary-400" />
                        {feature}
                      </motion.div>
                    ))}
                </div>

                {/* Trust badges */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="mt-12 flex items-center gap-4"
                >
                    <div className="flex -space-x-3">
                        {[...Array(4)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.9 + i * 0.1 }}
                                className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-slate-900 flex items-center justify-center shadow-lg"
                            >
                                <User size={14} className="text-slate-400" />
                            </motion.div>
                        ))}
                    </div>
                    <p className="text-sm text-slate-400">
                        <span className="font-bold text-white">500+</span> teams trust us
                    </p>
                </motion.div>
            </motion.div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-8 lg:p-16 relative">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />

        {/* Theme Toggle */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.1, rotate: 180 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleTheme}
          className="absolute top-6 right-6 p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shadow-sm border border-slate-200/50 dark:border-slate-700/50"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={theme}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </motion.div>
          </AnimatePresence>
        </motion.button>

        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md space-y-8 relative z-10"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-16 h-16 bg-gradient-to-br from-primary-600 to-accent-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30"
            >
              <Sparkles className="w-8 h-8 text-white" />
            </motion.div>
          </div>

          <div className="text-center lg:text-left">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight"
            >
              Welcome Back
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-2 text-slate-500 dark:text-slate-400"
            >
              Sign in to continue to your dashboard
            </motion.p>
          </div>

          <AnimatePresence>
            {error && (
               <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-3"
              >
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  {error}
               </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                Email Address
              </label>
              <div className="relative group">
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r from-primary-500/20 to-accent-500/20 blur-xl transition-opacity duration-300 ${isFocused.email ? 'opacity-100' : 'opacity-0'}`} />
                <div className="relative">
                   <User className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-300 ${isFocused.email ? 'text-primary-500' : 'text-slate-400'}`} />
                   <input
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setIsFocused(f => ({ ...f, email: true }))}
                      onBlur={() => setIsFocused(f => ({ ...f, email: false }))}
                      className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-0 focus:border-primary-500 dark:focus:border-primary-500 transition-all outline-none dark:text-white placeholder:text-slate-400 font-medium shadow-sm"
                      placeholder="Enter your email"
                      required
                   />
                </div>
              </div>
            </motion.div>

            {/* Password Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-2"
            >
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                Password
              </label>
              <div className="relative group">
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r from-primary-500/20 to-accent-500/20 blur-xl transition-opacity duration-300 ${isFocused.password ? 'opacity-100' : 'opacity-0'}`} />
                <div className="relative">
                   <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-300 ${isFocused.password ? 'text-primary-500' : 'text-slate-400'}`} />
                   <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setIsFocused(f => ({ ...f, password: true }))}
                      onBlur={() => setIsFocused(f => ({ ...f, password: false }))}
                      className="w-full pl-12 pr-14 py-4 bg-white dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-0 focus:border-primary-500 dark:focus:border-primary-500 transition-all outline-none dark:text-white placeholder:text-slate-400 font-medium shadow-sm"
                      placeholder="Enter your password"
                      required
                   />
                   <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary-500 transition-colors p-1"
                   >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                   </button>
                </div>
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <motion.button
                  whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(99, 102, 241, 0.3)" }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="relative w-full bg-gradient-to-r from-primary-600 via-primary-500 to-accent-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-primary-500/25 flex items-center justify-center gap-3 overflow-hidden group"
              >
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                  <span className="relative z-10">Sign In</span>
                  <ArrowRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </motion.div>
          </form>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center text-sm text-slate-400 dark:text-slate-500 pt-4"
          >
            &copy; {new Date().getFullYear()} SPSI Management System. All rights reserved.
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
