import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { MessageSquare, User, Calendar, DollarSign } from "lucide-react";
import { API_ENDPOINTS } from "../config/api";

export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState([]);
  const [remarkModal, setRemarkModal] = useState(null);
  const [adminRemark, setAdminRemark] = useState("");

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const res = await axios.get(`${API_ENDPOINTS.submissions}?role=admin`);
      setSubmissions(res.data);
    } catch (err) {
      console.error("Failed to fetch submissions:", err);
    }
  };

  const handleRemark = async () => {
    try {
      await axios.put(
        `${API_ENDPOINTS.submissions}/${remarkModal}/admin-remark`,
        { adminRemarks: adminRemark }
      );
      fetchSubmissions();
      setRemarkModal(null);
      setAdminRemark("");
    } catch (err) {
      console.error("Error adding remark:", err);
      alert("Error adding remark");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      <Navbar />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">
            View all submissions and add administrative remarks.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6 max-h-[70vh] overflow-y-auto">
          {submissions
            .slice()
            .reverse()
            .map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row gap-4 sm:gap-6 transition-colors hover:shadow-md"
              >
                {/* Data Section */}
                <div className="flex-1">
                  <div className="flex justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <User size={16} sm:size={20} />
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white">
                          {item.supervisorName}
                        </h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          {item.supervisorId}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-1 capitalize ${
                          item.status === "Approved"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : item.status === "Rejected"
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        }`}
                      >
                        {item.status}
                      </span>
                      <div className="flex items-center justify-end gap-1 text-xs text-slate-400 dark:text-slate-500">
                        <Calendar size={12} />
                        <p>{new Date(item.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-3 sm:mt-4">
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-2 sm:p-4 rounded-lg sm:rounded-xl border border-slate-100 dark:border-slate-700/50">
                      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">
                        Sugar
                      </p>
                      <p className="text-slate-700 dark:text-slate-200 font-mono text-xs sm:text-sm">
                        {item.sugarQty}kg @ ₹{item.sugarPrice}
                      </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-2 sm:p-4 rounded-lg sm:rounded-xl border border-slate-100 dark:border-slate-700/50">
                      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">
                        Salt
                      </p>
                      <p className="text-slate-700 dark:text-slate-200 font-mono text-xs sm:text-sm">
                        {item.saltQty}kg @ ₹{item.saltPrice}
                      </p>
                    </div>
                    <div className="bg-slate-800 dark:bg-slate-700 p-3 sm:p-4 rounded-lg sm:rounded-xl text-white flex flex-col justify-center items-center shadow-lg shadow-slate-500/10">
                      <p className="text-xs text-slate-300 uppercase font-bold flex items-center gap-1">
                        Total <DollarSign size={10} sm:size={12} />
                      </p>
                      <p className="font-bold text-base sm:text-lg">
                        ₹{item.grandTotal.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 sm:mt-4 flex flex-wrap gap-2 sm:gap-3">
                    {item.remarks && (
                      <div className="text-xs sm:text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 sm:px-3 py-1.5 rounded-lg border border-red-100 dark:border-red-800/30">
                        <span className="font-bold mr-1">Validator:</span>{" "}
                        {item.remarks}
                      </div>
                    )}
                    {item.adminRemarks && (
                      <div className="text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 sm:px-3 py-1.5 rounded-lg border border-indigo-100 dark:border-indigo-800/30">
                        <span className="font-bold mr-1">Admin:</span>{" "}
                        {item.adminRemarks}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Section */}
                <div className="flex items-start justify-end md:pl-4 md:border-l border-slate-100 dark:border-slate-700">
                  <button
                    onClick={() => {
                      setRemarkModal(item.id);
                      setAdminRemark(item.adminRemarks || "");
                    }}
                    className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all flex flex-col items-center gap-1 min-w-[60px] sm:min-w-[80px]"
                  >
                    <MessageSquare size={16} sm:size={20} />
                    <span className="text-xs sm:text-sm font-bold">Remark</span>
                  </button>
                </div>
              </div>
            ))}
        </div>
      </main>

      {/* Remark Modal */}
      {remarkModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 transition-all">
          <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-2xl max-w-md w-full p-4 sm:p-6 animate-in fade-in zoom-in duration-200 border border-slate-100 dark:border-slate-700 max-h-[80vh] sm:max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white mb-4">
              Add Admin Remark
            </h3>

            <textarea
              className="w-full p-3 sm:p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg sm:rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:text-white h-20 sm:h-24 resize-none placeholder:text-slate-400 text-xs sm:text-sm"
              placeholder="Enter note..."
              value={adminRemark}
              onChange={(e) => setAdminRemark(e.target.value)}
            ></textarea>

            <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6">
              <button
                onClick={() => {
                  setRemarkModal(null);
                  setAdminRemark("");
                }}
                className="flex-1 py-2 sm:py-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg sm:rounded-xl font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRemark}
                className="flex-1 py-2 sm:py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg sm:rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/25"
              >
                Save Remark
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
