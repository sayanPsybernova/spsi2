import { useState, useEffect } from "react";
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
  FileText,
  Briefcase
} from "lucide-react";
import { API_ENDPOINTS } from "../config/api";
import Swal from 'sweetalert2';
import Loader from "../components/Loader";

export default function SupervisorDashboard() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  
  // Master Data State
  const [workOrders, setWorkOrders] = useState([]);
  const [lineItems, setLineItems] = useState([]);
  
  // Form State
  const [formData, setFormData] = useState({
    workOrderId: "",
    lineItemId: "",
    quantity: "",
    actualManpower: "",
    materialConsumed: "",
  });
  
  // Derived State for Display
  const [selectedLineItem, setSelectedLineItem] = useState(null);

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [isResubmitting, setIsResubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSubmissions();
    fetchWorkOrders();
  }, [user]);

  // Fetch Line Items when WO changes
  useEffect(() => {
    if (formData.workOrderId) {
      fetchLineItems(formData.workOrderId);
    } else {
      setLineItems([]);
    }
  }, [formData.workOrderId]);

  // Update details when Line Item changes
  useEffect(() => {
    if (formData.lineItemId) {
      const item = lineItems.find(li => li.id === formData.lineItemId);
      setSelectedLineItem(item || null);
    } else {
      setSelectedLineItem(null);
    }
  }, [formData.lineItemId, lineItems]);

  const fetchSubmissions = async () => {
    if (!user) return;
    try {
      const userId = user.userId || user.email;
      const res = await axios.get(
        `${API_ENDPOINTS.submissions}?role=supervisor&userId=${userId}`
      );
      setSubmissions(res.data);
    } catch (err) {
      console.error("Failed to fetch submissions:", err);
    }
  };

  const fetchWorkOrders = async () => {
    try {
      // Assuming endpoint follows same pattern or using uploads base trick if needed
      const res = await axios.get(`${API_ENDPOINTS.uploads}/../api/work-orders`);
      setWorkOrders(res.data);
    } catch (err) {
      console.error("Failed to fetch work orders:", err);
    }
  };

  const fetchLineItems = async (woId) => {
    try {
      const res = await axios.get(`${API_ENDPOINTS.uploads}/../api/line-items?workOrderId=${woId}`);
      setLineItems(res.data);
    } catch (err) {
      console.error("Failed to fetch line items:", err);
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

  const removeNewPhoto = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingPhoto = (index) => {
    setExistingPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const supervisorId = user.userId || user.email;
      const data = new FormData();
      
      data.append("supervisorId", supervisorId);
      data.append("supervisorName", user.name);
      
      if (!isResubmitting) {
         data.append("workOrderId", formData.workOrderId);
         data.append("lineItemId", formData.lineItemId);
      }
      
      data.append("quantity", formData.quantity);
      data.append("actualManpower", formData.actualManpower);
      data.append("materialConsumed", formData.materialConsumed);

      // Pass existing photos as JSON string if any
      if (existingPhotos.length > 0) {
        data.append("existingPhotos", JSON.stringify(existingPhotos));
      }

      if (isResubmitting && editingId) {
          data.append("previousSubmissionId", editingId);
          // If we are resubmitting, we must ensure workOrderId and lineItemId are passed
          // But formData should have them populated from handleEdit
          data.append("workOrderId", formData.workOrderId);
          data.append("lineItemId", formData.lineItemId);
      }

      selectedFiles.forEach((file) => {
        data.append("photos", file);
      });

      // ALWAYS Create New Submission (POST) to preserve history
      await axios.post(API_ENDPOINTS.submissions, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Swal.fire("Success", isResubmitting ? "Resubmitted successfully!" : "Submitted successfully!", "success");

      if (isResubmitting) {
        setIsResubmitting(false);
        setEditingId(null);
        setExistingPhotos([]);
      }

      setFormData({
        workOrderId: "",
        lineItemId: "",
        quantity: "",
        actualManpower: "",
        materialConsumed: "",
      });
      setSelectedFiles([]);
      await fetchSubmissions();
    } catch (err) {
      console.error("Error submitting data:", err);
      Swal.fire("Error", err.response?.data?.message || "Error submitting data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (submission) => {
    console.log("Editing submission:", submission); // Debugging line
    setFormData({
      workOrderId: submission.work_order_id,
      lineItemId: submission.line_item_id,
      quantity: submission.quantity,
      actualManpower: submission.actual_manpower,
      materialConsumed: submission.material_consumed,
    });
    setEditingId(submission.id);
    setExistingPhotos(submission.evidence_photos || []);
    setIsResubmitting(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      {loading && <Loader />}
      <Navbar />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* --- Input Form --- */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 sticky top-24">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                {isResubmitting ? <Edit2 className="text-blue-500" /> : <Send className="text-blue-500" />}
                {isResubmitting ? "Resubmit Entry" : "New Entry"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Master Data Selection (Disabled if Resubmitting) */}
                {!isResubmitting && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Work Order</label>
                      <div className="relative">
                        <select
                          required
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white appearance-none"
                          value={formData.workOrderId}
                          onChange={(e) => setFormData({...formData, workOrderId: e.target.value, lineItemId: ''})}
                        >
                          <option value="">Select Work Order</option>
                          {workOrders.map(wo => <option key={wo.id} value={wo.id}>{wo.order_number}</option>)}
                        </select>
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Line Item</label>
                      <div className="relative">
                        <select
                          required
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white appearance-none"
                          value={formData.lineItemId}
                          onChange={(e) => setFormData({...formData, lineItemId: e.target.value})}
                          disabled={!formData.workOrderId}
                        >
                          <option value="">Select Line Item</option>
                          {lineItems.map(li => <option key={li.id} value={li.id}>{li.name}</option>)}
                        </select>
                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Auto-Fetched Details */}
                {(selectedLineItem || isResubmitting) && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30 text-sm">
                    {!isResubmitting && (
                      <>
                        <div className="flex justify-between mb-2">
                          <span className="text-slate-500 dark:text-slate-400">UOM:</span>
                          <span className="font-bold text-slate-800 dark:text-white">{selectedLineItem?.uom}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Std Manpower:</span>
                          <span className="font-bold text-slate-800 dark:text-white text-right">{selectedLineItem?.standard_manpower}</span>
                        </div>
                      </>
                    )}
                    {isResubmitting && <p className="text-blue-600 dark:text-blue-400 text-center font-bold">Editing Existing Entry</p>}
                  </div>
                )}

                {/* Manual Inputs */}
                <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-700">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                      Work Quantity {selectedLineItem?.uom ? `(${selectedLineItem.uom})` : ''}
                    </label>
                    <input
                      required
                      type="number"
                      step="0.01"
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                      value={formData.quantity}
                      onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Actual Manpower</label>
                    <textarea
                      required
                      placeholder="e.g. 1 Supervisor + 5 Labor"
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white resize-none h-20"
                      value={formData.actualManpower}
                      onChange={(e) => setFormData({...formData, actualManpower: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Material Consumed (Optional)</label>
                    <textarea
                      placeholder="e.g. 5 Bags Cement"
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white resize-none h-20"
                      value={formData.materialConsumed}
                      onChange={(e) => setFormData({...formData, materialConsumed: e.target.value})}
                    />
                  </div>
                </div>

                {/* Evidence Upload */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Evidence Photos</label>
                  <div className="flex gap-2">
                     <button type="button" onClick={() => document.getElementById("cam-upload").click()} className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold transition-colors">
                        <Camera size={18} /> Camera
                     </button>
                     <button type="button" onClick={() => document.getElementById("file-upload").click()} className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold transition-colors">
                        <UploadCloud size={18} /> Upload
                     </button>
                  </div>
                  <input id="cam-upload" type="file" capture="environment" accept="image/*" className="hidden" onChange={handleFileChange} />
                  <input id="file-upload" type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                      {/* Existing Photos (during resubmit) */}
                      {existingPhotos.map((f, i) => (
                        <div key={`exist-${i}`} className="w-16 h-16 rounded-lg bg-slate-100 overflow-hidden relative border border-blue-500/50 group">
                           <img src={f.startsWith('http') ? f : f} className="w-full h-full object-cover opacity-80" />
                           <button
                              type="button"
                              onClick={() => removeExistingPhoto(i)}
                              className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                           >
                              <XCircle size={12} />
                           </button>
                        </div>
                      ))}
                      
                      {/* New Photos */}
                      {selectedFiles.map((f, i) => (
                        <div key={i} className="w-16 h-16 rounded-lg bg-slate-100 overflow-hidden relative group">
                           <img src={URL.createObjectURL(f)} className="w-full h-full object-cover" />
                           <button
                              type="button"
                              onClick={() => removeNewPhoto(i)}
                              className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                           >
                              <XCircle size={12} />
                           </button>
                        </div>
                      ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <Send size={20} />
                  {isResubmitting ? "Update Entry" : "Submit Entry"}
                </button>
                
                {isResubmitting && (
                  <button type="button" onClick={() => { setIsResubmitting(false); setEditingId(null); }} className="w-full text-sm text-slate-500 underline">
                    Cancel Resubmission
                  </button>
                )}
              </form>
            </div>
          </div>

          {/* --- Submissions List --- */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">My Submissions</h2>
            
            {submissions.map((item) => (
              <div key={item.id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold mb-1">
                      <Clock size={12} />
                      {new Date(item.created_at).toLocaleDateString()} • {new Date(item.created_at).toLocaleTimeString()}
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">{item.work_order_number}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{item.line_item_name}</p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Work Done</p>
                    <p className="font-mono font-bold text-slate-700 dark:text-white">{item.quantity} {item.uom}</p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Manpower</p>
                    <p className="text-sm text-slate-700 dark:text-white">{item.actual_manpower}</p>
                  </div>
                </div>

                {/* Evidence Photos Display in List */}
                {item.evidence_photos && item.evidence_photos.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-2">Evidence Photos</p>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {item.evidence_photos.map((photo, idx) => (
                        <a 
                          key={idx} 
                          href={photo.startsWith('http') ? photo : photo}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="block h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 hover:opacity-80 transition-opacity"
                        >
                          <img 
                            src={photo.startsWith('http') ? photo : photo} 
                            alt={`Evidence ${idx + 1}`} 
                            className="h-full w-full object-cover" 
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {item.status === "Rejected" && (
                  <div className="mb-4 bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-800/30">
                    <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold mb-2">
                      <AlertCircle size={18} />
                      <span>Correction Required</span>
                    </div>
                    <p className="text-sm text-red-600 dark:text-red-300 mb-3">{item.remarks}</p>
                    <button onClick={() => handleEdit(item)} className="px-4 py-2 bg-white dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg text-xs font-bold border border-red-200 dark:border-red-700">
                      Edit & Resubmit
                    </button>
                  </div>
                )}
                
                {item.status === "Resubmitted" && (
                    <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30">
                        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-bold">
                            <CheckCircle size={18} />
                            <span>Resubmitted for Review</span>
                        </div>
                        <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">A newer version of this entry is pending validation.</p>
                    </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    "Pending Validation": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    "Approved": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    "Rejected": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    "Resubmitted": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold ${styles[status] || styles["Pending Validation"]}`}>
      {status}
    </span>
  );
}

StatusBadge.propTypes = { status: PropTypes.string.isRequired };
