import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Download,
  Sparkles,
  BarChart3,
  Eye,
  CalendarDays,
  CalendarRange,
  Clock,
  Activity,
  ChevronRight,
} from "lucide-react";
import ExportDataModal from "../components/ExportDataModal";
import Navbar from "../components/Navbar";
import AnimatedBackground from "../components/AnimatedBackground";
import { API_ENDPOINTS } from "../config/api";
import { useTheme } from "../context/ThemeContext";
import Loader from "../components/Loader";

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

export default function ManagerDashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    mtdRevenue: 0,
    ytdRevenue: 0,
    weeklyRevenue: 0,
    dailyCumulativeRevenue: 0,
    dailyRevenue: [],
    monthlyRevenue: [],
    yearlyRevenue: [],
    statusBreakdown: [],
  });
  const [loading, setLoading] = useState(true);
  const [showExportModal, setShowExportModal] = useState(false);
  const [chartView, setChartView] = useState("monthly"); // weekly, monthly, yearly
  const { theme } = useTheme();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_ENDPOINTS.stats);
      setStats(res.data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setLoading(false);
    }
  };

  // Chart Colors
  const axisColor = theme === "dark" ? "#94a3b8" : "#64748b";
  const tooltipBg = theme === "dark" ? "#1e293b" : "#ffffff";
  const tooltipText = theme === "dark" ? "#f8fafc" : "#1e293b";
  const gridColor = theme === "dark" ? "#334155" : "#e2e8f0";

  // Get chart data based on view
  const getChartData = () => {
    switch (chartView) {
      case "weekly":
        return stats.dailyRevenue || [];
      case "monthly":
        return stats.monthlyRevenue || [];
      case "yearly":
        return stats.yearlyRevenue || [];
      default:
        return stats.monthlyRevenue || [];
    }
  };

  // Pie chart colors
  const COLORS = ["#10b981", "#f59e0b", "#ef4444"];

  // Format currency
  const formatCurrency = (value) => {
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)}L`;
    } else if (value >= 1000) {
      return `₹${(value / 1000).toFixed(1)}K`;
    }
    return `₹${value}`;
  };

  // Get current date info
  const today = new Date();
  const currentMonth = today.toLocaleDateString("en-US", { month: "long" });
  const currentYear = today.getFullYear();
  const weekStart = new Date(today);
  const dayOfWeek = weekStart.getDay();
  const diff = weekStart.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  weekStart.setDate(diff);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const statCards = [
    {
      id: "daily",
      label: "Today's Revenue",
      value: stats.dailyCumulativeRevenue || 0,
      icon: Clock,
      subtext: today.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }),
      gradient: "from-cyan-500 to-blue-500",
      bgGlow: "bg-cyan-500",
    },
    {
      id: "weekly",
      label: "Weekly Revenue",
      value: stats.weeklyRevenue || 0,
      icon: CalendarDays,
      subtext: `${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
      gradient: "from-violet-500 to-purple-500",
      bgGlow: "bg-violet-500",
    },
    {
      id: "mtd",
      label: "MTD Revenue",
      value: stats.mtdRevenue || 0,
      icon: Calendar,
      subtext: `${currentMonth} ${currentYear}`,
      gradient: "from-emerald-500 to-teal-500",
      bgGlow: "bg-emerald-500",
    },
    {
      id: "ytd",
      label: "YTD Revenue",
      value: stats.ytdRevenue || 0,
      icon: CalendarRange,
      subtext: `Jan - ${currentMonth} ${currentYear}`,
      gradient: "from-amber-500 to-orange-500",
      bgGlow: "bg-amber-500",
    },
  ];

  if (loading) {
    return <Loader text="Loading dashboard..." />;
  }

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
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <Eye className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </div>
              <span className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Manager Portal
              </span>
            </motion.div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              Revenue
              <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent"> Dashboard</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-base sm:text-lg max-w-xl">
              Track cumulative revenue metrics and export data reports.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3"
          >
            <div className="flex items-center gap-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-3 sm:p-4 rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-700/50">
              <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl text-white shadow-lg shadow-emerald-500/20">
                <Calendar size={20} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Today</p>
                <span className="text-sm font-bold text-slate-800 dark:text-white">
                  {today.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Stats Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8"
        >
          {statCards.map((card) => (
            <motion.div
              key={card.id}
              variants={itemVariants}
              className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700/50 overflow-hidden group hover:shadow-xl transition-all duration-500"
            >
              <div className={`absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-br ${card.gradient} opacity-10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700`} />

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                    {card.label}
                  </p>
                  <motion.div
                    whileHover={{ rotate: 15, scale: 1.1 }}
                    className={`p-3 bg-gradient-to-br ${card.gradient} rounded-xl text-white shadow-lg`}
                  >
                    <card.icon size={20} />
                  </motion.div>
                </div>

                <h3 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white mb-2">
                  <span className="text-lg font-bold text-slate-500">₹</span>
                  {card.value.toLocaleString()}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {card.subtext}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Layout Grid */}
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column: Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 lg:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700/50 hover:shadow-xl transition-all duration-500"
          >
            <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl text-white shadow-lg shadow-emerald-500/20">
                  <BarChart3 size={20} />
                </div>
                Revenue Analytics
              </h2>

              {/* Chart View Toggle */}
              <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-700/50">
                {["weekly", "monthly", "yearly"].map((view) => (
                  <button
                    key={view}
                    onClick={() => setChartView(view)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      chartView === view
                        ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    }`}
                  >
                    {view.charAt(0).toUpperCase() + view.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-[280px] sm:h-[320px] lg:h-[380px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                {chartView === "weekly" ? (
                  <AreaChart data={getChartData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} strokeOpacity={0.5} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: axisColor, fontSize: 12, fontWeight: 500 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: axisColor, fontSize: 12 }} tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "16px",
                        border: "none",
                        boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.2)",
                        backgroundColor: tooltipBg,
                        color: tooltipText,
                        padding: "12px 16px",
                      }}
                      formatter={(value) => [`₹${value.toLocaleString()}`, "Revenue"]}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fill="url(#colorRevenue)" />
                  </AreaChart>
                ) : chartView === "yearly" ? (
                  <LineChart data={getChartData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} strokeOpacity={0.5} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: axisColor, fontSize: 12, fontWeight: 500 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: axisColor, fontSize: 12 }} tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "16px",
                        border: "none",
                        boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.2)",
                        backgroundColor: tooltipBg,
                        color: tooltipText,
                        padding: "12px 16px",
                      }}
                      formatter={(value) => [`₹${value.toLocaleString()}`, "Revenue"]}
                    />
                    <Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={3} dot={{ fill: "#f59e0b", strokeWidth: 2, r: 5 }} activeDot={{ r: 8, stroke: "#f59e0b", strokeWidth: 2 }} />
                  </LineChart>
                ) : (
                  <BarChart data={getChartData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                        <stop offset="100%" stopColor="#14b8a6" stopOpacity={0.8} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} strokeOpacity={0.5} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: axisColor, fontSize: 12, fontWeight: 500 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: axisColor, fontSize: 12 }} tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip
                      cursor={{ fill: theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)", radius: 8 }}
                      contentStyle={{
                        borderRadius: "16px",
                        border: "none",
                        boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.2)",
                        backgroundColor: tooltipBg,
                        color: tooltipText,
                        padding: "12px 16px",
                      }}
                      formatter={(value) => [`₹${value.toLocaleString()}`, "Revenue"]}
                    />
                    <Bar dataKey="revenue" fill="url(#colorBar)" radius={[10, 10, 0, 0]} barSize={35} animationDuration={1500} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Right Column: Quick Actions & Status */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-1 space-y-6"
          >
            {/* Total Revenue Card */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-3xl shadow-lg shadow-emerald-500/20 text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <DollarSign size={24} />
                </div>
                <span className="text-sm font-bold uppercase tracking-wider opacity-90">Total Revenue</span>
              </div>
              <h3 className="text-4xl font-black mb-2">
                ₹{(stats.totalRevenue || 0).toLocaleString()}
              </h3>
              <p className="text-sm opacity-80">All-time approved revenue</p>
            </div>

            {/* Status Breakdown */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700/50">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl text-white shadow-lg shadow-violet-500/20">
                  <Activity size={18} />
                </div>
                Status Overview
              </h3>

              <div className="h-[150px] mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.statusBreakdown || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {(stats.statusBreakdown || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 10px 20px -5px rgba(0, 0, 0, 0.15)",
                        backgroundColor: tooltipBg,
                        color: tooltipText,
                        padding: "8px 12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2">
                {(stats.statusBreakdown || []).map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-900/30">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color || COLORS[index % COLORS.length] }} />
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{item.name}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Export Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowExportModal(true)}
              className="w-full flex items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <Download size={22} />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-lg">Export Data</h4>
                  <p className="text-sm opacity-80">Download Excel reports</p>
                </div>
              </div>
              <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>
        </div>
      </main>

      {/* Export Modal */}
      <AnimatePresence>
        {showExportModal && (
          <ExportDataModal onClose={() => setShowExportModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
