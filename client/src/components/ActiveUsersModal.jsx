import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  X,
  Users,
  Trash2,
  Shield,
  ShieldCheck,
  Edit2,
  Eye,
  EyeOff,
  Upload,
  Check,
  Save,
} from "lucide-react";
import axios from "axios";
import { API_ENDPOINTS, API_BASE } from "../config/api";

export default function ActiveUsersModal({ onClose }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveUsers();
  }, []);

  const fetchActiveUsers = async () => {
    try {
      const res = await axios.get(`${API_ENDPOINTS.users}?active=true`);
      const sorted = res.data.sort((a, b) => a.role.localeCompare(b.role));
      setUsers(sorted);
    } catch (err) {
      console.error("Error fetching active users:", err);
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "supervisor":
        return <Users size={16} className="text-blue-600 dark:text-blue-400" />;
      case "validator":
        return (
          <ShieldCheck size={16} className="text-teal-600 dark:text-teal-400" />
        );
      case "admin":
        return (
          <Shield size={16} className="text-indigo-600 dark:text-indigo-400" />
        );
      default:
        return (
          <Users size={16} className="text-slate-400 dark:text-slate-500" />
        );
    }
  };

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case "supervisor":
        return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/30";
      case "validator":
        return "bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-800/30";
      case "admin":
        return "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800/30";
      case "superadmin":
        return "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800/30";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700";
    }
  };

  // List View
  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 transition-all">
      <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-5xl h-[70vh] sm:h-[80vh] flex flex-col animate-in fade-in zoom-in duration-200 border border-slate-100 dark:border-slate-700">
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-1.5 sm:p-2 rounded-lg text-purple-600 dark:text-purple-400">
              <Users size={20} sm:size={24} />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white">
              Active Users
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
          >
            <X
              size={16}
              sm:size={20}
              className="text-slate-500 dark:text-slate-400"
            />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-slate-400 dark:text-slate-500">
              <Users size={48} className="mb-4 opacity-20" />
              <p>No active users found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 hover:shadow-md transition-all group relative overflow-hidden"
                >
                  {/* Role Badge */}
                  <div
                    className={`absolute top-4 right-4 text-xs font-semibold px-2 py-1 rounded-full border flex items-center gap-1 ${getRoleBadgeStyle(
                      user.role
                    )}`}
                  >
                    {getRoleIcon(user.role)}
                    <span className="capitalize">{user.role}</span>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4 mt-2">
                    <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0">
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
                        <div className="h-full w-full flex items-center justify-center text-slate-400 dark:text-slate-500 font-bold text-lg sm:text-xl">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-800 dark:text-white truncate text-base sm:text-lg">
                        {user.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate">
                        ID: {user.userId}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 dark:text-slate-500">
                        Phone:
                      </span>
                      <span className="font-medium">{user.phone}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

ActiveUsersModal.propTypes = {
  onClose: PropTypes.func.isRequired,
};
