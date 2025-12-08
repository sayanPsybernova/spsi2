import { useState, useEffect, useRef } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Send,
  Edit2,
  Camera,
  UploadCloud,
} from "lucide-react";
import { API_ENDPOINTS } from "../config/api";

export default function SupervisorDashboard() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [formData, setFormData] = useState({
    sugarQty: "",
    sugarPrice: "",
    saltQty: "",
    saltPrice: "",
  });
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Editing/Resubmitting State
  const [editingId, setEditingId] = useState(null);
  const [isResubmitting, setIsResubmitting] = useState(false);

  // Calculations
  const totalSugar =
    (parseFloat(formData.sugarQty) || 0) *
    (parseFloat(formData.sugarPrice) || 0);
  const totalSalt =
    (parseFloat(formData.saltQty) || 0) * (parseFloat(formData.saltPrice) || 0);
  const grandTotal = totalSugar + totalSalt;

  useEffect(() => {
    fetchSubmissions();
  }, [user]);

  const fetchSubmissions = async () => {
    if (!user) return;
    try {
      // Use userId if available, otherwise use email
      const userId = user.userId || user.email;
      const res = await axios.get(
        `${API_ENDPOINTS.submissions}?role=supervisor&userId=${userId}`
      );
      setSubmissions(res.data);
    } catch (err) {
      console.error("Failed to fetch submissions:", err);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setSelectedFiles((prevFiles) => [
        ...prevFiles,
        ...Array.from(e.target.files),
      ]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Use userId if available, otherwise use email
      const supervisorId = user.userId || user.email;

      const data = new FormData();
      data.append("supervisorId", supervisorId);
      data.append("supervisorName", user.name);
      data.append("sugarQty", formData.sugarQty);
      data.append("sugarPrice", formData.sugarPrice);
      data.append("saltQty", formData.saltQty);
      data.append("saltPrice", formData.saltPrice);

      // Append files
      selectedFiles.forEach((file) => {
        data.append("photos", file);
      });

      if (isResubmitting && editingId) {
        // For resubmission, use FormData to support file uploads
        await axios.put(`${API_ENDPOINTS.submissions}/${editingId}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Resubmitted successfully!");
        setIsResubmitting(false);
        setEditingId(null);
      } else {
        await axios.post(API_ENDPOINTS.submissions, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Submitted successfully!");
      }

      setFormData({ sugarQty: "", sugarPrice: "", saltQty: "", saltPrice: "" });
      setSelectedFiles([]);
      fetchSubmissions();
    } catch (err) {
      console.error("Error submitting data:", err);
      // Display detailed error message from backend
      if (err.response && err.response.data && err.response.data.message) {
        alert(`Error submitting data: ${err.response.data.message}`);
      } else {
        alert("Error submitting data. Please try again.");
      }
    }
  };

  const handleEdit = (submission) => {
    setFormData({
      sugarQty: submission.sugarQty,
      sugarPrice: submission.sugarPrice,
      saltQty: submission.saltQty,
      saltPrice: submission.saltPrice,
    });
    setEditingId(submission.id);
    setIsResubmitting(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      <Navbar />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Input Form */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 sticky top-20 sm:top-24 transition-colors">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-4 sm:mb-6 flex items-center gap-2">
                {isResubmitting ? (
                  <Edit2 size={20} sm:size={24} className="text-blue-500" />
                ) : (
                  <Send size={20} sm:size={24} className="text-blue-500" />
                )}
                {isResubmitting ? "Resubmit Data" : "New Submission"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-5">
                {/* Sugar Section */}
                <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl sm:rounded-2xl border border-blue-100 dark:border-blue-800/30 space-y-2 sm:space-y-3">
                  <h3 className="font-bold text-blue-800 dark:text-blue-400 text-xs sm:text-sm uppercase tracking-wider">
                    Sugar Details
                  </h3>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1 ml-0.5 sm:mb-1.5">
                      Quantity (kg)
                    </label>
                    <input
                      required
                      type="number"
                      step="0.01"
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800/50 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition-all text-sm"
                      value={formData.sugarQty}
                      onChange={(e) =>
                        setFormData({ ...formData, sugarQty: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1 ml-0.5 sm:mb-1.5">
                      Price per kg
                    </label>
                    <input
                      required
                      type="number"
                      step="0.01"
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800/50 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition-all text-sm"
                      value={formData.sugarPrice}
                      onChange={(e) =>
                        setFormData({ ...formData, sugarPrice: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm font-bold text-blue-900 dark:text-blue-300 pt-1.5 sm:pt-2 border-t border-blue-200 dark:border-blue-800/30">
                    <span>Total Sugar:</span>
                    <span>₹{totalSugar.toFixed(2)}</span>
                  </div>
                </div>

                {/* Salt Section */}
                <div className="p-3 sm:p-4 bg-teal-50 dark:bg-teal-900/20 rounded-xl sm:rounded-2xl border border-teal-100 dark:border-teal-800/30 space-y-2 sm:space-y-3">
                  <h3 className="font-bold text-teal-800 dark:text-teal-400 text-xs sm:text-sm uppercase tracking-wider">
                    Salt Details
                  </h3>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1 ml-0.5 sm:mb-1.5">
                      Quantity (kg)
                    </label>
                    <input
                      required
                      type="number"
                      step="0.01"
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-white dark:bg-slate-900 border border-teal-200 dark:border-teal-800/50 focus:ring-2 focus:ring-teal-500 outline-none dark:text-white transition-all text-sm"
                      value={formData.saltQty}
                      onChange={(e) =>
                        setFormData({ ...formData, saltQty: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1 ml-0.5 sm:mb-1.5">
                      Price per kg
                    </label>
                    <input
                      required
                      type="number"
                      step="0.01"
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-white dark:bg-slate-900 border border-teal-200 dark:border-teal-800/50 focus:ring-2 focus:ring-teal-500 outline-none dark:text-white transition-all text-sm"
                      value={formData.saltPrice}
                      onChange={(e) =>
                        setFormData({ ...formData, saltPrice: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm font-bold text-teal-900 dark:text-teal-300 pt-1.5 sm:pt-2 border-t border-teal-200 dark:border-teal-800/30">
                    <span>Total Salt:</span>
                    <span>₹{totalSalt.toFixed(2)}</span>
                  </div>
                </div>

                {/* Evidence Upload Section */}
                <div className="p-3 sm:p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl sm:rounded-2xl border border-indigo-100 dark:border-indigo-800/30 space-y-2 sm:space-y-3">
                  <h3 className="font-bold text-indigo-800 dark:text-indigo-400 text-xs sm:text-sm uppercase tracking-wider">
                    Evidence (Photos)
                  </h3>
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <label
                      htmlFor="gallery-upload"
                      className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1 ml-0.5 sm:mb-1.5 cursor-pointer"
                    >
                      Upload from Gallery
                    </label>
                    <input
                      id="gallery-upload"
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        document.getElementById("gallery-upload").click()
                      }
                      className="flex items-center justify-center px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:hover:bg-indigo-800/50 transition-all text-xs sm:text-sm font-semibold"
                      title="Upload from Gallery"
                    >
                      <UploadCloud size={16} sm:size={20} />
                    </button>

                    <label
                      htmlFor="camera-capture"
                      className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1 ml-0.5 sm:mb-1.5 cursor-pointer"
                    >
                      Take Photo
                    </label>
                    <input
                      id="camera-capture"
                      type="file"
                      accept="image/*"
                      capture="environment" // This attribute directly opens the camera
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        document.getElementById("camera-capture").click()
                      }
                      className="flex items-center justify-center px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:hover:bg-indigo-800/50 transition-all text-xs sm:text-sm font-semibold"
                      title="Open Camera"
                    >
                      <Camera size={16} sm:size={20} />
                    </button>
                  </div>

                  {/* Image Previews */}
                  {selectedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-1 sm:gap-2 mt-1 sm:mt-2">
                      {selectedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="relative w-16 h-16 sm:w-20 sm:h-20 group"
                        >
                          <img
                            src={URL.createObjectURL(file)}
                            alt="Preview"
                            className="w-full h-full object-cover rounded-lg border border-slate-200 dark:border-slate-700"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newFiles = selectedFiles.filter(
                                (_, i) => i !== index
                              );
                              setSelectedFiles(newFiles);
                            }}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow-sm opacity-90 hover:opacity-100 transition-opacity"
                          >
                            <XCircle size={12} sm:size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {/* Grand Total */}
                <div className="p-4 sm:p-5 bg-slate-900 dark:bg-black text-white rounded-xl sm:rounded-2xl flex justify-between items-center text-base sm:text-lg font-bold shadow-lg shadow-slate-900/20">
                  <span>Grand Total</span>
                  <span className="text-xl sm:text-2xl">
                    ₹{grandTotal.toFixed(2)}
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl font-bold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <Send size={16} sm:size={20} />
                  {isResubmitting ? "Update & Resubmit" : "Submit Data"}
                </button>

                {isResubmitting && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsResubmitting(false);
                      setEditingId(null);
                      setFormData({
                        sugarQty: "",
                        sugarPrice: "",
                        saltQty: "",
                        saltPrice: "",
                      });
                    }}
                    className="w-full text-slate-500 dark:text-slate-400 text-xs sm:text-sm underline hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                  >
                    Cancel Resubmission
                  </button>
                )}
              </form>
            </div>
          </div>

          {/* Submissions List */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              My Submissions
            </h2>
            {submissions.length === 0 ? (
              <div className="text-center py-12 sm:py-16 bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-slate-700">
                <p className="text-slate-400 dark:text-slate-500 text-base sm:text-lg">
                  No submissions yet.
                </p>
              </div>
            ) : (
              submissions
                .slice()
                .reverse()
                .map((item) => (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl sm:rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all relative overflow-hidden group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mb-1 flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(item.date).toLocaleDateString()} •{" "}
                          {new Date(item.date).toLocaleTimeString()}
                        </p>
                        <h3 className="font-black text-slate-800 dark:text-white text-2xl tracking-tight">
                          ₹{item.grandTotal.toFixed(2)}
                        </h3>
                      </div>
                      <StatusBadge status={item.status} />
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm mb-3 sm:mb-5">
                      <div className="bg-blue-50 dark:bg-blue-900/10 p-2 sm:p-3 rounded-lg sm:rounded-xl border border-blue-100 dark:border-blue-800/20">
                        <p className="text-blue-600 dark:text-blue-400 text-xs font-bold uppercase mb-1">
                          Sugar
                        </p>
                        <p className="font-mono font-semibold text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
                          {item.sugarQty}kg × ₹{item.sugarPrice}
                        </p>
                      </div>
                      <div className="bg-teal-50 dark:bg-teal-900/10 p-2 sm:p-3 rounded-lg sm:rounded-xl border border-teal-100 dark:border-teal-800/20">
                        <p className="text-teal-600 dark:text-teal-400 text-xs font-bold uppercase mb-1">
                          Salt
                        </p>
                        <p className="font-mono font-semibold text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
                          {item.saltQty}kg × ₹{item.saltPrice}
                        </p>
                      </div>
                    </div>

                    {/* Evidence Photos Display */}
                    {item.evidencePhotos && item.evidencePhotos.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-2">
                          Evidence
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {item.evidencePhotos.map((photo, idx) => (
                            <a
                              key={idx}
                              href={photo}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block w-16 h-16 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 hover:opacity-80 transition-opacity"
                            >
                              <img
                                src={photo}
                                alt={`Evidence ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Validator Remarks */}
                    {item.status === "Rejected" && (
                      <div className="bg-red-50 dark:bg-red-900/20 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-red-100 dark:border-red-800/30 mb-3 sm:mb-4 animate-pulse-slow">
                        <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold mb-1 sm:mb-2">
                          <AlertCircle size={16} sm:size={18} />
                          <span>Correction Required</span>
                        </div>
                        <p className="text-xs sm:text-sm text-red-600 dark:text-red-300 mb-2 sm:mb-3">
                          {item.remarks}
                        </p>
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-xs sm:text-xs bg-white dark:bg-red-900/50 text-red-700 dark:text-red-300 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full hover:bg-red-50 dark:hover:bg-red-800/50 font-bold shadow-sm border border-red-100 dark:border-red-800/30 transition-colors"
                        >
                          Edit & Resubmit
                        </button>
                      </div>
                    )}

                    {/* Admin Remarks */}
                    {item.adminRemarks && (
                      <div className="mt-2 sm:mt-3 text-xs text-indigo-500 dark:text-indigo-400 italic border-t border-slate-100 dark:border-slate-700 pt-2 sm:pt-3">
                        <span className="font-bold">Admin Note:</span>{" "}
                        {item.adminRemarks}
                      </div>
                    )}
                  </div>
                ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Pending:
      "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/30",
    Approved:
      "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/30",
    Rejected:
      "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/30",
  };
  const icons = {
    Pending: <Clock size={14} />,
    Approved: <CheckCircle size={14} />,
    Rejected: <XCircle size={14} />,
  };

  return (
    <span
      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
        styles[status] || styles.Pending
      }`}
    >
      {icons[status] || icons.Pending}
      {status}
    </span>
  );
}

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
};
