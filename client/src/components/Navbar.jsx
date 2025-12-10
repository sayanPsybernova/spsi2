import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { LogOut, User as UserIcon, Sun, Moon } from "lucide-react";
import { API_BASE } from "../config/api";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  if (!user) return null;

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="sticky top-0 z-50 px-4 py-3 sm:px-6 lg:px-8"
    >
      <div className="max-w-[1600px] mx-auto">
        <div className="glass rounded-2xl sm:rounded-full px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between shadow-lg shadow-slate-200/20 dark:shadow-black/20 ring-1 ring-black/5 dark:ring-white/5 transition-all duration-500 ease-in-out">
          
          {/* Logo Section */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-black text-xl sm:text-2xl shadow-lg shadow-indigo-500/30 overflow-hidden group">
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              S
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 leading-none">
                SPSI
              </span>
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest hidden sm:block">Management</span>
            </div>
          </motion.div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 hover:text-indigo-500 dark:hover:text-indigo-400 hover:shadow-lg transition-all duration-300 border border-slate-200 dark:border-slate-700"
              title="Toggle Theme"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={theme}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
                </motion.div>
              </AnimatePresence>
            </motion.button>

            {/* User Profile */}
            <div className="flex items-center gap-3 sm:gap-4 pl-3 sm:pl-6 border-l border-slate-200 dark:border-slate-800/50">
              
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-bold text-slate-800 dark:text-white leading-none mb-1">
                  {user.name}
                </span>
                <span className="text-xs font-semibold text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full uppercase tracking-wider text-[10px]">
                  {user.role}
                </span>
              </div>

              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="relative"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full p-0.5 bg-gradient-to-tr from-indigo-500 to-fuchsia-500 shadow-md">
                  <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 overflow-hidden relative">
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
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <UserIcon size={20} />
                      </div>
                    )}
                  </div>
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
              </motion.div>

              {/* Logout Button - Large Click Area */}
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: "#ef4444", color: "#fff", borderColor: "#ef4444" }}
                whileTap={{ scale: 0.95 }}
                onClick={logout}
                className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-white bg-white dark:bg-slate-800 hover:bg-red-500 dark:hover:bg-red-500 transition-all duration-300 shadow-sm"
                title="Sign Out"
              >
                <LogOut size={20} className="ml-0.5" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
