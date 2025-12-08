import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { X, Eye, EyeOff, Upload } from "lucide-react";
import axios from "axios";
import { API_ENDPOINTS } from "../config/api";

export default function UserFormModal({ role, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    userId: "",
    password: "",
    image: null,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [preview, setPreview] = useState(null);

  // Clean up preview URL when component unmounts or preview changes
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", formData.name);
    data.append("phone", formData.phone);
    data.append("userId", formData.userId);
    data.append("password", formData.password);
    data.append("role", role); // 'supervisor', 'validator', 'admin'
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
      console.error("Error creating user:", err);
      alert(err.response?.data?.message || "Error creating user");
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 transition-all">
      <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-100 dark:border-slate-700">
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white capitalize">
            Add New {role}
          </h2>
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

        <form
          onSubmit={handleSubmit}
          className="p-4 sm:p-6 space-y-3 sm:space-y-4"
        >
          {/* Image Upload */}
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center overflow-hidden">
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <Upload
                  size={16}
                  sm:size={20}
                  className="text-slate-400 dark:text-slate-500"
                />
              )}
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Profile Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (preview) {
                    URL.revokeObjectURL(preview); // Revoke previous preview
                  }
                  setFormData({ ...formData, image: file });
                  if (file) {
                    setPreview(URL.createObjectURL(file));
                  }
                }}
                className="block w-full text-xs sm:text-sm text-slate-500 dark:text-slate-400 file:mr-2 sm:file:mr-4 file:py-1.5 sm:file:py-2 file:px-3 sm:file:px-4 file:rounded-full file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-900/30 dark:file:text-blue-400 hover:file:bg-blue-100 dark:hover:file:bg-blue-900/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Name
              </label>
              <input
                required
                type="text"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white placeholder-slate-400 text-sm"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Phone
              </label>
              <input
                required
                type="tel"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white placeholder-slate-400 text-sm"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              User ID
            </label>
            <input
              required
              type="text"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white placeholder-slate-400 text-sm"
              value={formData.userId}
              onChange={(e) =>
                setFormData({ ...formData, userId: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                required
                type={showPassword ? "text" : "password"}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none pr-10 dark:text-white placeholder-slate-400 text-sm"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
              >
                {showPassword ? (
                  <EyeOff size={16} sm:size={18} />
                ) : (
                  <Eye size={16} sm:size={18} />
                )}
              </button>
            </div>
          </div>

          <div className="pt-3 sm:pt-4">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 sm:py-2.5 rounded-xl font-semibold transition-colors shadow-lg shadow-blue-500/25"
            >
              Create Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

UserFormModal.propTypes = {
  role: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};
