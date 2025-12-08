import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { LogOut, User as UserIcon, Sun, Moon, Menu } from "lucide-react";
import { API_BASE } from "../config/api";
import { motion } from "framer-motion";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  if (!user) return null;

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border-b border-slate-200/50 dark:border-slate-800/50 transition-colors duration-300 supports-[backdrop-filter]:bg-white/60"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between h-14 sm:h-16 items-center">
          {/* Logo Section */}
          <div className="flex-shrink-0 flex items-center gap-1.5 sm:gap-2 cursor-pointer">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg sm:rounded-lg flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg shadow-blue-500/30">
              S
            </div>
            <span className="text-base sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 hidden sm:block">
              SPSI
            </span>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 sm:p-2 rounded-full bg-slate-100/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ring-1 ring-slate-900/5 dark:ring-white/10"
              title="Toggle Theme"
            >
              {theme === "light" ? (
                <Moon size={14} sm:size={18} />
              ) : (
                <Sun size={14} sm:size={18} />
              )}
            </button>

            {/* User Profile */}
            <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-slate-200 dark:border-slate-800">
              <div className="hidden sm:block text-right">
                <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 leading-none">
                  {user.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1 capitalize">
                  {user.role}
                </p>
              </div>

              <div className="h-7 w-7 sm:h-9 sm:w-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 p-[1.5px] sm:p-[2px] shadow-md">
                <div className="h-full w-full rounded-full bg-white dark:bg-slate-900 overflow-hidden flex items-center justify-center">
                  {user.image ? (
                    <img
                      src={
                        user.image.startsWith("http")
                          ? user.image
                          : `${API_BASE}${user.image}`
                      }
                      alt={user.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserIcon className="h-3 w-3 sm:h-4 sm:w-4 text-slate-500 dark:text-slate-400" />
                  )}
                </div>
              </div>

              <button
                onClick={logout}
                className="ml-1 sm:ml-2 p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                title="Logout"
              >
                <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
