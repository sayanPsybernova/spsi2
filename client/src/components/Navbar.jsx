import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { LogOut, User as UserIcon, Sun, Moon, Sparkles, Menu, X } from "lucide-react";
import { API_BASE } from "../config/api";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  if (!user) return null;

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="sticky top-0 z-50 px-4 py-3 sm:px-6 lg:px-8"
    >
      <div className="max-w-[1600px] mx-auto">
        <div className="relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl sm:rounded-full px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between shadow-lg shadow-slate-200/20 dark:shadow-black/20 border border-white/30 dark:border-slate-700/30 transition-all duration-500 ease-in-out overflow-hidden">

          {/* Animated gradient border effect */}
          <div className="absolute inset-0 rounded-2xl sm:rounded-full overflow-hidden">
            <motion.div
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.5), transparent)",
                backgroundSize: "200% 100%",
              }}
            />
          </div>

          {/* Logo Section */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-3 cursor-pointer relative z-10"
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl sm:rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary-600 via-primary-500 to-accent-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-black text-xl sm:text-2xl shadow-lg overflow-hidden">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
                </motion.div>
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-primary-700 to-slate-900 dark:from-white dark:via-primary-300 dark:to-white leading-none">
                SPSI
              </span>
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest hidden sm:block">
                Management
              </span>
            </div>
          </motion.div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-4 relative z-10">

            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 hover:text-primary-500 dark:hover:text-primary-400 hover:shadow-lg hover:shadow-primary-500/10 transition-all duration-300 border border-slate-200/50 dark:border-slate-700/50 overflow-hidden group"
              title="Toggle Theme"
            >
              {/* Hover glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 to-accent-500/0 group-hover:from-primary-500/10 group-hover:to-accent-500/10 transition-all duration-300" />

              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={theme}
                  initial={{ y: -30, opacity: 0, rotate: -90 }}
                  animate={{ y: 0, opacity: 1, rotate: 0 }}
                  exit={{ y: 30, opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.3, type: "spring" }}
                  className="relative z-10"
                >
                  {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
                </motion.div>
              </AnimatePresence>
            </motion.button>

            {/* User Profile */}
            <div className="flex items-center gap-3 sm:gap-4 pl-3 sm:pl-6 border-l border-slate-200/50 dark:border-slate-700/50">

              {/* User Info - Hidden on mobile */}
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-bold text-slate-800 dark:text-white leading-none mb-1">
                  {user.name}
                </span>
                <motion.span
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="text-[10px] font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-primary-100 dark:border-primary-800/30"
                >
                  {user.role}
                </motion.span>
              </div>

              {/* Avatar */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative group"
              >
                {/* Glow ring */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-300 scale-110" />

                <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full p-[2px] bg-gradient-to-br from-primary-500 via-accent-500 to-primary-500 shadow-lg group-hover:shadow-primary-500/30 transition-shadow duration-300">
                  <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 overflow-hidden">
                    {user.image ? (
                      <img
                        src={
                          user.image.startsWith("http")
                            ? user.image
                            : `${API_BASE}${user.image}`
                        }
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400">
                        <UserIcon size={20} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Online indicator */}
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full shadow-lg shadow-emerald-500/50"
                />
              </motion.div>

              {/* Logout Button */}
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: "#ef4444" }}
                whileTap={{ scale: 0.95 }}
                onClick={logout}
                className="relative w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl sm:rounded-2xl border border-slate-200/50 dark:border-slate-700/50 text-slate-500 bg-white/80 dark:bg-slate-800/80 hover:text-white hover:border-red-500 transition-all duration-300 overflow-hidden group"
                title="Sign Out"
              >
                {/* Hover fill */}
                <div className="absolute inset-0 bg-red-500 scale-0 group-hover:scale-100 transition-transform duration-300 rounded-xl sm:rounded-2xl" />
                <LogOut size={20} className="relative z-10 ml-0.5 group-hover:text-white transition-colors" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
