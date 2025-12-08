import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { X, FileText } from "lucide-react";
import axios from "axios";
import { API_ENDPOINTS } from "../config/api";

export default function ApprovedSubmissionsModal({ onClose }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      // Fetch only approved submissions
      const res = await axios.get(`${API_ENDPOINTS.submissions}?status=Approved`);
      setSubmissions(res.data);
    } catch (err) {
      console.error("Error fetching submissions:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-5xl h-[80vh] flex flex-col animate-in fade-in zoom-in duration-200 border border-slate-100 dark:border-slate-700">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg text-blue-600 dark:text-blue-400">
                <FileText size={24} />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                Approved Submissions
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
          >
            <X size={20} className="text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : submissions.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-slate-400 dark:text-slate-500">
              <FileText size={48} className="mb-4 opacity-20" />
              <p>No approved submissions found.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-medium">
                  <tr>
                    <th className="p-4">Date</th>
                    <th className="p-4">Supervisor</th>
                    <th className="p-4 text-right">Sugar (kg/₹)</th>
                    <th className="p-4 text-right">Salt (kg/₹)</th>
                    <th className="p-4">Evidence</th>
                    <th className="p-4 text-right">Grand Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {submissions.slice().reverse().map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-slate-800 dark:text-white">
                          {new Date(item.date).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-slate-400 dark:text-slate-500">
                          {new Date(item.date).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="p-4 text-slate-700 dark:text-slate-300">
                        {item.supervisorName || "Unknown"}
                      </td>
                      <td className="p-4 text-right">
                        <div className="font-medium text-slate-800 dark:text-white">
                          {item.sugarQty}kg
                        </div>
                        <div className="text-xs text-slate-400 dark:text-slate-500">
                          @ ₹{item.sugarPrice}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="font-medium text-slate-800 dark:text-white">
                          {item.saltQty}kg
                        </div>
                        <div className="text-xs text-slate-400 dark:text-slate-500">
                          @ ₹{item.saltPrice}
                        </div>
                      </td>
                      <td className="p-4">
                        {item.evidencePhotos && item.evidencePhotos.length > 0 ? (
                           <div className="flex -space-x-2 overflow-hidden">
                              {item.evidencePhotos.slice(0, 3).map((photo, idx) => (
                                <a key={idx} href={photo} target="_blank" rel="noopener noreferrer" className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-800 overflow-hidden hover:z-10 hover:scale-110 transition-all">
                                   <img src={photo} alt="Evidence" className="h-full w-full object-cover"/>
                                </a>
                              ))}
                              {item.evidencePhotos.length > 3 && (
                                <span className="inline-flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-800 bg-slate-100 dark:bg-slate-700 text-[10px] font-bold text-slate-500">
                                  +{item.evidencePhotos.length - 3}
                                </span>
                              )}
                           </div>
                        ) : (
                           <span className="text-xs text-slate-400 italic">None</span>
                        )}
                      </td>
                      <td className="p-4 text-right font-bold text-blue-600 dark:text-blue-400">
                        ₹{item.grandTotal.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

ApprovedSubmissionsModal.propTypes = {
  onClose: PropTypes.func.isRequired,
};
