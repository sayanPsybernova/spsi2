import { useState, useEffect } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import AnimatedBackground from "../components/AnimatedBackground";
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
  Briefcase,
  Sparkles,
  ChevronRight,
  ImageIcon,
  Layers,
  ClipboardList,
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

      if (existingPhotos.length > 0) {
        data.append("existingPhotos", JSON.stringify(existingPhotos));
      }

      if (isResubmitting && editingId) {
          data.append("previousSubmissionId", editingId);
          data.append("workOrderId", formData.workOrderId);
          data.append("lineItemId", formData.lineItemId);
      }

      selectedFiles.forEach((file) => {
        data.append("photos", file);
      });

      await axios.post(API_ENDPOINTS.submissions, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire({
        title: "Success!",
        text: isResubmitting ? "Resubmitted successfully!" : "Submitted successfully!",
        icon: "success",
        confirmButtonColor: "#6366f1",
        customClass: {
          popup: 'rounded-3xl',
          confirmButton: 'rounded-xl px-6 py-3 font-semibold'
        }
      });

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
      Swal.fire({
        title: "Error",
        text: err.response?.data?.message || "Error submitting data",
        icon: "error",
        confirmButtonColor: "#ef4444",
        customClass: { popup: 'rounded-3xl' }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (submission) => {
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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 relative">
      <AnimatedBackground variant="mesh" />
      {loading && <Loader text="Submitting..." />}
      <Navbar />

      <main className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <ClipboardList className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Supervisor Portal
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Work
            <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-clip-text text-transparent"> Submissions</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-xl">
            Submit your daily work entries and track their approval status.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

          {/* --- Input Form --- */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 lg:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700/50 sticky top-24 hover:shadow-xl transition-all duration-500">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <motion.div
                  whileHover={{ rotate: 15, scale: 1.1 }}
                  className={`p-3 rounded-2xl shadow-lg ${isResubmitting ? 'bg-gradient-to-br from-amber-500 to-orange-500 shadow-amber-500/30' : 'bg-gradient-to-br from-blue-500 to-cyan-500 shadow-blue-500/30'} text-white`}
                >
                  {isResubmitting ? <Edit2 size={20} /> : <Send size={20} />}
                </motion.div>
                {isResubmitting ? "Resubmit Entry" : "New Entry"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Master Data Selection (Disabled if Resubmitting) */}
                <AnimatePresence>
                  {!isResubmitting && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 block">Work Order</label>
                        <div className="relative group">
                          <select
                            required
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:border-blue-500 dark:text-white appearance-none font-medium transition-all cursor-pointer"
                            value={formData.workOrderId}
                            onChange={(e) => setFormData({...formData, workOrderId: e.target.value, lineItemId: ''})}
                          >
                            <option value="">Select Work Order</option>
                            {workOrders.map(wo => <option key={wo.id} value={wo.id}>{wo.order_number}</option>)}
                          </select>
                          <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-blue-500 transition-colors" size={20} />
                          <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 rotate-90" size={18} />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 block">Line Item</label>
                        <div className="relative group">
                          <select
                            required
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:border-blue-500 dark:text-white appearance-none font-medium transition-all disabled:opacity-50 cursor-pointer"
                            value={formData.lineItemId}
                            onChange={(e) => setFormData({...formData, lineItemId: e.target.value})}
                            disabled={!formData.workOrderId}
                          >
                            <option value="">Select Line Item</option>
                            {lineItems.map(li => <option key={li.id} value={li.id}>{li.name}</option>)}
                          </select>
                          <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-blue-500 transition-colors" size={20} />
                          <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 rotate-90" size={18} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Auto-Fetched Details */}
                <AnimatePresence>
                  {(selectedLineItem || isResubmitting) && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800/30"
                    >
                      {!isResubmitting ? (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs font-bold text-blue-600/70 dark:text-blue-400/70 uppercase">UOM</p>
                            <p className="font-bold text-slate-800 dark:text-white text-lg">{selectedLineItem?.uom}</p>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-blue-600/70 dark:text-blue-400/70 uppercase">Std Manpower</p>
                            <p className="font-bold text-slate-800 dark:text-white text-lg">{selectedLineItem?.standard_manpower}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400">
                          <Edit2 size={18} />
                          <span className="font-bold">Editing Existing Entry</span>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Manual Inputs */}
                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 block">
                      Work Quantity {selectedLineItem?.uom ? `(${selectedLineItem.uom})` : ''}
                    </label>
                    <input
                      required
                      type="number"
                      step="0.01"
                      className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:border-blue-500 dark:text-white font-medium transition-all"
                      placeholder="Enter quantity"
                      value={formData.quantity}
                      onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 block">Actual Manpower</label>
                    <textarea
                      required
                      placeholder="e.g. 1 Supervisor + 5 Labor"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:border-blue-500 dark:text-white resize-none h-24 font-medium transition-all"
                      value={formData.actualManpower}
                      onChange={(e) => setFormData({...formData, actualManpower: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 block">Material Consumed (Optional)</label>
                    <textarea
                      placeholder="e.g. 5 Bags Cement"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:border-blue-500 dark:text-white resize-none h-24 font-medium transition-all"
                      value={formData.materialConsumed}
                      onChange={(e) => setFormData({...formData, materialConsumed: e.target.value})}
                    />
                  </div>
                </div>

                {/* Evidence Upload */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-700/50">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-3 block flex items-center gap-2">
                    <ImageIcon size={14} />
                    Evidence Photos
                  </label>
                  <div className="flex gap-3">
                     <motion.button
                       whileHover={{ scale: 1.02 }}
                       whileTap={{ scale: 0.98 }}
                       type="button"
                       onClick={() => document.getElementById("cam-upload").click()}
                       className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700/50 dark:hover:bg-slate-700 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold transition-all border border-slate-200/50 dark:border-slate-600/50"
                     >
                        <Camera size={18} className="text-blue-500" /> Camera
                     </motion.button>
                     <motion.button
                       whileHover={{ scale: 1.02 }}
                       whileTap={{ scale: 0.98 }}
                       type="button"
                       onClick={() => document.getElementById("file-upload").click()}
                       className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700/50 dark:hover:bg-slate-700 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold transition-all border border-slate-200/50 dark:border-slate-600/50"
                     >
                        <UploadCloud size={18} className="text-blue-500" /> Upload
                     </motion.button>
                  </div>
                  <input id="cam-upload" type="file" capture="environment" accept="image/*" className="hidden" onChange={handleFileChange} />
                  <input id="file-upload" type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />

                  {(existingPhotos.length > 0 || selectedFiles.length > 0) && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-wrap gap-2 mt-4"
                    >
                        {/* Existing Photos (during resubmit) */}
                        {existingPhotos.map((f, i) => (
                          <motion.div
                            key={`exist-${i}`}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden relative border-2 border-blue-500/50 group"
                          >
                             <img src={f.startsWith('http') ? f : f} className="w-full h-full object-cover opacity-80" />
                             <button
                                type="button"
                                onClick={() => removeExistingPhoto(i)}
                                className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                             >
                                <XCircle size={20} />
                             </button>
                          </motion.div>
                        ))}

                        {/* New Photos */}
                        {selectedFiles.map((f, i) => (
                          <motion.div
                            key={i}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden relative group"
                          >
                             <img src={URL.createObjectURL(f)} className="w-full h-full object-cover" />
                             <button
                                type="button"
                                onClick={() => removeNewPhoto(i)}
                                className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                             >
                                <XCircle size={20} />
                             </button>
                          </motion.div>
                        ))}
                    </motion.div>
                  )}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)" }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2 text-white ${
                    isResubmitting
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-amber-500/25'
                      : 'bg-gradient-to-r from-blue-600 to-cyan-500 shadow-blue-500/25'
                  }`}
                >
                  <Send size={20} />
                  {isResubmitting ? "Update Entry" : "Submit Entry"}
                </motion.button>

                {isResubmitting && (
                  <button
                    type="button"
                    onClick={() => { setIsResubmitting(false); setEditingId(null); setExistingPhotos([]); }}
                    className="w-full text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium transition-colors"
                  >
                    Cancel Resubmission
                  </button>
                )}
              </form>
            </div>
          </motion.div>

          {/* --- Submissions List --- */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="lg:col-span-2 space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl text-white shadow-lg shadow-primary-500/20">
                  <Layers size={20} />
                </div>
                My Submissions
              </h2>
              <span className="text-sm font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                {submissions.length} entries
              </span>
            </div>

            {submissions.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-12 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700/50 text-center"
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-20 h-20 mx-auto mb-4 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center"
                >
                  <FileText className="w-10 h-10 text-slate-400" />
                </motion.div>
                <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">No Submissions Yet</h3>
                <p className="text-slate-500">Start by creating your first work entry!</p>
              </motion.div>
            ) : (
              submissions.map((item, idx) => (
                <motion.div
                  key={item.id}
                  variants={itemVariants}
                  className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700/50 relative overflow-hidden group hover:shadow-xl transition-all duration-500"
                >
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-accent-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold mb-2">
                          <Clock size={14} />
                          {new Date(item.created_at).toLocaleDateString()} • {new Date(item.created_at).toLocaleTimeString()}
                        </div>
                        <h3 className="text-lg font-black text-slate-800 dark:text-white">{item.work_order_number}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{item.line_item_name}</p>
                      </div>
                      <StatusBadge status={item.status} />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="p-4 bg-slate-50/80 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                        <p className="text-xs text-slate-500 uppercase font-bold mb-1">Work Done</p>
                        <p className="font-mono font-black text-lg text-slate-700 dark:text-white">{item.quantity} <span className="text-sm font-medium text-slate-500">{item.uom}</span></p>
                      </div>
                      <div className="p-4 bg-slate-50/80 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                        <p className="text-xs text-slate-500 uppercase font-bold mb-1">Manpower</p>
                        <p className="text-sm font-medium text-slate-700 dark:text-white line-clamp-2">{item.actual_manpower}</p>
                      </div>
                    </div>

                    {/* Evidence Photos Display in List */}
                    {item.evidence_photos && item.evidence_photos.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
                          <ImageIcon size={12} />
                          Evidence Photos ({item.evidence_photos.length})
                        </p>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                          {item.evidence_photos.map((photo, idx) => (
                            <a
                              key={idx}
                              href={photo.startsWith('http') ? photo : photo}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block h-16 w-16 flex-shrink-0 rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 hover:border-primary-500 transition-colors"
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
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 bg-red-50 dark:bg-red-900/20 p-5 rounded-2xl border border-red-100 dark:border-red-800/30"
                      >
                        <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold mb-2">
                          <AlertCircle size={18} />
                          <span>Correction Required</span>
                        </div>
                        <p className="text-sm text-red-600 dark:text-red-300 mb-4">{item.remarks}</p>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleEdit(item)}
                          className="px-5 py-2.5 bg-white dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-xl text-sm font-bold border border-red-200 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/70 transition-colors flex items-center gap-2"
                        >
                          <Edit2 size={16} />
                          Edit & Resubmit
                        </motion.button>
                      </motion.div>
                    )}

                    {item.status === "Resubmitted" && (
                      <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800/30">
                        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-bold">
                          <CheckCircle size={18} />
                          <span>Resubmitted for Review</span>
                        </div>
                        <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">A newer version is pending validation.</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    "Pending Validation": {
      bg: "bg-amber-100 dark:bg-amber-900/30",
      text: "text-amber-700 dark:text-amber-400",
      icon: Clock
    },
    "Approved": {
      bg: "bg-emerald-100 dark:bg-emerald-900/30",
      text: "text-emerald-700 dark:text-emerald-400",
      icon: CheckCircle
    },
    "Rejected": {
      bg: "bg-red-100 dark:bg-red-900/30",
      text: "text-red-700 dark:text-red-400",
      icon: XCircle
    },
    "Resubmitted": {
      bg: "bg-blue-100 dark:bg-blue-900/30",
      text: "text-blue-700 dark:text-blue-400",
      icon: Edit2
    },
  };

  const style = styles[status] || styles["Pending Validation"];
  const Icon = style.icon;

  return (
    <motion.span
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`px-3 py-1.5 rounded-full text-xs font-bold ${style.bg} ${style.text} flex items-center gap-1.5`}
    >
      <Icon size={14} />
      {status}
    </motion.span>
  );
}

StatusBadge.propTypes = { status: PropTypes.string.isRequired };
