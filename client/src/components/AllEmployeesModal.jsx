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

export default function AllEmployeesModal({ onClose }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    phone: "",
    userId: "",
    password: "",
    image: null,
  });
  const [preview, setPreview] = useState(null);
  const [showPassword, setShowPassword] = useState({}); // Map of user id to boolean

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Cleanup preview URL
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(API_ENDPOINTS.users);
      const sorted = res.data.sort((a, b) => a.role.localeCompare(b.role));
      setEmployees(sorted);
    } catch (err) {
      console.error("Error fetching employees:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (
      window.confirm(
        `Are you sure you want to delete employee "${name}"? This action cannot be undone.`
      )
    ) {
      try {
        await axios.delete(`${API_ENDPOINTS.users}/${id}`);
        setEmployees(employees.filter((emp) => emp.id !== id));
        alert("Employee deleted successfully.");
      } catch (err) {
        console.error("Error deleting employee:", err);
        alert("Failed to delete employee.");
      }
    }
  };

  const handleEdit = (emp) => {
    setEditingUser(emp);
    setEditFormData({
      name: emp.name,
      phone: emp.phone,
      userId: emp.userId,
      password: emp.password || "", // Ensure password field exists
      image: null,
    });
    setPreview(
      emp.image
        ? emp.image.startsWith("http")
          ? emp.image
          : `${API_BASE}${emp.image}`
        : null
    );
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", editFormData.name);
    data.append("phone", editFormData.phone);
    data.append("userId", editFormData.userId);
    data.append("password", editFormData.password);
    data.append("role", editingUser.role);
    if (editFormData.image) data.append("image", editFormData.image);

    try {
      const res = await axios.put(
        `${API_ENDPOINTS.users}/${editingUser.id}`,
        data,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (res.data.success) {
        // Update local state
        setEmployees(
          employees.map((emp) =>
            emp.id === editingUser.id ? res.data.user : emp
          )
        );
        alert("Employee updated successfully!");
        setEditingUser(null);
        setPreview(null);
      }
    } catch (err) {
      console.error("Error updating user:", err);
      alert(err.response?.data?.message || "Error updating user");
    }
  };

  const togglePasswordVisibility = (id) => {
    setShowPassword((prev) => ({ ...prev, [id]: !prev[id] }));
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

  // Edit Form View
  if (editingUser) {
    return (
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-in fade-in zoom-in duration-200 border border-slate-100 dark:border-slate-700">
          <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
              Edit {editingUser.name}
            </h2>
            <button
              onClick={() => setEditingUser(null)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
            >
              <X size={20} className="text-slate-500 dark:text-slate-400" />
            </button>
          </div>

          <form onSubmit={handleUpdate} className="space-y-4">
            {/* Image Upload */}
            <div className="flex items-center gap-3 sm:gap-4 justify-center mb-4 sm:mb-6">
              <div className="relative group">
                <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center overflow-hidden">
                  {preview ? (
                    <img
                      src={preview}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Upload
                      size={20}
                      sm:size={24}
                      className="text-slate-400 dark:text-slate-500"
                    />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 sm:p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-lg">
                  <Edit2 size={12} sm:size={14} />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      setEditFormData({ ...editFormData, image: file });
                      if (file) setPreview(URL.createObjectURL(file));
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Phone
                </label>
                <input
                  type="text"
                  value={editFormData.phone}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                User ID (Email)
              </label>
              <input
                type="text"
                value={editFormData.userId}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, userId: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword["edit"] ? "text" : "password"}
                  value={editFormData.password}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      password: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 dark:text-white pr-10 text-sm"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("edit")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showPassword["edit"] ? (
                    <EyeOff size={14} sm:size={16} />
                  ) : (
                    <Eye size={14} sm:size={16} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-3 sm:mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2.5 sm:py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/25"
            >
              <Save size={16} sm:size={18} />
              Update Employee
            </button>
          </form>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-5xl h-[80vh] flex flex-col animate-in fade-in zoom-in duration-200 border border-slate-100 dark:border-slate-700">
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-1.5 sm:p-2 rounded-lg text-purple-600 dark:text-purple-400">
              <Users size={20} sm:size={24} />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white">
              All Employees
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
          ) : employees.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-slate-400 dark:text-slate-500">
              <Users size={48} className="mb-4 opacity-20" />
              <p>No employees found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {employees.map((emp) => (
                <div
                  key={emp.id}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 hover:shadow-md transition-all group relative overflow-hidden"
                >
                  {/* Role Badge */}
                  <div
                    className={`absolute top-4 right-4 text-xs font-semibold px-2 py-1 rounded-full border flex items-center gap-1 ${getRoleBadgeStyle(
                      emp.role
                    )}`}
                  >
                    {getRoleIcon(emp.role)}
                    <span className="capitalize">{emp.role}</span>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4 mt-2">
                    <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0">
                      {emp.image ? (
                        <img
                          src={
                            emp.image.startsWith("http")
                              ? emp.image
                              : `${API_BASE}${emp.image}`
                          }
                          alt={emp.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-slate-400 dark:text-slate-500 font-bold text-lg sm:text-xl">
                          {emp.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-800 dark:text-white truncate text-base sm:text-lg">
                        {emp.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate">
                        ID: {emp.userId}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 dark:text-slate-500">
                        Phone:
                      </span>
                      <span className="font-medium">{emp.phone}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 dark:text-slate-500">
                        Password:
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium">
                          {showPassword[emp.id] ? emp.password : "••••••"}
                        </span>
                        <button
                          onClick={() => togglePasswordVisibility(emp.id)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        >
                          {showPassword[emp.id] ? (
                            <EyeOff size={14} />
                          ) : (
                            <Eye size={14} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {emp.role !== "superadmin" && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleEdit(emp)}
                        className="py-2 rounded-lg border border-blue-100 dark:border-blue-800/30 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center justify-center gap-2 transition-colors font-medium text-sm"
                      >
                        <Edit2 size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(emp.id, emp.name)}
                        className="py-2 rounded-lg border border-red-100 dark:border-red-800/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center gap-2 transition-colors font-medium text-sm"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

AllEmployeesModal.propTypes = {
  onClose: PropTypes.func.isRequired,
};
