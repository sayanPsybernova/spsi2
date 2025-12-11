import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import UserFormModal from "../components/UserFormModal";
import DashboardOverview from "../components/DashboardOverview";
import {
  MessageSquare,
  User,
  Calendar,
  DollarSign,
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
  ChevronRight
} from "lucide-react";
import { API_ENDPOINTS } from "../config/api";
import { motion, AnimatePresence } from "framer-motion";
import Swal from 'sweetalert2';
import Loader from "../components/Loader";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard"); // 'dashboard', 'submissions', 'master', 'users'
  const [submissions, setSubmissions] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [lineItems, setLineItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Remark State
  const [remarkModal, setRemarkModal] = useState(null);
  const [adminRemark, setAdminRemark] = useState("");

  // User Modal State
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState("supervisor");
  const [editingUser, setEditingUser] = useState(null);
  const [visiblePasswordId, setVisiblePasswordId] = useState(null);

  // Master Data Forms
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
      await axios.post(API_ENDPOINTS.workOrders, {
        orderNumber: newWO,
      });
      setNewWO("");
      await fetchMasterData(); // Await this to ensure data is refreshed before stopping loading
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
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, delete it!'
      });

      if (result.isConfirmed) {
          setLoading(true);
          try {
              await axios.delete(`${API_ENDPOINTS.users}/${id}`);
              await fetchUsers();
              Swal.fire(
                  'Deleted!',
                  'User has been deleted.',
                  'success'
              );
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

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-transparent transition-colors duration-300 selection:bg-indigo-500/30">
      {loading && <Loader />}
      <Navbar />

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="flex flex-col lg:flex-row gap-8">
            
            {/* LEFT COLUMN: Main Content (75%) */}
            <div className="lg:w-3/4 order-2 lg:order-1">
                <AnimatePresence mode="wait">
                
                {activeTab === "dashboard" && (
                    <motion.div 
                        key="dashboard"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="mb-8">
                            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Live Tracking Dashboard</h1>
                            <p className="text-slate-500 dark:text-slate-400 text-lg mt-2">Real-time overview of field operations and revenue.</p>
                        </div>
                        <DashboardOverview />
                    </motion.div>
                )}

                {/* --- Submissions View --- */}
                {activeTab === "submissions" && (
                  <motion.div 
                    key="submissions"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="mb-6">
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Approved Submissions</h1>
                        <p className="text-slate-500 dark:text-slate-400">Archive of all validated field entries.</p>
                    </div>
                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 gap-4 sm:gap-6 max-h-[70vh] overflow-y-auto pr-2 scrollbar-hide"
                    >
                        {submissions.length === 0 && (
                        <div className="text-center py-10 text-slate-500">No approved submissions found.</div>
                        )}
                        {submissions
                        .slice()
                        .reverse()
                        .map((item) => (
                            <motion.div
                            key={item.id}
                            variants={itemVariants}
                            layout
                            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row gap-6 hover:shadow-xl hover:scale-[1.01] transition-all duration-300 group"
                            >
                            <div className="flex-1">
                                <div className="flex justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                    <User size={20} />
                                    </div>
                                    <div>
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                        {item.supervisorName}
                                    </h3>
                                    <p className="text-xs text-slate-400 dark:text-slate-500">
                                        {item.supervisorId}
                                    </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-1 capitalize bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30">
                                    {item.status}
                                    </span>
                                    <div className="flex items-center justify-end gap-1 text-xs text-slate-400 dark:text-slate-500">
                                    <Calendar size={12} />
                                    <p>{new Date(item.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                    <p className="text-xs text-slate-500 font-bold uppercase mb-1">Work Order</p>
                                    <p className="text-slate-800 dark:text-white font-mono text-sm">{item.work_order_number}</p>
                                    <p className="text-slate-600 dark:text-slate-300 text-sm mt-1">{item.line_item_name}</p>
                                </div>
                                
                                <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 flex justify-between items-center">
                                    <div>
                                        <p className="text-xs text-slate-500 font-bold uppercase mb-1">Details</p>
                                        <p className="text-slate-700 dark:text-slate-300 text-sm">Qty: {item.quantity} {item.uom}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-slate-500 font-bold uppercase mb-1">Revenue</p>
                                        <p className="text-emerald-600 dark:text-emerald-400 font-bold text-lg">₹{item.revenue?.toFixed(2)}</p>
                                    </div>
                                </div>
                                </div>
                                
                                <div className="mt-3 flex gap-2 text-xs text-slate-500">
                                    <span>Actual Manpower: {item.actual_manpower}</span>
                                    {item.material_consumed && <span>• Material: {item.material_consumed}</span>}
                                </div>

                                <div className="mt-4 flex flex-wrap gap-3">
                                {item.adminRemarks && (
                                    <div className="text-sm text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-lg border border-indigo-100 dark:border-indigo-800/30">
                                    <span className="font-bold mr-1">Admin:</span> {item.adminRemarks}
                                    </div>
                                )}
                                </div>

                                {/* Evidence Photos */}
                                {item.evidence_photos && item.evidence_photos.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase">
                                    Evidence Photos
                                    </p>
                                    <div className="flex gap-2 overflow-x-auto pb-2">
                                    {item.evidence_photos.map((photo, idx) => (
                                        <motion.a
                                        key={idx}
                                        whileHover={{ scale: 1.1, rotate: 2 }}
                                        href={photo}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 hover:opacity-80 transition-opacity shadow-sm"
                                        >
                                        <img
                                            src={photo.startsWith('http') ? photo : photo}
                                            alt={`Evidence ${idx + 1}`}
                                            className="h-full w-full object-cover"
                                        />
                                        </motion.a>
                                    ))}
                                    </div>
                                </div>
                                )}
                            </div>

                            <div className="flex items-start justify-end md:pl-4 md:border-l border-slate-100 dark:border-slate-700">
                                <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    setRemarkModal(item.id);
                                    setAdminRemark(item.adminRemarks || "");
                                }}
                                className="p-3 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 transition-all flex flex-col items-center gap-1 min-w-[80px]"
                                >
                                <MessageSquare size={20} />
                                <span className="text-sm font-bold">Remark</span>
                                </motion.button>
                            </div>
                            </motion.div>
                        ))}
                    </motion.div>
                  </motion.div>
                )}

                {/* --- User Management View --- */}
                {activeTab === "users" && (
                    <motion.div 
                        key="users"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                    >
                        <div className="flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">System Users</h2>
                                <p className="text-sm text-slate-500">Manage access for Supervisors, Validators, and Admins.</p>
                            </div>
                            <div className="flex gap-2">
                                <select 
                                    className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                >
                                    <option value="supervisor">Supervisor</option>
                                    <option value="validator">Validator</option>
                                    <option value="admin">Admin</option>
                                </select>
                                <motion.button 
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        setEditingUser(null);
                                        setShowUserModal(true);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/25"
                                >
                                    <UserPlus size={18} /> Add User
                                </motion.button>
                            </div>
                        </div>

                        <motion.div 
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {Array.isArray(users) && users.map(u => (
                                <motion.div 
                                    key={u.id}
                                    variants={itemVariants} 
                                    className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-start gap-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
                                >
                                     <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden flex-shrink-0 ring-2 ring-transparent group-hover:ring-indigo-500 transition-all">
                                        {u.image ? (
                                            <img src={u.image} alt={u.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-slate-400">
                                                <User size={24} />
                                            </div>
                                        )}
                                     </div>
                                     <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-slate-900 dark:text-white truncate">{u.name}</h3>
                                        <p className="text-xs text-slate-500 mb-0.5">{u.email}</p>
                                        <p className="text-xs text-slate-400 font-mono mb-1">{u.emp_id}</p>
                                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                                            u.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                                            u.role === 'validator' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' :
                                            'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                        }`}>
                                            {u.role}
                                        </span>
                                     </div>
                                     
                                     <div className="flex flex-col items-end mr-4">
                                        <span className="text-[10px] uppercase font-bold text-slate-400">Password</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-mono text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/50 px-2 py-1 rounded min-w-[80px] text-center">
                                                {visiblePasswordId === u.id ? u.password : "••••••••"}
                                            </span>
                                            <button 
                                                onClick={() => setVisiblePasswordId(visiblePasswordId === u.id ? null : u.id)}
                                                className="text-slate-400 hover:text-blue-500 transition-colors"
                                            >
                                                {visiblePasswordId === u.id ? <EyeOff size={14} /> : <Eye size={14} />}
                                            </button>
                                        </div>
                                     </div>

                                     <div className="flex gap-2">
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => {
                                                setEditingUser(u);
                                                setSelectedRole(u.role);
                                                setShowUserModal(true);
                                            }}
                                            className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                        >
                                            <Edit2 size={18} />
                                        </motion.button>
                                        <motion.button 
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => handleDeleteUser(u.id)}
                                            disabled={u.id === "admin-uuid-001"}
                                            className={`p-2 rounded-lg transition-colors ${
                                                u.id === "admin-uuid-001" 
                                                ? "text-slate-300 cursor-not-allowed" 
                                                : "text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                            }`}
                                        >
                                            <Trash2 size={18} />
                                        </motion.button>
                                     </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>
                )}

                {/* --- Master Data View --- */}
                {activeTab === "master" && (
                <motion.div 
                    key="master"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                >
                    
                    {/* Work Orders Column */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700"
                    >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                        <Briefcase size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Work Orders</h2>
                    </div>

                    <form onSubmit={handleCreateWO} className="flex gap-3 mb-6">
                        <input
                        type="text"
                        placeholder="Order Number (e.g. WO-005)"
                        className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                        value={newWO}
                        onChange={(e) => setNewWO(e.target.value)}
                        required
                        />
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold">
                        <Plus size={20} />
                        </motion.button>
                    </form>

                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                        {workOrders.map((wo) => (
                        <div key={wo.id} className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-700 flex justify-between items-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{wo.order_number}</span>
                            <span className="text-xs text-slate-400">{new Date(wo.created_at).toLocaleDateString()}</span>
                        </div>
                        ))}
                    </div>
                    </motion.div>

                    {/* Line Items Column */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700"
                    >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                        <Layers size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Line Items</h2>
                    </div>

                    <form onSubmit={handleCreateLineItem} className="space-y-3 mb-6">
                        <select
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 dark:text-white"
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
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 dark:text-white"
                        value={newLineItem.name}
                        onChange={(e) => setNewLineItem({...newLineItem, name: e.target.value})}
                        required
                        />
                        <div className="grid grid-cols-2 gap-3">
                        <input
                            type="text"
                            placeholder="UOM (e.g. m3)"
                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 dark:text-white"
                            value={newLineItem.uom}
                            onChange={(e) => setNewLineItem({...newLineItem, uom: e.target.value})}
                            required
                        />
                        <input
                            type="number"
                            placeholder="Rate (₹)"
                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 dark:text-white"
                            value={newLineItem.rate}
                            onChange={(e) => setNewLineItem({...newLineItem, rate: e.target.value})}
                            required
                        />
                        </div>
                        <input
                        type="text"
                        placeholder="Std Manpower (e.g. 1 Sup + 3 Lab)"
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 dark:text-white"
                        value={newLineItem.standardManpower}
                        onChange={(e) => setNewLineItem({...newLineItem, standardManpower: e.target.value})}
                        required
                        />
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold">
                        Add Line Item
                        </motion.button>
                    </form>

                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {lineItems.map((li) => {
                        const parentWO = workOrders.find(w => w.id === li.work_order_id);
                        return (
                            <div key={li.id} className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-slate-800 dark:text-white">{li.name}</p>
                                    <p className="text-xs text-slate-500">{parentWO?.order_number || "Unknown WO"}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-mono text-xs text-slate-600 dark:text-slate-300">Rate: ₹{li.rate}</p>
                                    <p className="text-xs text-purple-600 dark:text-purple-400">{li.uom}</p>
                                </div>
                            </div>
                            </div>
                        );
                        })}
                    </div>
                    </motion.div>

                </motion.div>
                )}
                </AnimatePresence>
            </div>

            {/* RIGHT COLUMN: Sidebar Navigation (25%) */}
            <div className="lg:w-1/4 order-1 lg:order-2">
                <div className="sticky top-24 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-6 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 px-2">Menu</h2>
                    <div className="space-y-2 relative">
                        <NavButton 
                            active={activeTab === 'dashboard'} 
                            onClick={() => setActiveTab('dashboard')} 
                            icon={<LayoutDashboard size={20} />} 
                            label="Live Dashboard" 
                        />
                        <NavButton 
                            active={activeTab === 'submissions'} 
                            onClick={() => setActiveTab('submissions')} 
                            icon={<FileText size={20} />} 
                            label="Submissions" 
                        />
                        <NavButton 
                            active={activeTab === 'users'} 
                            onClick={() => setActiveTab('users')} 
                            icon={<Users size={20} />} 
                            label="User Management" 
                        />
                        <NavButton 
                            active={activeTab === 'master'} 
                            onClick={() => setActiveTab('master')} 
                            icon={<Database size={20} />} 
                            label="Master Data" 
                        />
                    </div>

                    <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-700">
                        <div className="px-4">
                            <p className="text-xs font-bold text-slate-400 uppercase mb-2">System Status</p>
                            <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm">
                                <span className="relative flex h-3 w-3">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                </span>
                                Online & Syncing
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
      </main>

      {/* Remark Modal */}
      {remarkModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6"
          >
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
              Add Admin Remark
            </h3>
            <textarea
              className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white h-24 resize-none"
              placeholder="Enter note..."
              value={adminRemark}
              onChange={(e) => setAdminRemark(e.target.value)}
            ></textarea>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setRemarkModal(null);
                  setAdminRemark("");
                }}
                className="flex-1 py-2.5 text-slate-500 hover:bg-slate-50 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleRemark}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/25"
              >
                Save
              </button>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* User Form Modal */}
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
    </div>
  );
}

function NavButton({ active, onClick, icon, label }) {
    return (
        <button
            onClick={onClick}
            className={`relative w-full flex items-center justify-between p-4 rounded-xl transition-all duration-300 group z-10 ${
                active 
                ? 'text-white' 
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
        >
            {active && (
                <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl -z-10 shadow-lg shadow-blue-500/30"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
            )}
            <div className="flex items-center gap-3 relative z-10">
                {icon}
                <span className="font-bold">{label}</span>
            </div>
            {active && <ChevronRight size={18} className="relative z-10" />}
        </button>
    )
}