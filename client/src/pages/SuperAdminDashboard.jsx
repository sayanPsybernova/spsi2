import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  ShieldCheck,
  Shield,
  FileText,
  Briefcase,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Activity,
  ArrowRight,
  Download,
  Sparkles,
  Zap,
  ChevronRight,
  BarChart3,
} from "lucide-react";
import ActiveUsersModal from "../components/ActiveUsersModal";
import UserFormModal from "../components/UserFormModal";
import ApprovedSubmissionsModal from "../components/ApprovedSubmissionsModal";
import ExportDataModal from "../components/ExportDataModal";
import AllEmployeesModal from "../components/AllEmployeesModal";
import PendingSubmissionsModal from "../components/PendingSubmissionsModal";
import Navbar from "../components/Navbar";
import AnimatedBackground from "../components/AnimatedBackground";
import { API_ENDPOINTS } from "../config/api";
import { useTheme } from "../context/ThemeContext";
import Swal from 'sweetalert2';

export default function SuperAdminDashboard() {
  const [activeModal, setActiveModal] = useState(null);
  const [stats, setStats] = useState({
    chartData: [],
    activeUsers: 0,
    pendingTasks: 0,
  });
  const { theme } = useTheme();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get(API_ENDPOINTS.stats);
      setStats(res.data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  // Stats Calculation Logic
  const totalRevenue = stats.chartData.reduce(
    (acc, curr) => acc + curr.sales,
    0
  );
  const getCurrentMonthKey = () => {
    const date = new Date();
    return `${date.toLocaleString("en-US", {
      month: "short",
    })} ${date.getFullYear()}`;
  };
  const getPrevMonthKey = () => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return `${date.toLocaleString("en-US", {
      month: "short",
    })} ${date.getFullYear()}`;
  };
  const currentMonthKey = getCurrentMonthKey();
  const prevMonthKey = getPrevMonthKey();
  const currentMonthSales =
    stats.chartData.find((s) => s.name === currentMonthKey)?.sales || 0;
  const prevMonthSales =
    stats.chartData.find((s) => s.name === prevMonthKey)?.sales || 0;
  let percentageChange = 0;
  let isIncrease = true;
  if (prevMonthSales === 0) {
    percentageChange = currentMonthSales > 0 ? 100 : 0;
    isIncrease = true;
  } else {
    const change =
      ((currentMonthSales - prevMonthSales) / prevMonthSales) * 100;
    percentageChange = Math.abs(change);
    isIncrease = change >= 0;
  }

  // Chart Colors
  const axisColor = theme === "dark" ? "#94a3b8" : "#64748b";
  const tooltipBg = theme === "dark" ? "#1e293b" : "#ffffff";
  const tooltipText = theme === "dark" ? "#f8fafc" : "#1e293b";
  const gridColor = theme === "dark" ? "#334155" : "#e2e8f0";

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } },
  };

  const quickActions = [
    {
      id: "supervisor",
      icon: Users,
      label: "Add Supervisor",
      sub: "Manage team leads",
      gradient: "from-blue-500 to-cyan-500",
      bgGlow: "bg-blue-500",
    },
    {
      id: "validator",
      icon: ShieldCheck,
      label: "Add Validator",
      sub: "Manage verifiers",
      gradient: "from-teal-500 to-emerald-500",
      bgGlow: "bg-teal-500",
    },
    {
      id: "admin",
      icon: Shield,
      label: "Add Admin",
      sub: "System moderators",
      gradient: "from-indigo-500 to-purple-500",
      bgGlow: "bg-indigo-500",
    },
    {
      id: "approved_submissions",
      icon: FileText,
      label: "View Reports",
      sub: "Access data logs",
      gradient: "from-emerald-500 to-green-500",
      bgGlow: "bg-emerald-500",
    },
    {
      id: "export_data",
      icon: Download,
      label: "Download Data",
      sub: "Export to Excel",
      gradient: "from-violet-500 to-purple-500",
      bgGlow: "bg-violet-500",
    },
    {
      id: "all_employees",
      icon: Briefcase,
      label: "Employees",
      sub: "Staff directory",
      gradient: "from-pink-500 to-rose-500",
      bgGlow: "bg-pink-500",
    },
    {
      id: "active_users",
      icon: Activity,
      label: "Active Users",
      sub: "Currently logged in",
      gradient: "from-amber-500 to-orange-500",
      bgGlow: "bg-amber-500",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-500 relative">
      <AnimatedBackground variant="mesh" />
      <Navbar />

      <main className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 sm:mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4 md:gap-6"
        >
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-2 mb-3"
            >
              <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
                <Sparkles className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <span className="text-sm font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
                Super Admin Portal
              </span>
            </motion.div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              Dashboard
              <span className="bg-gradient-to-r from-primary-600 via-accent-500 to-primary-600 bg-clip-text text-transparent"> Overview</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-base sm:text-lg max-w-xl">
              Welcome back! Here's what's happening across your organization today.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-3 sm:p-4 rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-700/50"
          >
            <div className="p-2.5 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl text-white shadow-lg shadow-primary-500/20">
              <Calendar size={20} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Today</p>
              <span className="text-sm font-bold text-slate-800 dark:text-white">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* Quick Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-8"
        >
          {/* Revenue Card */}
          <motion.div
            variants={itemVariants}
            className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 lg:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700/50 overflow-hidden group hover:shadow-xl transition-all duration-500"
          >
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-br from-emerald-500/20 to-teal-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />

            <div className="relative z-10 flex justify-between items-start">
              <div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Total Revenue
                </p>
                <h3 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white">
                  <span className="text-xl font-bold text-slate-500">Rs.</span>
                  {totalRevenue.toLocaleString()}
                </h3>
              </div>
              <motion.div
                whileHover={{ rotate: 15, scale: 1.1 }}
                className="p-4 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl text-white shadow-lg shadow-emerald-500/30"
              >
                <DollarSign size={28} />
              </motion.div>
            </div>

            <div className={`flex items-center gap-2 mt-6 text-sm font-bold ${isIncrease ? "text-emerald-500" : "text-rose-500"}`}>
              <div className={`p-1 rounded-lg ${isIncrease ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-rose-100 dark:bg-rose-900/30"}`}>
                {isIncrease ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              </div>
              <span>{percentageChange.toFixed(1)}%</span>
              <span className="text-slate-400 font-medium">from last month</span>
            </div>
          </motion.div>

          {/* Active Users Card */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveModal("all_employees")}
            className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 lg:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700/50 overflow-hidden group cursor-pointer hover:shadow-xl hover:border-primary-200 dark:hover:border-primary-700/50 transition-all duration-500"
          >
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-br from-primary-500/20 to-accent-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />

            <div className="relative z-10 flex justify-between items-start">
              <div>
                <p className="text-sm font-bold text-slate-400 group-hover:text-primary-500 uppercase tracking-wider mb-2 transition-colors">
                  Active Users
                </p>
                <h3 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white">
                  {stats.activeUsers.toLocaleString()}
                </h3>
              </div>
              <motion.div
                whileHover={{ rotate: 15, scale: 1.1 }}
                className="p-4 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl text-white shadow-lg shadow-primary-500/30"
              >
                <Users size={28} />
              </motion.div>
            </div>

            <div className="flex items-center gap-2 mt-6 text-sm font-bold text-primary-500">
              <span>View all employees</span>
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>

          {/* Pending Tasks Card */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveModal("pending_tasks")}
            className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 lg:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700/50 overflow-hidden group cursor-pointer hover:shadow-xl hover:border-amber-200 dark:hover:border-amber-700/50 transition-all duration-500"
          >
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-br from-amber-500/20 to-orange-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />

            <div className="relative z-10 flex justify-between items-start">
              <div>
                <p className="text-sm font-bold text-slate-400 group-hover:text-amber-500 uppercase tracking-wider mb-2 transition-colors">
                  Pending Tasks
                </p>
                <h3 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white">
                  {stats.pendingTasks}
                </h3>
              </div>
              <motion.div
                whileHover={{ rotate: 15, scale: 1.1 }}
                className="p-4 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl text-white shadow-lg shadow-amber-500/30"
              >
                <Activity size={28} />
              </motion.div>
            </div>

            <div className="flex items-center gap-2 mt-6 text-sm font-bold text-amber-500">
              <span>Review pending items</span>
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>
        </motion.div>

        {/* Main Layout Grid */}
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column: Sales Overview */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 lg:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700/50 hover:shadow-xl transition-all duration-500"
          >
            <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl text-white shadow-lg shadow-primary-500/20">
                  <BarChart3 size={20} />
                </div>
                Revenue Analytics
              </h2>
              <select className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-500 transition-all cursor-pointer hover:border-primary-300 dark:hover:border-primary-700">
                <option>Last 12 Months</option>
                <option>This Year</option>
              </select>
            </div>

            <div className="h-[280px] sm:h-[320px] lg:h-[380px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.chartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={gridColor}
                    strokeOpacity={0.5}
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: axisColor, fontSize: 12, fontWeight: 500 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: axisColor, fontSize: 12 }}
                    tickFormatter={(value) => `Rs.${value / 1000}k`}
                  />
                  <Tooltip
                    cursor={{
                      fill: theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
                      radius: 8,
                    }}
                    contentStyle={{
                      borderRadius: "16px",
                      border: "none",
                      boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.2)",
                      backgroundColor: tooltipBg,
                      color: tooltipText,
                      padding: "12px 16px",
                    }}
                    itemStyle={{ color: tooltipText, fontWeight: 600 }}
                    formatter={(value) => [`Rs.${value.toLocaleString()}`, "Revenue"]}
                  />
                  <Bar
                    dataKey="sales"
                    fill="url(#colorSales)"
                    radius={[10, 10, 0, 0]}
                    barSize={35}
                    animationDuration={1500}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Right Column: Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-1"
          >
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700/50 h-full hover:shadow-xl transition-all duration-500">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-accent-500 to-pink-500 rounded-xl text-white shadow-lg shadow-accent-500/20">
                  <Zap size={18} />
                </div>
                Quick Actions
              </h3>

              <div className="space-y-2">
                {quickActions.map((item, idx) => (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + idx * 0.05 }}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveModal(item.id)}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/30 hover:bg-white dark:hover:bg-slate-800/50 hover:border-slate-200 dark:hover:border-slate-600 transition-all text-left group"
                  >
                    <div className={`relative h-12 w-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${item.gradient} text-white shadow-lg overflow-hidden`}>
                      {/* Shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                      <item.icon size={22} className="relative z-10" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-800 dark:text-white text-sm truncate">
                        {item.label}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {item.sub}
                      </p>
                    </div>
                    <ChevronRight
                      size={18}
                      className="text-slate-300 dark:text-slate-600 group-hover:text-primary-500 group-hover:translate-x-1 transition-all"
                    />
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {activeModal && ["supervisor", "validator", "admin"].includes(activeModal) && (
          <UserFormModal
            role={activeModal}
            onClose={() => setActiveModal(null)}
            onSuccess={() => Swal.fire({
              title: "Success!",
              text: `${activeModal.charAt(0).toUpperCase() + activeModal.slice(1)} created successfully!`,
              icon: "success",
              confirmButtonColor: "#6366f1",
              customClass: {
                popup: 'rounded-3xl',
                confirmButton: 'rounded-xl px-6 py-3 font-semibold'
              }
            })}
          />
        )}

        {activeModal === "approved_submissions" && (
          <ApprovedSubmissionsModal onClose={() => setActiveModal(null)} />
        )}

        {activeModal === "all_employees" && (
          <AllEmployeesModal onClose={() => setActiveModal(null)} />
        )}

        {activeModal === "pending_tasks" && (
          <PendingSubmissionsModal onClose={() => setActiveModal(null)} />
        )}

        {activeModal === "active_users" && (
          <ActiveUsersModal onClose={() => setActiveModal(null)} />
        )}

        {activeModal === "export_data" && (
          <ExportDataModal onClose={() => setActiveModal(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
