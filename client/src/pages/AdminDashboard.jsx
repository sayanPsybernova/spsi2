import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import AnimatedBackground from "../components/AnimatedBackground";
import UserFormModal from "../components/UserFormModal";
import DashboardOverview from "../components/DashboardOverview";
import ExportDataModal from "../components/ExportDataModal";
import {
  MessageSquare,
  User,
  Calendar,
  Plus,
  Briefcase,
  Layers,
  Database,
  FileText,
  Users,
  UserPlus,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  LayoutDashboard,
  ChevronRight,
  Download,
  Sparkles,
  TrendingUp,
  Package,
  Shield,
  CheckCircle,
  Activity
} from "lucide-react";
import { API_ENDPOINTS } from "../config/api";
import Swal from 'sweetalert2';
import Loader from "../components/Loader";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 200, damping: 20 } }
};

const pageTransition = {
  initial: { opacity: 0, x: -30 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 30 },
  transition: { duration: 0.4, ease: "easeOut" }
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [submissions, setSubmissions] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [lineItems, setLineItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [remarkModal, setRemarkModal] = useState(null);
  const [adminRemark, setAdminRemark] = useState("");

  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState("supervisor");
  const [editingUser, setEditingUser] = useState(null);
  const [visiblePasswordId, setVisiblePasswordId] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);

  const [newWO, setNewWO] = useState("");
  const [newLineItem, setNewLineItem] = useState({
    workOrderId: "",
    name: "",
    uom: "",
    rate: "",
    standardManpower: "",
  });

  useEffect(() => {
    fetchSubmissions();
    fetchMasterData();
    fetchUsers();
  }, []);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_ENDPOINTS.submissions}?role=admin`);
      setSubmissions(res.data);
    } catch (err) {
      console.error("Failed to fetch submissions:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMasterData = async () => {
    try {
      const [woRes, liRes] = await Promise.all([
        axios.get(API_ENDPOINTS.workOrders),
        axios.get(API_ENDPOINTS.lineItems),
      ]);
      setWorkOrders(woRes.data);
      setLineItems(liRes.data);
    } catch (err) {
      console.error("Failed to fetch master data:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(API_ENDPOINTS.users);
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  const handleCreateWO = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(API_ENDPOINTS.workOrders, { orderNumber: newWO });
      setNewWO("");
      await fetchMasterData();
      Swal.fire("Success", "Work Order Created", "success");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Error creating Work Order", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLineItem = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(API_ENDPOINTS.lineItems, newLineItem);
      setNewLineItem({
        workOrderId: "",
        name: "",
        uom: "",
        rate: "",
        standardManpower: "",
      });
      await fetchMasterData();
      Swal.fire("Success", "Line Item Created", "success");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Error creating Line Item", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#6366f1',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        await axios.delete(`${API_ENDPOINTS.users}/${id}`);
        await fetchUsers();
        Swal.fire('Deleted!', 'User has been deleted.', 'success');
      } catch (err) {
        console.error("Error deleting user:", err);
        Swal.fire('Error', 'Failed to delete user', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRemark = async () => {
    setLoading(true);
    try {
      await axios.put(
        `${API_ENDPOINTS.submissions}/${remarkModal}/admin-remark`,
        { adminRemarks: adminRemark }
      );
      await fetchSubmissions();
      setRemarkModal(null);
      setAdminRemark("");
    } catch (err) {
      console.error("Error adding remark:", err);
      Swal.fire("Error", "Error adding remark", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      {loading && <Loader text="Processing..." />}
      <AnimatedBackground variant="aurora" />
      <Navbar />

      <main className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* LEFT COLUMN: Main Content */}
          <div className="lg:w-3/4 order-2 lg:order-1">
            <AnimatePresence mode="wait">

              {/* Dashboard View */}
              {activeTab === "dashboard" && (
                <motion.div
                  key="dashboard"
                  {...pageTransition}
                >
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 shadow-lg shadow-primary-500/30">
                        <Activity className="w-6 h-6 text-white" />
                      </div>
                      <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-slate-900 via-primary-600 to-accent-600 dark:from-white dark:via-primary-400 dark:to-accent-400 bg-clip-text text-transparent">
                        Live Tracking Dashboard
                      </h1>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-lg ml-14">
                      Real-time overview of field operations and revenue
                    </p>
                  </motion.div>
                  <DashboardOverview />
                </motion.div>
              )}

              {/* Submissions View */}
              {activeTab === "submissions" && (
                <motion.div
                  key="submissions"
                  {...pageTransition}
                >
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 shadow-lg shadow-emerald-500/30">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                      <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-slate-900 via-emerald-600 to-green-600 dark:from-white dark:via-emerald-400 dark:to-green-400 bg-clip-text text-transparent">
                        Approved Submissions
                      </h1>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 ml-14">
                      Archive of all validated field entries
                    </p>
                  </motion.div>

                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar"
                  >
                    {submissions.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-20 glass-card rounded-3xl"
                      >
                        <FileText className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                        <p className="text-xl font-semibold text-slate-500 dark:text-slate-400">
                          No approved submissions found
                        </p>
                      </motion.div>
                    ) : (
                      submissions
                        .slice()
                        .reverse()
                        .map((item) => (
                          <motion.div
                            key={item.id}
                            variants={itemVariants}
                            layout
                            whileHover={{ y: -4 }}
                            className="group relative"
                          >
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500/20 via-accent-500/20 to-emerald-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />

                            <div className="relative glass-card p-6 rounded-3xl border border-white/30 dark:border-slate-700/50 flex flex-col md:flex-row gap-6">
                              <div className="flex-1">
                                <div className="flex justify-between mb-4">
                                  <div className="flex items-center gap-3">
                                    <motion.div
                                      whileHover={{ scale: 1.1, rotate: 5 }}
                                      className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white shadow-lg shadow-primary-500/30"
                                    >
                                      <User size={24} />
                                    </motion.div>
                                    <div>
                                      <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                        {item.supervisorName}
                                      </h3>
                                      <p className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                                        {item.supervisorId}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold mb-1 bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/30">
                                      <CheckCircle size={12} />
                                      {item.status}
                                    </span>
                                    <div className="flex items-center justify-end gap-1 text-xs text-slate-400 dark:text-slate-500 mt-1">
                                      <Calendar size={12} />
                                      <p>{new Date(item.created_at).toLocaleDateString()}</p>
                                    </div>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                  <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 border border-slate-200/50 dark:border-slate-700/50"
                                  >
                                    <div className="flex items-center gap-2 mb-2">
                                      <Package className="w-4 h-4 text-primary-500" />
                                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Work Order</p>
                                    </div>
                                    <p className="text-slate-800 dark:text-white font-mono font-bold">{item.work_order_number}</p>
                                    <p className="text-slate-600 dark:text-slate-300 text-sm mt-1">{item.line_item_name}</p>
                                  </motion.div>

                                  <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-200/50 dark:border-emerald-700/30"
                                  >
                                    <div className="flex justify-between items-center">
                                      <div>
                                        <div className="flex items-center gap-2 mb-1">
                                          <TrendingUp className="w-4 h-4 text-emerald-500" />
                                          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">Details</p>
                                        </div>
                                        <p className="text-slate-700 dark:text-slate-300 text-sm">Qty: {item.quantity} {item.uom}</p>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Revenue</p>
                                        <p className="text-2xl font-black bg-gradient-to-r from-emerald-600 to-green-600 dark:from-emerald-400 dark:to-green-400 bg-clip-text text-transparent">
                                          ₹{item.revenue?.toFixed(2)}
                                        </p>
                                      </div>
                                    </div>
                                  </motion.div>
                                </div>

                                <div className="mt-3 flex gap-3 text-xs text-slate-500">
                                  <span className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800">
                                    Manpower: {item.actual_manpower}
                                  </span>
                                  {item.material_consumed && (
                                    <span className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800">
                                      Material: {item.material_consumed}
                                    </span>
                                  )}
                                </div>

                                {item.adminRemarks && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-4 flex items-start gap-3 p-4 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200/50 dark:border-primary-800/30"
                                  >
                                    <MessageSquare className="w-5 h-5 text-primary-500 flex-shrink-0" />
                                    <div>
                                      <p className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase mb-1">Admin Remark</p>
                                      <p className="text-sm text-primary-700 dark:text-primary-300">{item.adminRemarks}</p>
                                    </div>
                                  </motion.div>
                                )}

                                {item.evidence_photos && item.evidence_photos.length > 0 && (
                                  <div className="mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                                    <p className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Evidence Photos</p>
                                    <div className="flex gap-3 overflow-x-auto pb-2">
                                      {item.evidence_photos.map((photo, idx) => (
                                        <motion.a
                                          key={idx}
                                          whileHover={{ scale: 1.05, y: -2 }}
                                          href={photo}
                                          target="_blank"
                                          rel="noopener noreferrer"
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
                              </div>

                              <div className="flex items-center justify-end md:pl-6 md:border-l border-slate-200/50 dark:border-slate-700/50">
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => {
                                    setRemarkModal(item.id);
                                    setAdminRemark(item.adminRemarks || "");
                                  }}
                                  className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 text-slate-600 dark:text-slate-300 hover:from-primary-50 hover:to-primary-100 dark:hover:from-primary-900/30 dark:hover:to-primary-800/30 hover:text-primary-600 dark:hover:text-primary-400 transition-all flex flex-col items-center gap-2 min-w-[100px] group"
                                >
                                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                                  <MessageSquare size={24} />
                                  <span className="text-sm font-bold">Remark</span>
                                </motion.button>
                              </div>
                            </div>
                          </motion.div>
                        ))
                    )}
                  </motion.div>
                </motion.div>
              )}

              {/* User Management View */}
              {activeTab === "users" && (
                <motion.div
                  key="users"
                  {...pageTransition}
                  className="space-y-6"
                >
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-6 rounded-3xl border border-white/30 dark:border-slate-700/50"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/30">
                          <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-slate-900 dark:text-white">System Users</h2>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Manage access for all roles</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <select
                          className="px-4 py-2.5 bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 dark:text-white font-semibold"
                          value={selectedRole}
                          onChange={(e) => setSelectedRole(e.target.value)}
                        >
                          <option value="supervisor">Supervisor</option>
                          <option value="validator">Validator</option>
                          <option value="admin">Admin</option>
                        </select>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setEditingUser(null);
                            setShowUserModal(true);
                          }}
                          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 text-white rounded-xl font-bold shadow-lg shadow-primary-500/30 transition-all"
                        >
                          <UserPlus size={18} /> Add User
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
                  >
                    {Array.isArray(users) && users.map(u => (
                      <motion.div
                        key={u.id}
                        variants={itemVariants}
                        whileHover={{ y: -4 }}
                        className="group relative"
                      >
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500/20 to-accent-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />

                        <div className="relative glass-card p-5 rounded-2xl border border-white/30 dark:border-slate-700/50">
                          <div className="flex items-start gap-4">
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              className="h-14 w-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 overflow-hidden flex-shrink-0 ring-2 ring-transparent group-hover:ring-primary-500 transition-all shadow-lg"
                            >
                              {u.image ? (
                                <img src={u.image} alt={u.name} className="h-full w-full object-cover" />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-slate-400">
                                  <User size={28} />
                                </div>
                              )}
                            </motion.div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-slate-900 dark:text-white truncate text-lg">{u.name}</h3>
                              <p className="text-sm text-slate-500 truncate">{u.email}</p>
                              <p className="text-xs text-slate-400 font-mono mt-0.5">{u.emp_id}</p>
                              <span className={`inline-flex items-center gap-1 mt-2 px-2.5 py-1 rounded-lg text-xs uppercase font-bold tracking-wider ${
                                u.role === 'admin' ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 dark:from-purple-900/30 dark:to-pink-900/30 dark:text-purple-300' :
                                u.role === 'validator' ? 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 dark:from-amber-900/30 dark:to-orange-900/30 dark:text-amber-300' :
                                'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 dark:from-blue-900/30 dark:to-cyan-900/30 dark:text-blue-300'
                              }`}>
                                <Shield size={10} />
                                {u.role}
                              </span>
                            </div>
                          </div>

                          <div className="mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between">
                            <div>
                              <span className="text-xs uppercase font-bold text-slate-400 block mb-1">Password</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-mono text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg min-w-[100px]">
                                  {visiblePasswordId === u.id ? u.password : "••••••••"}
                                </span>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => setVisiblePasswordId(visiblePasswordId === u.id ? null : u.id)}
                                  className="p-1.5 text-slate-400 hover:text-primary-500 transition-colors"
                                >
                                  {visiblePasswordId === u.id ? <EyeOff size={16} /> : <Eye size={16} />}
                                </motion.button>
                              </div>
                            </div>

                            <div className="flex gap-1">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => {
                                  setEditingUser(u);
                                  setSelectedRole(u.role);
                                  setShowUserModal(true);
                                }}
                                className="p-2.5 text-slate-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition-all"
                              >
                                <Edit2 size={18} />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleDeleteUser(u.id)}
                                disabled={u.id === "admin-uuid-001"}
                                className={`p-2.5 rounded-xl transition-all ${
                                  u.id === "admin-uuid-001"
                                    ? "text-slate-300 cursor-not-allowed"
                                    : "text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                                }`}
                              >
                                <Trash2 size={18} />
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              )}

              {/* Master Data View */}
              {activeTab === "master" && (
                <motion.div
                  key="master"
                  {...pageTransition}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                >
                  {/* Work Orders */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card p-6 rounded-3xl border border-white/30 dark:border-slate-700/50"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/30">
                        <Briefcase className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">Work Orders</h2>
                    </div>

                    <form onSubmit={handleCreateWO} className="flex gap-3 mb-6">
                      <input
                        type="text"
                        placeholder="Order Number (e.g. WO-005)"
                        className="flex-1 px-4 py-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all"
                        value={newWO}
                        onChange={(e) => setNewWO(e.target.value)}
                        required
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        className="px-5 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all"
                      >
                        <Plus size={20} />
                      </motion.button>
                    </form>

                    <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                      {workOrders.map((wo) => (
                        <motion.div
                          key={wo.id}
                          whileHover={{ scale: 1.01, x: 4 }}
                          className="p-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-700/50 flex justify-between items-center transition-all"
                        >
                          <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{wo.order_number}</span>
                          <span className="text-xs text-slate-400 px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg">
                            {new Date(wo.created_at).toLocaleDateString()}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Line Items */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card p-6 rounded-3xl border border-white/30 dark:border-slate-700/50"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/30">
                        <Layers className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">Line Items</h2>
                    </div>

                    <form onSubmit={handleCreateLineItem} className="space-y-3 mb-6">
                      <select
                        className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 dark:text-white transition-all"
                        value={newLineItem.workOrderId}
                        onChange={(e) => setNewLineItem({...newLineItem, workOrderId: e.target.value})}
                        required
                      >
                        <option value="">Select Work Order</option>
                        {workOrders.map(wo => <option key={wo.id} value={wo.id}>{wo.order_number}</option>)}
                      </select>
                      <input
                        type="text"
                        placeholder="Item Name (e.g. Excavation)"
                        className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 dark:text-white transition-all"
                        value={newLineItem.name}
                        onChange={(e) => setNewLineItem({...newLineItem, name: e.target.value})}
                        required
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="UOM (e.g. m3)"
                          className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 dark:text-white transition-all"
                          value={newLineItem.uom}
                          onChange={(e) => setNewLineItem({...newLineItem, uom: e.target.value})}
                          required
                        />
                        <input
                          type="number"
                          placeholder="Rate (₹)"
                          className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 dark:text-white transition-all"
                          value={newLineItem.rate}
                          onChange={(e) => setNewLineItem({...newLineItem, rate: e.target.value})}
                          required
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Std Manpower (e.g. 1 Sup + 3 Lab)"
                        className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 dark:text-white transition-all"
                        value={newLineItem.standardManpower}
                        onChange={(e) => setNewLineItem({...newLineItem, standardManpower: e.target.value})}
                        required
                      />
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-bold shadow-lg shadow-purple-500/30 transition-all"
                      >
                        Add Line Item
                      </motion.button>
                    </form>

                    <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                      {lineItems.map((li) => {
                        const parentWO = workOrders.find(w => w.id === li.work_order_id);
                        return (
                          <motion.div
                            key={li.id}
                            whileHover={{ scale: 1.01, x: 4 }}
                            className="p-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-700/50 transition-all"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-bold text-slate-800 dark:text-white">{li.name}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{parentWO?.order_number || "Unknown WO"}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">₹{li.rate}</p>
                                <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold">{li.uom}</p>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT COLUMN: Sidebar Navigation */}
          <div className="lg:w-1/4 order-1 lg:order-2">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="sticky top-24"
            >
              <div className="glass-card p-6 rounded-3xl border border-white/30 dark:border-slate-700/50">
                <div className="flex items-center gap-3 mb-6 px-2">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Menu</h2>
                </div>

                <div className="space-y-2">
                  <NavButton
                    active={activeTab === 'dashboard'}
                    onClick={() => setActiveTab('dashboard')}
                    icon={<LayoutDashboard size={20} />}
                    label="Live Dashboard"
                    gradient="from-primary-500 to-accent-500"
                  />
                  <NavButton
                    active={activeTab === 'submissions'}
                    onClick={() => setActiveTab('submissions')}
                    icon={<FileText size={20} />}
                    label="Submissions"
                    gradient="from-emerald-500 to-green-500"
                  />
                  <NavButton
                    active={activeTab === 'users'}
                    onClick={() => setActiveTab('users')}
                    icon={<Users size={20} />}
                    label="User Management"
                    gradient="from-purple-500 to-pink-500"
                  />
                  <NavButton
                    active={activeTab === 'master'}
                    onClick={() => setActiveTab('master')}
                    icon={<Database size={20} />}
                    label="Master Data"
                    gradient="from-blue-500 to-cyan-500"
                  />

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowExportModal(true)}
                    className="w-full flex items-center justify-between p-4 rounded-xl text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <Download size={20} />
                      <span className="font-bold">Download Data</span>
                    </div>
                    <ChevronRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.button>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-200/50 dark:border-slate-700/50">
                  <div className="px-4">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">System Status</p>
                    <div className="flex items-center gap-3">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                      </span>
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Online & Syncing</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Remark Modal */}
      <AnimatePresence>
        {remarkModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={() => {
              setRemarkModal(null);
              setAdminRemark("");
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              <div className="absolute inset-0 p-[1px] rounded-3xl bg-gradient-to-br from-primary-500 via-accent-500 to-primary-500">
                <div className="absolute inset-[1px] bg-white dark:bg-slate-900 rounded-3xl" />
              </div>

              <div className="relative p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 shadow-lg shadow-primary-500/30">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                      Add Admin Remark
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Add a note to this submission
                    </p>
                  </div>
                </div>

                <textarea
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-500/20 dark:text-white h-32 resize-none placeholder:text-slate-400 transition-all"
                  placeholder="Enter your remark..."
                  value={adminRemark}
                  onChange={(e) => setAdminRemark(e.target.value)}
                  autoFocus
                />

                <div className="flex gap-3 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setRemarkModal(null);
                      setAdminRemark("");
                    }}
                    className="flex-1 py-4 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl font-bold transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleRemark}
                    className="flex-1 py-4 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40"
                  >
                    Save Remark
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {showUserModal && (
        <UserFormModal
          role={selectedRole}
          userToEdit={editingUser}
          onClose={() => setShowUserModal(false)}
          onSuccess={() => {
            fetchUsers();
            setShowUserModal(false);
          }}
        />
      )}

      {showExportModal && (
        <ExportDataModal onClose={() => setShowExportModal(false)} />
      )}
    </div>
  );
}

function NavButton({ active, onClick, icon, label, gradient }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative w-full flex items-center justify-between p-4 rounded-xl transition-all duration-300 group ${
        active
          ? 'text-white'
          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
      }`}
    >
      {active && (
        <motion.div
          layoutId="sidebar-active"
          className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-xl shadow-lg`}
          style={{ boxShadow: '0 10px 30px -10px rgba(99, 102, 241, 0.5)' }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
      <div className="flex items-center gap-3 relative z-10">
        {icon}
        <span className="font-bold">{label}</span>
      </div>
      {active && <ChevronRight size={18} className="relative z-10" />}
    </motion.button>
  );
}
