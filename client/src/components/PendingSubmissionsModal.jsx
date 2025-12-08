import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { X, Clock, AlertCircle, User } from "lucide-react";
import axios from "axios";
import { API_ENDPOINTS } from "../config/api";

export default function PendingSubmissionsModal({ onClose }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingSubmissions();
  }, []);

  const fetchPendingSubmissions = async () => {
    try {
      // Fetch all submissions and filter for Pending, or use backend filter
      const res = await axios.get(
        `${API_ENDPOINTS.submissions}?status=Pending`
      );
      setSubmissions(res.data);
    } catch (err) {
      console.error("Error fetching pending submissions:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 transition-all">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] sm:h-[80vh] flex flex-col animate-in fade-in zoom-in duration-200 border border-slate-100 dark:border-slate-700">
        <div className="flex justify-between items-center p-3 sm:p-4 lg:p-6 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-amber-100 dark:bg-amber-900/30 p-1.5 sm:p-2 rounded-lg text-amber-600 dark:text-amber-400">
              <Clock size={16} sm:size-20 lg:size-24 />
            </div>
            <div>
              <h2 className="text-base sm:text-lg lg:text-xl font-bold text-slate-800 dark:text-white">
                Pending Tasks
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Awaiting validation from team members
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
          >
            <X
              size={16}
              sm:size-20
              className="text-slate-500 dark:text-slate-400"
            />
          </button>
        </div>

        <div className="flex-1 overflow-hidden p-2 sm:p-4 lg:p-6">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-amber-600"></div>
            </div>
          ) : submissions.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-slate-400 dark:text-slate-500">
              <Clock size={32} sm:size-48 className="mb-2 sm:mb-4 opacity-20" />
              <p className="text-sm sm:text-base">No pending tasks found.</p>
              <p className="text-xs mt-1">Everything is up to date!</p>
            </div>
          ) : (
            <div className="h-full overflow-auto rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="min-w-full">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-medium sticky top-0 z-10">
                    <tr>
                      <th className="p-2 sm:p-3 lg:p-4 whitespace-nowrap">
                        Date
                      </th>
                      <th className="p-2 sm:p-3 lg:p-4 whitespace-nowrap">
                        Supervisor
                      </th>
                      <th className="p-2 sm:p-3 lg:p-4 whitespace-nowrap">
                        Details
                      </th>
                      <th className="p-2 sm:p-3 lg:p-4 whitespace-nowrap">
                        Status
                      </th>
                      <th className="p-2 sm:p-3 lg:p-4 whitespace-nowrap bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-400 border-l border-amber-100 dark:border-amber-800/30">
                        Action From
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {submissions
                      .slice()
                      .reverse()
                      .map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors"
                        >
                          <td className="p-2 sm:p-3 lg:p-4">
                            <div className="font-medium text-slate-800 dark:text-white text-xs sm:text-sm">
                              {new Date(item.date).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-slate-400 dark:text-slate-500 hidden sm:block">
                              {new Date(item.date).toLocaleTimeString()}
                            </div>
                          </td>
                          <td className="p-2 sm:p-3 lg:p-4">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-bold">
                                <User size={10} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-medium text-slate-800 dark:text-white text-xs sm:text-sm truncate">
                                  {item.supervisorName || "Unknown"}
                                </div>
                                <div className="text-xs text-slate-400 dark:text-slate-500 hidden sm:block">
                                  ID: {item.supervisorId}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-2 sm:p-3 lg:p-4">
                            <div className="space-y-1 min-w-0">
                              <div className="text-xs">
                                <span className="text-slate-500 dark:text-slate-400">
                                  Sugar:
                                </span>{" "}
                                <span className="font-mono font-medium dark:text-slate-200">
                                  {item.sugarQty}kg
                                </span>
                              </div>
                              <div className="text-xs">
                                <span className="text-slate-500 dark:text-slate-400">
                                  Salt:
                                </span>{" "}
                                <span className="font-mono font-medium dark:text-slate-200">
                                  {item.saltQty}kg
                                </span>
                              </div>
                              {item.evidencePhotos &&
                                item.evidencePhotos.length > 0 && (
                                  <div className="text-xs flex items-center gap-1 mt-1">
                                    <span className="text-slate-500 dark:text-slate-400">
                                      Evidence:
                                    </span>
                                    <div className="flex -space-x-1">
                                      {item.evidencePhotos
                                        .slice(0, 3)
                                        .map((photo, idx) => (
                                          <a
                                            key={idx}
                                            href={photo}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-block h-4 w-4 sm:h-5 sm:w-5 rounded-md ring-1 ring-white dark:ring-slate-800 overflow-hidden"
                                          >
                                            <img
                                              src={photo}
                                              alt="Evidence"
                                              className="h-full w-full object-cover"
                                            />
                                          </a>
                                        ))}
                                      {item.evidencePhotos.length > 3 && (
                                        <span className="text-[10px] text-slate-500 ml-1">
                                          +{item.evidencePhotos.length - 3}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}
                              <div className="font-bold text-slate-800 dark:text-white pt-1 text-xs sm:text-sm">
                                ₹{item.grandTotal.toFixed(2)}
                              </div>
                            </div>
                          </td>
                          <td className="p-2 sm:p-3 lg:p-4">
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/30">
                              <Clock size={10} />
                              <span className="hidden xs:inline">Pending</span>
                              <span className="xs:hidden">P</span>
                            </span>
                          </td>
                          <td className="p-2 sm:p-3 lg:p-4 bg-amber-50/50 dark:bg-amber-900/5 border-l border-amber-100 dark:border-amber-800/30">
                            <div className="flex items-center gap-1 sm:gap-2 text-amber-700 dark:text-amber-400 font-bold animate-pulse-slow">
                              <AlertCircle size={12} />
                              <span className="text-xs sm:text-sm">
                                {item.actionRequiredBy} Team
                              </span>
                            </div>
                            <p className="text-xs text-amber-600/80 dark:text-amber-400/70 mt-1 hidden sm:block">
                              Waiting for validation approval
                            </p>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

PendingSubmissionsModal.propTypes = {
  onClose: PropTypes.func.isRequired,
};
