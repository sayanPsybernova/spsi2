import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { X, Eye, EyeOff, Upload } from "lucide-react";
import axios from "axios";
import { API_ENDPOINTS } from "../config/api";
import { motion, AnimatePresence } from "framer-motion";

export default function UserFormModal({ role, userToEdit, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: userToEdit?.name || "",
    email: userToEdit?.email || "",
    phone: userToEdit?.phone || "",
    emp_id: userToEdit?.emp_id || "",
    password: userToEdit?.password || "", 
    image: null,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [preview, setPreview] = useState(userToEdit?.image || null);

  useEffect(() => {
    return () => {
      if (preview && !preview.startsWith('/uploads')) {
         URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    if (userToEdit) data.append("id", userToEdit.id);
    data.append("name", formData.name);
    data.append("email", formData.email);
    data.append("phone", formData.phone);
    data.append("emp_id", formData.emp_id);
    data.append("password", formData.password);
    data.append("role", role); 
    if (formData.image) data.append("image", formData.image);

    try {
      const res = await axios.post(API_ENDPOINTS.users, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error("Error saving user:", err);
      alert(err.response?.data?.message || "Error saving user");
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
        />
        
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="relative w-full max-w-lg bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/50 overflow-hidden"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-slate-200/50 dark:border-slate-700/50">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 capitalize">
              {userToEdit ? "Edit User Details" : `Add New ${role}`}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Image Upload */}
            <div className="flex items-center gap-6">
              <div className="relative group cursor-pointer">
                <div className="h-20 w-20 rounded-2xl bg-slate-100 dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center overflow-hidden transition-all group-hover:border-indigo-500">
                  {preview ? (
                    <img
                      src={preview.startsWith('/uploads') ? `${API_ENDPOINTS.uploads}/../${preview}` : preview}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Upload size={24} className="text-slate-400 group-hover:text-indigo-500" />
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (preview) URL.revokeObjectURL(preview);
                    setFormData({ ...formData, image: file });
                    if (file) setPreview(URL.createObjectURL(file));
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Profile Photo</p>
                <p className="text-xs text-slate-500">Tap to upload a clear image</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Name</label>
                <input
                  required
                  type="text"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white font-medium transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Phone</label>
                <input
                  required
                  type="tel"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white font-medium transition-all"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email (Login ID)</label>
              <input
                required
                type="email"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white font-medium transition-all"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Employee ID</label>
              <input
                required
                type="text"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white font-medium transition-all"
                value={formData.emp_id}
                onChange={(e) => setFormData({ ...formData, emp_id: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Password</label>
              <div className="relative">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none pr-12 dark:text-white font-medium transition-all"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-indigo-500/30 active:scale-[0.98] transition-all"
              >
                {userToEdit ? "Save Changes" : "Create Account"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

UserFormModal.propTypes = {
  role: PropTypes.string.isRequired,
  userToEdit: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};
