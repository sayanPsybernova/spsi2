import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import AnimatedBackground from "../components/AnimatedBackground";
import { Check, X, Filter, AlertCircle, Edit2, FileText, Clock, CheckCircle, XCircle, Sparkles, TrendingUp, Users, Package } from "lucide-react";
import { API_ENDPOINTS } from "../config/api";
import Swal from 'sweetalert2';
import Loader from "../components/Loader";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 30 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  }
};

// Status Badge Component
function StatusBadge({ status }) {
  const config = {
    "Pending Validation": {
      icon: Clock,
      gradient: "from-amber-500 to-orange-500",
      bg: "bg-amber-50 dark:bg-amber-900/20",
      border: "border-amber-200 dark:border-amber-700/30",
      text: "text-amber-700 dark:text-amber-300"
    },
    "Approved": {
      icon: CheckCircle,
      gradient: "from-emerald-500 to-green-500",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      border: "border-emerald-200 dark:border-emerald-700/30",
      text: "text-emerald-700 dark:text-emerald-300"
    },
    "Rejected": {
      icon: XCircle,
      gradient: "from-rose-500 to-red-500",
      bg: "bg-rose-50 dark:bg-rose-900/20",
      border: "border-rose-200 dark:border-rose-700/30",
      text: "text-rose-700 dark:text-rose-300"
    }
  };

  const { icon: Icon, gradient, bg, border, text } = config[status] || config["Pending Validation"];

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm ${bg} ${border} ${text} border`}
    >
      <div className={`p-1 rounded-lg bg-gradient-to-r ${gradient}`}>
        <Icon size={12} className="text-white" />
      </div>
      {status === "Pending Validation" ? "Pending" : status}
    </motion.div>
  );
}

// Stat Card Component
function StatCard({ icon: Icon, label, value, gradient, delay = 0 }) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.02, y: -5 }}
      className="relative group"
    >
      <div className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500`} />
      <div className="relative glass-card p-5 rounded-2xl border border-white/20 dark:border-slate-700/50">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function ValidatorDashboard() {
  const [submissions, setSubmissions] = useState([]);
  const [filter, setFilter] = useState("Pending");
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editQuantity, setEditQuantity] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const res = await axios.get(`${API_ENDPOINTS.submissions}?role=validator`);
      setSubmissions(res.data);
    } catch (err) {
      console.error("Failed to fetch submissions:", err);
    }
  };

  const handleStatus = async (id, status, remarks = "") => {
    setLoading(true);
    try {
      const payload = { status, remarks };
      if (editingId === id && editQuantity) {
        payload.quantity = editQuantity;
      }

      await axios.put(`${API_ENDPOINTS.submissions}/${id}/validate`, payload);
      await fetchSubmissions();
      setRejectModal(null);
      setRejectReason("");
      setEditingId(null);
      setEditQuantity("");
    } catch (err) {
      console.error("Error updating status:", err);
      Swal.fire("Error", "Error updating status", "error");
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (sub) => {
    setEditingId(sub.id);
    setEditQuantity(sub.quantity);
  };

  const filteredSubmissions =
    filter === "All"
      ? submissions
      : submissions.filter((s) => s.status === (filter === "Pending" ? "Pending Validation" : filter));

  // Stats calculation
  const stats = {
    pending: submissions.filter(s => s.status === "Pending Validation").length,
    approved: submissions.filter(s => s.status === "Approved").length,
    rejected: submissions.filter(s => s.status === "Rejected").length,
    total: submissions.length
  };

  const filterOptions = [
    { key: "Pending", icon: Clock, gradient: "from-amber-500 to-orange-500" },
    { key: "Approved", icon: CheckCircle, gradient: "from-emerald-500 to-green-500" },
    { key: "Rejected", icon: XCircle, gradient: "from-rose-500 to-red-500" },
    { key: "All", icon: FileText, gradient: "from-primary-500 to-accent-500" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      {loading && <Loader text="Processing..." />}
      <AnimatedBackground variant="mesh" />
      <Navbar />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 shadow-lg shadow-primary-500/30">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 via-primary-600 to-accent-600 dark:from-white dark:via-primary-400 dark:to-accent-400 bg-clip-text text-transparent">
                  Validator Dashboard
                </h1>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-base ml-14">
                Review, edit, and validate field data submissions
              </p>
            </div>

            {/* Filter Tabs */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex p-1.5 rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg"
            >
              {filterOptions.map(({ key, icon: Icon, gradient }) => (
                <motion.button
                  key={key}
                  onClick={() => setFilter(key)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                    filter === key
                      ? "text-white shadow-lg"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  }`}
                >
                  {filter === key && (
                    <motion.div
                      layoutId="activeFilter"
                      className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-xl`}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon size={16} />
                    {key}
                  </span>
                </motion.button>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <StatCard icon={Clock} label="Pending" value={stats.pending} gradient="from-amber-500 to-orange-500" />
          <StatCard icon={CheckCircle} label="Approved" value={stats.approved} gradient="from-emerald-500 to-green-500" />
          <StatCard icon={XCircle} label="Rejected" value={stats.rejected} gradient="from-rose-500 to-red-500" />
          <StatCard icon={FileText} label="Total" value={stats.total} gradient="from-primary-500 to-accent-500" />
        </motion.div>

        {/* Submissions Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredSubmissions.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-20 glass-card rounded-3xl border border-white/20 dark:border-slate-700/50"
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 mb-6"
                >
                  <Filter className="w-10 h-10 text-slate-400 dark:text-slate-500" />
                </motion.div>
                <p className="text-xl font-semibold text-slate-600 dark:text-slate-300 mb-2">
                  No {filter.toLowerCase()} submissions
                </p>
                <p className="text-slate-400 dark:text-slate-500">
                  Submissions will appear here once available
                </p>
              </motion.div>
            ) : (
              filteredSubmissions
                .slice()
                .reverse()
                .map((item, index) => {
                  const isEditing = editingId === item.id;
                  const displayQty = isEditing ? editQuantity : item.quantity;
                  const displayRevenue = (parseFloat(displayQty || 0) * (item.snapshot_rate || 0)).toFixed(2);

                  return (
                    <motion.div
                      key={item.id}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                      layout
                      whileHover={{ y: -4 }}
                      className="group relative"
                    >
                      {/* Glow Effect */}
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500/20 via-accent-500/20 to-primary-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />

                      <div className="relative glass-card p-6 rounded-3xl border border-white/30 dark:border-slate-700/50 overflow-hidden">
                        {/* Decorative gradient */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-500/5 to-accent-500/5 rounded-full -translate-y-32 translate-x-32" />

                        <div className="relative flex flex-col lg:flex-row gap-6">
                          {/* Data Section */}
                          <div className="flex-1 space-y-6">
                            {/* Header */}
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                                  {item.supervisor_name || item.supervisorName}
                                </h3>
                                <div className="space-y-0.5">
                                  <p className="text-sm text-slate-500 dark:text-slate-400">
                                    <span className="opacity-70">Email:</span> {item.supervisor_email || "N/A"}
                                  </p>
                                  <p className="text-sm text-slate-500 dark:text-slate-400">
                                    <span className="opacity-70">ID:</span>{" "}
                                    <span className="font-mono text-primary-600 dark:text-primary-400">
                                      {item.supervisor_emp_id || item.supervisorId || "N/A"}
                                    </span>
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                                  {new Date(item.created_at).toLocaleDateString()}
                                </p>
                                <p className="text-xs text-slate-400 dark:text-slate-500">
                                  {new Date(item.created_at).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>

                            {/* Info Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {/* Work Order Info */}
                              <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 border border-slate-200/50 dark:border-slate-700/50"
                              >
                                <div className="flex items-center gap-2 mb-2">
                                  <Package className="w-4 h-4 text-primary-500" />
                                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Work Order</p>
                                </div>
                                <p className="text-lg font-bold font-mono text-slate-800 dark:text-white">
                                  {item.work_order_number}
                                </p>
                                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                                  {item.line_item_name}
                                </p>
                              </motion.div>

                              {/* Revenue */}
                              <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-200/50 dark:border-emerald-700/30"
                              >
                                <div className="flex items-center gap-2 mb-2">
                                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Revenue</p>
                                </div>
                                <div className="flex justify-between items-end">
                                  <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                      Rate: ₹{item.snapshot_rate}/{item.uom}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                      Qty: {displayQty}
                                    </p>
                                  </div>
                                  <p className="text-2xl font-black bg-gradient-to-r from-emerald-600 to-green-600 dark:from-emerald-400 dark:to-green-400 bg-clip-text text-transparent">
                                    ₹{displayRevenue}
                                  </p>
                                </div>
                              </motion.div>
                            </div>

                            {/* Quantity & Manpower */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              {/* Quantity Edit */}
                              <div className="p-4 rounded-2xl bg-white/50 dark:bg-slate-800/30 border border-slate-200/50 dark:border-slate-700/30">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                  Quantity ({item.uom})
                                  {item.status === 'Pending Validation' && !isEditing && (
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => startEditing(item)}
                                      className="p-1.5 rounded-lg text-slate-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
                                    >
                                      <Edit2 size={14} />
                                    </motion.button>
                                  )}
                                </label>
                                {isEditing ? (
                                  <motion.input
                                    initial={{ scale: 0.95 }}
                                    animate={{ scale: 1 }}
                                    type="number"
                                    className="w-full px-3 py-2 mt-2 bg-white dark:bg-slate-900 border-2 border-primary-400 dark:border-primary-500 rounded-xl outline-none focus:ring-4 focus:ring-primary-500/20 transition-all font-bold text-lg"
                                    value={editQuantity}
                                    onChange={(e) => setEditQuantity(e.target.value)}
                                    autoFocus
                                  />
                                ) : (
                                  <p className="text-2xl font-bold text-slate-800 dark:text-white mt-2">
                                    {item.quantity}
                                  </p>
                                )}
                              </div>

                              {/* Standard Manpower */}
                              <div className="p-4 rounded-2xl bg-white/50 dark:bg-slate-800/30 border border-slate-200/50 dark:border-slate-700/30">
                                <div className="flex items-center gap-2 mb-2">
                                  <Users className="w-4 h-4 text-slate-400" />
                                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Std. Manpower</p>
                                </div>
                                <p className="text-2xl font-bold text-slate-800 dark:text-white">
                                  {item.snapshot_standard_manpower || 'N/A'}
                                </p>
                              </div>

                              {/* Actual Manpower */}
                              <div className="p-4 rounded-2xl bg-white/50 dark:bg-slate-800/30 border border-slate-200/50 dark:border-slate-700/30">
                                <div className="flex items-center gap-2 mb-2">
                                  <Users className="w-4 h-4 text-primary-500" />
                                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Actual Manpower</p>
                                </div>
                                <p className="text-2xl font-bold text-slate-800 dark:text-white">
                                  {item.actual_manpower}
                                </p>
                              </div>
                            </div>

                            {/* Materials */}
                            {item.material_consumed && (
                              <div className="p-4 rounded-2xl bg-white/50 dark:bg-slate-800/30 border border-slate-200/50 dark:border-slate-700/30">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Material Consumed</p>
                                <p className="text-slate-700 dark:text-slate-300">{item.material_consumed}</p>
                              </div>
                            )}

                            {/* Evidence Photos */}
                            {item.evidence_photos && item.evidence_photos.length > 0 && (
                              <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Evidence Photos</p>
                                <div className="flex gap-3 overflow-x-auto pb-2">
                                  {item.evidence_photos.map((photo, idx) => (
                                    <motion.a
                                      key={idx}
                                      href={photo}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      whileHover={{ scale: 1.05, y: -2 }}
                                      className="block h-20 w-20 flex-shrink-0 rounded-xl overflow-hidden border-2 border-white dark:border-slate-700 shadow-lg hover:shadow-xl transition-shadow"
                                    >
                                      <img
                                        src={photo}
                                        alt={`Evidence ${idx + 1}`}
                                        className="h-full w-full object-cover"
                                      />
                                    </motion.a>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Remarks */}
                            {(item.remarks || item.adminRemarks) && (
                              <div className="space-y-3">
                                {item.remarks && (
                                  <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex items-start gap-3 p-4 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200/50 dark:border-rose-800/30"
                                  >
                                    <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                      <p className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase mb-1">Validator Remarks</p>
                                      <p className="text-sm text-rose-700 dark:text-rose-300">{item.remarks}</p>
                                    </div>
                                  </motion.div>
                                )}
                                {item.adminRemarks && (
                                  <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex items-start gap-3 p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200/50 dark:border-indigo-800/30"
                                  >
                                    <AlertCircle className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                      <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase mb-1">Admin Remarks</p>
                                      <p className="text-sm text-indigo-700 dark:text-indigo-300">{item.adminRemarks}</p>
                                    </div>
                                  </motion.div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Actions Section */}
                          <div className="flex flex-row lg:flex-col justify-center gap-3 lg:border-l lg:border-slate-200/50 dark:lg:border-slate-700/50 lg:pl-6 lg:min-w-[160px]">
                            {item.status === "Pending Validation" ? (
                              <>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleStatus(item.id, "Approved")}
                                  className="flex-1 lg:flex-none relative overflow-hidden bg-gradient-to-r from-emerald-500 to-green-500 text-white px-6 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 flex items-center justify-center gap-2 group"
                                >
                                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                                  <Check size={20} />
                                  <span>{isEditing ? 'Save & Approve' : 'Approve'}</span>
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => setRejectModal(item.id)}
                                  className="flex-1 lg:flex-none bg-rose-100 hover:bg-rose-200 dark:bg-rose-900/30 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-300 px-6 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 border border-rose-200 dark:border-rose-800/30"
                                >
                                  <X size={20} />
                                  <span>Reject</span>
                                </motion.button>
                              </>
                            ) : (
                              <StatusBadge status={item.status} />
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
            )}
          </AnimatePresence>
        </motion.div>
      </main>

      {/* Reject Modal */}
      <AnimatePresence>
        {rejectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={() => {
              setRejectModal(null);
              setRejectReason("");
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              {/* Animated border gradient */}
              <div className="absolute inset-0 p-[1px] rounded-3xl bg-gradient-to-br from-rose-500 via-red-500 to-orange-500">
                <div className="absolute inset-[1px] bg-white dark:bg-slate-900 rounded-3xl" />
              </div>

              <div className="relative p-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-rose-500 to-red-500 shadow-lg shadow-rose-500/30">
                    <XCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                      Reject Submission
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Provide a reason for rejection
                    </p>
                  </div>
                </div>

                {/* Textarea */}
                <div className="mb-6">
                  <textarea
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-500/20 dark:text-white h-32 resize-none placeholder:text-slate-400 transition-all"
                    placeholder="Enter your remarks..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    autoFocus
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setRejectModal(null);
                      setRejectReason("");
                    }}
                    className="flex-1 py-4 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl font-bold transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleStatus(rejectModal, "Rejected", rejectReason)}
                    disabled={!rejectReason.trim()}
                    className="flex-1 py-4 bg-gradient-to-r from-rose-500 to-red-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-rose-500/30 hover:shadow-xl hover:shadow-rose-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
                  >
                    <X size={18} />
                    Confirm Reject
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
