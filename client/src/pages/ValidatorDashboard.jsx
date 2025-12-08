import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { Check, X, Filter, AlertCircle } from "lucide-react";
import { API_ENDPOINTS } from "../config/api";

export default function ValidatorDashboard() {
  const [submissions, setSubmissions] = useState([]);
  const [filter, setFilter] = useState("Pending"); // Pending, Approved, Rejected, All
  const [rejectModal, setRejectModal] = useState(null); // ID of submission to reject
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const res = await axios.get(
        `${API_ENDPOINTS.submissions}?role=validator`
      );
      setSubmissions(res.data);
    } catch (err) {
      console.error("Failed to fetch submissions:", err);
    }
  };

  const handleStatus = async (id, status, remarks = "") => {
    try {
      await axios.put(`${API_ENDPOINTS.submissions}/${id}/validate`, {
        status,
        remarks,
      });
      fetchSubmissions();
      setRejectModal(null);
      setRejectReason("");
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Error updating status");
    }
  };

  const filteredSubmissions =
    filter === "All"
      ? submissions
      : submissions.filter((s) => s.status === filter);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      <Navbar />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 sm:mb-10 gap-3 sm:gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Validator Dashboard
            </h1>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
              Review and validate field data.
            </p>
          </div>

          <div className="flex bg-white dark:bg-slate-800 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            {["Pending", "Approved", "Rejected", "All"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  filter === f
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {filteredSubmissions.length === 0 ? (
            <div className="text-center py-20 sm:py-24 bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-slate-700 flex flex-col items-center">
              <div className="h-16 w-16 sm:h-20 sm:w-20 bg-slate-50 dark:bg-slate-900/50 rounded-full flex items-center justify-center mb-4">
                <Filter className="h-8 w-8 sm:h-10 sm:w-10 text-slate-300 dark:text-slate-600" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-base sm:text-lg font-medium">
                No {filter.toLowerCase()} submissions found.
              </p>
            </div>
          ) : (
            filteredSubmissions
              .slice()
              .reverse()
              .map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row gap-4 sm:gap-6 transition-colors hover:shadow-md"
                >
                  {/* Data Section */}
                  <div className="flex-1">
                    <div className="flex justify-between mb-4">
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                          {item.supervisorName}
                        </h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          ID: {item.supervisorId}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                          {new Date(item.date).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          {new Date(item.date).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 mt-3 sm:mt-4">
                      <div className="bg-blue-50 dark:bg-blue-900/10 p-3 sm:p-4 rounded-lg sm:rounded-2xl border border-blue-100 dark:border-blue-800/20">
                        <p className="text-xs text-blue-600 dark:text-blue-400 uppercase font-bold mb-1">
                          Sugar
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 font-mono text-xs sm:text-sm">
                          {item.sugarQty}kg @ ₹{item.sugarPrice}
                        </p>
                        <p className="text-blue-700 dark:text-blue-300 font-bold mt-1 sm:mt-2">
                          ₹{item.totalSugar.toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-teal-50 dark:bg-teal-900/10 p-3 sm:p-4 rounded-lg sm:rounded-2xl border border-teal-100 dark:border-teal-800/20">
                        <p className="text-xs text-teal-600 dark:text-teal-400 uppercase font-bold mb-1">
                          Salt
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 font-mono text-xs sm:text-sm">
                          {item.saltQty}kg @ ₹{item.saltPrice}
                        </p>
                        <p className="text-teal-700 dark:text-teal-300 font-bold mt-1 sm:mt-2">
                          ₹{item.totalSalt.toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-slate-900 dark:bg-black p-3 sm:p-4 rounded-lg sm:rounded-2xl text-white flex flex-col justify-center items-center shadow-lg shadow-slate-500/10 dark:shadow-none">
                        <p className="text-xs text-slate-400 uppercase font-bold mb-1">
                          Grand Total
                        </p>
                        <p className="text-lg sm:text-2xl font-black">
                          ₹{item.grandTotal.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Evidence Photos */}
                    {item.evidencePhotos && item.evidencePhotos.length > 0 && (
                      <div className="mt-3 sm:mt-4">
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 sm:mb-2 uppercase">
                          Evidence:
                        </p>
                        <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-1 sm:pb-2">
                          {item.evidencePhotos.map((photo, idx) => (
                            <a
                              key={idx}
                              href={photo}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block h-14 w-12 sm:h-16 sm:w-16 flex-shrink-0 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 hover:opacity-80 transition-opacity"
                            >
                              <img
                                src={photo}
                                alt={`Evidence ${idx + 1}`}
                                className="h-full w-full object-cover"
                              />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {(item.remarks || item.adminRemarks) && (
                      <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-3">
                        {item.remarks && (
                          <div className="flex items-start gap-2 text-xs sm:text-sm text-red-600 dark:text-red-300 bg-red-50 dark:bg-red-900/20 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-red-100 dark:border-red-800/30">
                            <AlertCircle
                              size={14}
                              sm:size={16}
                              className="mt-0.5 flex-shrink-0"
                            />
                            <p>
                              <strong>Validator:</strong> {item.remarks}
                            </p>
                          </div>
                        )}
                        {item.adminRemarks && (
                          <div className="flex items-start gap-2 text-xs sm:text-sm text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/20 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-indigo-100 dark:border-indigo-800/30">
                            <AlertCircle
                              size={14}
                              sm:size={16}
                              className="mt-0.5 flex-shrink-0"
                            />
                            <p>
                              <strong>Admin:</strong> {item.adminRemarks}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions Section */}
                  <div className="flex flex-row md:flex-col justify-center gap-3 md:border-l md:border-slate-100 dark:md:border-slate-700 md:pl-6 min-w-[140px]">
                    {item.status === "Pending" ? (
                      <>
                        <button
                          onClick={() => handleStatus(item.id, "Approved")}
                          className="flex-1 md:flex-none bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-3 rounded-xl font-bold transition-all hover:scale-105 shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2"
                        >
                          <Check size={18} /> Approve
                        </button>
                        <button
                          onClick={() => setRejectModal(item.id)}
                          className="flex-1 md:flex-none bg-rose-100 hover:bg-rose-200 dark:bg-rose-900/30 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-300 px-4 py-3 rounded-xl font-bold transition-all hover:scale-105 flex items-center justify-center gap-2"
                        >
                          <X size={18} /> Reject
                        </button>
                      </>
                    ) : (
                      <div
                        className={`px-4 py-2 rounded-xl font-bold text-center text-sm capitalize border flex items-center justify-center gap-2
                                    ${
                                      item.status === "Approved"
                                        ? "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/30"
                                        : "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/30"
                                    }
                                `}
                      >
                        {item.status === "Approved" ? (
                          <Check size={14} />
                        ) : (
                          <X size={14} />
                        )}
                        {item.status}
                      </div>
                    )}
                  </div>
                </div>
              ))
          )}
        </div>
      </main>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-200 border border-slate-100 dark:border-slate-700">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Reject Submission
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
              Please provide a reason for rejection so the supervisor can
              correct it.
            </p>

            <textarea
              className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 dark:text-white h-32 resize-none placeholder:text-slate-400 mb-6"
              placeholder="Enter remarks..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            ></textarea>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setRejectModal(null);
                  setRejectReason("");
                }}
                className="flex-1 py-3.5 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleStatus(rejectModal, "Rejected", rejectReason)
                }
                disabled={!rejectReason.trim()}
                className="flex-1 py-3.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-rose-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
