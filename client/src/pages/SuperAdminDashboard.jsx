import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
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
} from "lucide-react";
import ActiveUsersModal from "../components/ActiveUsersModal";
import UserFormModal from "../components/UserFormModal";
import ApprovedSubmissionsModal from "../components/ApprovedSubmissionsModal";
import AllEmployeesModal from "../components/AllEmployeesModal";
import PendingSubmissionsModal from "../components/PendingSubmissionsModal";
import Navbar from "../components/Navbar";
import { API_ENDPOINTS } from "../config/api";
import { useTheme } from "../context/ThemeContext";

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
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-8 sm:py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 sm:mb-12 flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              Dashboard Overview
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 sm:mt-2 text-sm sm:text-lg">
              Welcome back, Super Admin. Here's what's happening today.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 sm:gap-3 bg-white dark:bg-slate-900 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="p-1.5 sm:p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg sm:rounded-xl text-blue-600 dark:text-blue-400">
              <Calendar size={16} sm:size={20} />
            </div>
            <span className="pr-2 sm:pr-4 text-xs sm:text-sm sm:font-medium text-slate-600 dark:text-slate-300">
              {new Date().toLocaleDateString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </motion.div>

        {/* Quick Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8"
        >
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden group"
          >
            <div className="absolute right-0 top-0 w-24 sm:w-32 h-24 sm:h-32 bg-blue-500/5 rounded-full blur-3xl -mr-12 sm:-mr-16 -mt-12 sm:-mt-16 transition-all group-hover:bg-blue-500/10"></div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                  Total Revenue
                </p>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mt-1 sm:mt-2">
                  ₹{totalRevenue.toLocaleString()}
                </h3>
              </div>
              <div className="p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl sm:rounded-2xl text-blue-600 dark:text-blue-400">
                <DollarSign size={16} sm:size={24} />
              </div>
            </div>
            <div
              className={`flex items-center gap-1 mt-3 sm:mt-4 text-xs sm:text-sm font-medium ${
                isIncrease ? "text-emerald-500" : "text-rose-500"
              }`}
            >
              {isIncrease ? (
                <TrendingUp size={12} sm:size={16} />
              ) : (
                <TrendingDown size={12} sm:size={16} />
              )}
              <span>{percentageChange.toFixed(1)}%</span>
              <span className="text-slate-400 font-normal ml-1 hidden sm:inline">
                from last month
              </span>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveModal("all_employees")}
            className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden group cursor-pointer transition-all hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800"
          >
            <div className="absolute right-0 top-0 w-24 sm:w-32 h-24 sm:h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-12 sm:-mr-16 -mt-12 sm:-mt-16 transition-all group-hover:bg-indigo-500/10"></div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  Active Users
                </p>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mt-1 sm:mt-2">
                  {stats.activeUsers.toLocaleString()}
                </h3>
              </div>
              <div className="p-2 sm:p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl sm:rounded-2xl text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Users size={16} sm:size={24} />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 sm:mt-4 text-xs sm:text-sm font-medium text-emerald-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              <TrendingUp size={12} sm:size={16} />
              <span>+12.5%</span>
              <span className="text-slate-400 font-normal ml-1 hidden sm:inline">
                new users
              </span>
              <ArrowRight
                size={12}
                sm:size={14}
                className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 sm:ml-2"
              />
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            onClick={() => setActiveModal("pending_tasks")}
            className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden group cursor-pointer transition-all hover:shadow-md hover:border-purple-200 dark:hover:border-purple-800"
          >
            <div className="absolute right-0 top-0 w-24 sm:w-32 h-24 sm:h-32 bg-purple-500/5 rounded-full blur-3xl -mr-12 sm:-mr-16 -mt-12 sm:-mt-16 transition-all group-hover:bg-purple-500/10"></div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                  Pending Tasks
                </p>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mt-1 sm:mt-2">
                  {stats.pendingTasks}
                </h3>
              </div>
              <div className="p-2 sm:p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl sm:rounded-2xl text-purple-600 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <Activity size={16} sm:size={24} />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 sm:mt-4 text-xs sm:text-sm font-medium text-slate-500 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
              <span className="hidden sm:inline">Click to view details</span>
              <ArrowRight
                size={12}
                sm:size={14}
                className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 sm:ml-2"
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Main Layout Grid */}
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Column: Sales Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-white dark:bg-slate-900 p-4 sm:p-6 lg:p-8 rounded-2xl lg:rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp
                  className="text-blue-600 dark:text-blue-400"
                  size={24}
                />
                Revenue Analytics
              </h2>
              <select className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500">
                <option>Last 12 Months</option>
                <option>This Year</option>
              </select>
            </div>

            <div className="h-[250px] sm:h-[300px] lg:h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.chartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                      <stop
                        offset="100%"
                        stopColor="#6366f1"
                        stopOpacity={0.8}
                      />
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
                    tickFormatter={(value) => `₹${value / 1000}k`}
                  />
                  <Tooltip
                    cursor={{
                      fill:
                        theme === "dark"
                          ? "rgba(255,255,255,0.05)"
                          : "rgba(0,0,0,0.05)",
                    }}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.2)",
                      backgroundColor: tooltipBg,
                      color: tooltipText,
                    }}
                    itemStyle={{ color: tooltipText, fontWeight: 600 }}
                    formatter={(value) => [
                      `₹${value.toLocaleString()}`,
                      "Sales",
                    ]}
                  />
                  <Bar
                    dataKey="sales"
                    fill="url(#colorSales)"
                    radius={[6, 6, 0, 0]}
                    barSize={40}
                    animationDuration={1500}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Right Column: Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-1"
          >
            <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 h-full">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-4 sm:mb-6 flex items-center gap-2">
                <Briefcase size={16} sm:size={20} className="text-indigo-500" />
                Management Console
              </h3>

              <div className="grid grid-cols-1 gap-2 sm:gap-3">
                {[
                  {
                    id: "supervisor",
                    icon: Users,
                    label: "Add Supervisor",
                    sub: "Manage team leads",
                    color: "blue",
                  },
                  {
                    id: "validator",
                    icon: ShieldCheck,
                    label: "Add Validator",
                    sub: "Manage verifiers",
                    color: "teal",
                  },
                  {
                    id: "admin",
                    icon: Shield,
                    label: "Add Admin",
                    sub: "System moderators",
                    color: "indigo",
                  },
                  {
                    id: "approved_submissions",
                    icon: FileText,
                    label: "View Reports",
                    sub: "Access data logs",
                    color: "emerald",
                  },
                  {
                    id: "all_employees",
                    icon: Briefcase,
                    label: "Employees",
                    sub: "Staff directory",
                    color: "purple",
                  },
                  {
                    id: "active_users",
                    icon: Activity,
                    label: "Active Users",
                    sub: "Currently logged in",
                    color: "orange",
                  },
                ].map((item) => (
                  <motion.button
                    key={item.id}
                    whileHover={{
                      scale: 1.02,
                      backgroundColor:
                        theme === "dark"
                          ? "rgba(30, 41, 59, 0.8)"
                          : "rgba(241, 245, 249, 0.8)",
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveModal(item.id)}
                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 transition-all text-left group"
                  >
                    <div
                      className={`h-10 w-10 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl flex items-center justify-center transition-all bg-${item.color}-100 dark:bg-${item.color}-900/30 text-${item.color}-600 dark:text-${item.color}-400 group-hover:scale-110`}
                    >
                      <item.icon size={16} sm:size={22} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs sm:text-sm">
                        {item.label}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {item.sub}
                      </p>
                    </div>
                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-slate-400">
                      <ArrowRight size={12} sm:size={16} />
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {activeModal &&
        ["supervisor", "validator", "admin"].includes(activeModal) && (
          <UserFormModal
            role={activeModal}
            onClose={() => setActiveModal(null)}
            onSuccess={() => alert(`${activeModal} created successfully!`)}
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
    </div>
  );
}
