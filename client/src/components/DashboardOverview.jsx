import { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line
} from "recharts";
import { API_ENDPOINTS } from "../config/api";
import { DollarSign, TrendingUp, Activity, Users, X, Clock, Calendar, Phone, Mail, BadgeCheck, Briefcase, Sparkles, Zap, ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardOverview() {
  const [stats, setStats] = useState(null);

  // Modal States
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [showRevenueModal, setShowRevenueModal] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [showPerformerModal, setShowPerformerModal] = useState(false);

  const [pendingItems, setPendingItems] = useState([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [revenueTimeframe, setRevenueTimeframe] = useState("weekly");

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

  const handlePendingClick = async () => {
      setShowPendingModal(true);
      setLoadingPending(true);
      try {
          const res = await axios.get(`${API_ENDPOINTS.submissions}?role=admin&view=all`);
          const allData = res.data;
          const pending = allData.filter(s => s.status !== "Approved" && s.status !== "Resubmitted");
          setPendingItems(pending);
      } catch (err) {
          console.error("Failed to fetch pending details", err);
      } finally {
          setLoadingPending(false);
      }
  };

  const getOwner = (status) => {
      if (status === "Pending Validation" || status === "Resubmitted") return { name: "Validator", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" };
      if (status === "Rejected") return { name: "Supervisor", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" };
      return { name: "Admin", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" };
  };

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
    hidden: { y: 30, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  if (!stats) return (
    <div className="p-10 flex flex-col items-center justify-center">
      <div className="relative w-20 h-20 mb-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-500"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="absolute inset-2 rounded-full border-4 border-transparent border-t-accent-500"
        />
      </div>
      <p className="text-slate-500 animate-pulse font-medium">Loading dashboard data...</p>
    </div>
  );

  const statCards = [
    {
      title: "Total Revenue",
      value: `${stats.totalRevenue.toLocaleString()}`,
      prefix: "Rs.",
      icon: DollarSign,
      color: "emerald",
      gradient: "from-emerald-500 to-teal-500",
      onClick: () => setShowRevenueModal(true)
    },
    {
      title: "Approved Jobs",
      value: stats.statusBreakdown.find(s => s.name === "Approved")?.value || 0,
      icon: TrendingUp,
      color: "blue",
      gradient: "from-blue-500 to-cyan-500",
      onClick: () => setShowUsersModal(true)
    },
    {
      title: "Pending Review",
      value: stats.statusBreakdown.find(s => s.name === "Pending")?.value || 0,
      icon: Activity,
      color: "amber",
      gradient: "from-amber-500 to-orange-500",
      onClick: handlePendingClick
    },
    {
      title: "Top Performer",
      value: stats.topSupervisors[0]?.name || "N/A",
      icon: Users,
      color: "purple",
      gradient: "from-purple-500 to-pink-500",
      onClick: () => setShowPerformerModal(true),
      isName: true
    }
  ];

  return (
    <motion.div
        className="space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="show"
    >
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {statCards.map((card, index) => (
          <motion.div key={card.title} variants={itemVariants}>
            <StatCard {...card} index={index} />
          </motion.div>
        ))}
      </div>

      {/* --- MODALS --- */}
      <AnimatePresence>
        {/* 1. Pending Workflow Modal */}
        {showPendingModal && (
            <Modal title="Pending Workflow Status" onClose={() => setShowPendingModal(false)}>
                <div className="flex-1 overflow-y-auto p-6">
                    {loadingPending ? (
                        <div className="text-center py-10 text-slate-500">
                          <div className="flex justify-center mb-4">
                            {[0, 1, 2].map((i) => (
                              <motion.div
                                key={i}
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                                className="w-3 h-3 mx-1 rounded-full bg-primary-500"
                              />
                            ))}
                          </div>
                          Loading details...
                        </div>
                    ) : pendingItems.length === 0 ? (
                        <div className="text-center py-10">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-20 h-20 mx-auto mb-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center"
                          >
                            <Sparkles className="w-10 h-10 text-emerald-500" />
                          </motion.div>
                          <p className="text-slate-500 font-medium">No pending items found. Great job!</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse min-w-[600px]">
                              <thead className="bg-slate-50 dark:bg-slate-900/50 sticky top-0">
                                  <tr>
                                      <th className="p-4 text-xs font-bold text-slate-500 uppercase">Date</th>
                                      <th className="p-4 text-xs font-bold text-slate-500 uppercase">Supervisor</th>
                                      <th className="p-4 text-xs font-bold text-slate-500 uppercase">Work Order</th>
                                      <th className="p-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                                      <th className="p-4 text-xs font-bold text-slate-500 uppercase">Pending With</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                  {pendingItems.map((item, idx) => {
                                      const owner = getOwner(item.status);
                                      return (
                                          <motion.tr
                                            key={item.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                                          >
                                              <td className="p-4 text-sm text-slate-600 dark:text-slate-300">
                                                  {new Date(item.created_at).toLocaleDateString()}
                                              </td>
                                              <td className="p-4 text-sm font-bold text-slate-800 dark:text-white">
                                                  {item.supervisor_name || item.supervisorName || "Unknown"}
                                              </td>
                                              <td className="p-4 text-sm text-slate-600 dark:text-slate-300 font-mono">
                                                  {item.work_order_number}
                                              </td>
                                              <td className="p-4">
                                                  <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                                                      item.status === 'Rejected' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                                                  }`}>
                                                      {item.status}
                                                  </span>
                                              </td>
                                              <td className="p-4">
                                                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${owner.color}`}>
                                                      <Clock size={12} />
                                                      {owner.name}
                                                  </div>
                                              </td>
                                          </motion.tr>
                                      );
                                  })}
                              </tbody>
                          </table>
                        </div>
                    )}
                </div>
            </Modal>
        )}

        {/* 2. Revenue Details Modal */}
        {showRevenueModal && (
            <Modal title="Financial Breakdown" onClose={() => setShowRevenueModal(false)}>
                <div className="p-6">
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="mb-6 p-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg shadow-emerald-500/20 text-white relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16" />
                        <div className="relative z-10 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-emerald-100 uppercase tracking-wider">Total Revenue</p>
                                <h2 className="text-4xl font-black mt-1">Rs.{stats.totalRevenue.toLocaleString()}</h2>
                            </div>
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                                <DollarSign size={32} />
                            </div>
                        </div>
                    </motion.div>

                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-primary-500" />
                      Revenue by Work Order
                    </h3>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                        {stats.revenueBreakdown && stats.revenueBreakdown.map((item, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-primary-200 dark:hover:border-primary-700/50 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm">
                                        {idx + 1}
                                    </div>
                                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{item.name}</span>
                                </div>
                                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-lg group-hover:scale-110 transition-transform">Rs.{item.value.toLocaleString()}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </Modal>
        )}

        {/* 3. User Performance Details Modal */}
        {showUsersModal && (
            <Modal title="User Productivity Report" onClose={() => setShowUsersModal(false)}>
                <div className="p-6 overflow-y-auto">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[500px]">
                          <thead className="bg-slate-50 dark:bg-slate-900/50 sticky top-0">
                              <tr>
                                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">User</th>
                                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Role</th>
                                  <th className="p-4 text-xs font-bold text-slate-500 uppercase text-center">Approved</th>
                                  <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">Revenue</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                              {stats.userPerformance && stats.userPerformance.map((u, idx) => (
                                  <motion.tr
                                    key={u.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                                  >
                                      <td className="p-4 flex items-center gap-3">
                                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 p-[2px]">
                                            <div className="w-full h-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                                {u.image ? <img src={u.image.startsWith('http') ? u.image : `${API_ENDPOINTS.uploads}/../${u.image}`} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Users size={16} className="text-slate-400"/></div>}
                                            </div>
                                          </div>
                                          <span className="font-bold text-slate-800 dark:text-white text-sm">{u.name}</span>
                                      </td>
                                      <td className="p-4">
                                        <span className="text-xs uppercase font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                                            {u.role}
                                        </span>
                                      </td>
                                      <td className="p-4 text-center">
                                          <span className="inline-block px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-xs font-bold">
                                              {u.approved_count}
                                          </span>
                                      </td>
                                      <td className="p-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                                          Rs.{u.revenue_generated.toLocaleString()}
                                      </td>
                                  </motion.tr>
                              ))}
                          </tbody>
                      </table>
                    </div>
                </div>
            </Modal>
        )}

        {/* 4. Top Performer Profile Modal */}
        {showPerformerModal && (
            <Modal title="Top Performer Profile" onClose={() => setShowPerformerModal(false)}>
                <div className="p-8 flex flex-col items-center text-center">
                    {stats.topPerformerDetails ? (
                        <>
                            <motion.div
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ type: "spring", stiffness: 200, damping: 15 }}
                              className="relative mb-6"
                            >
                              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-xl opacity-50 scale-110" />
                              <div className="relative w-32 h-32 rounded-full p-1 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-500 shadow-xl">
                                  <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-slate-900">
                                      {stats.topPerformerDetails.image ? (
                                          <img src={stats.topPerformerDetails.image.startsWith('http') ? stats.topPerformerDetails.image : `${API_ENDPOINTS.uploads}/../${stats.topPerformerDetails.image}`} className="w-full h-full object-cover" />
                                      ) : (
                                          <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400">
                                              <Users size={64} />
                                          </div>
                                      )}
                                  </div>
                              </div>
                              <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute -bottom-2 -right-2 bg-gradient-to-br from-yellow-400 to-amber-500 text-white p-3 rounded-full shadow-lg border-4 border-white dark:border-slate-800"
                              >
                                  <BadgeCheck size={24} />
                              </motion.div>
                            </motion.div>

                            <motion.h2
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.2 }}
                              className="text-2xl font-black text-slate-900 dark:text-white mb-1"
                            >
                              {stats.topPerformerDetails.name}
                            </motion.h2>
                            <motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.3 }}
                              className="text-sm font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wide mb-6"
                            >
                              {stats.topPerformerDetails.role}
                            </motion.p>

                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.4 }}
                              className="w-full max-w-sm bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 space-y-4 text-left"
                            >
                                {[
                                  { icon: Briefcase, label: "Employee ID", value: stats.topPerformerDetails.emp_id },
                                  { icon: Phone, label: "Phone", value: stats.topPerformerDetails.phone },
                                  { icon: Mail, label: "Email", value: stats.topPerformerDetails.email || "N/A" }
                                ].map((item, idx) => (
                                  <div key={idx} className="flex items-center gap-4">
                                      <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl text-slate-400 border border-slate-100 dark:border-slate-700 shadow-sm">
                                          <item.icon size={18} />
                                      </div>
                                      <div>
                                          <p className="text-xs font-bold text-slate-400 uppercase">{item.label}</p>
                                          <p className="font-bold text-slate-800 dark:text-white truncate max-w-[200px]">{item.value}</p>
                                      </div>
                                  </div>
                                ))}
                            </motion.div>

                            <motion.div
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.5 }}
                              className="mt-6 w-full max-w-sm"
                            >
                                <div className="p-5 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl text-white shadow-lg shadow-primary-500/20">
                                    <span className="text-sm font-medium text-primary-100">Total Revenue Generated</span>
                                    <p className="text-3xl font-black mt-1">Rs.{stats.topPerformerDetails.total_revenue.toLocaleString()}</p>
                                </div>
                            </motion.div>
                        </>
                    ) : (
                        <div className="text-slate-500 py-10">No top performer data available.</div>
                    )}
                </div>
            </Modal>
        )}
      </AnimatePresence>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: Revenue Trend (Big) */}
        <motion.div
            variants={itemVariants}
            className="lg:col-span-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 lg:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700/50 hover:shadow-xl transition-shadow duration-500"
        >
          <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-xl text-primary-600 dark:text-primary-400">
                  <TrendingUp size={20} />
                </div>
                Revenue Analysis
              </h3>
              <div className="flex bg-slate-100 dark:bg-slate-700/50 p-1.5 rounded-xl">
                  {['weekly', 'monthly', 'yearly'].map(t => (
                      <button
                        key={t}
                        onClick={() => setRevenueTimeframe(t)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all ${
                            revenueTimeframe === t
                            ? 'bg-white dark:bg-slate-600 text-primary-600 dark:text-white shadow-sm'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                        }`}
                      >
                          {t}
                      </button>
                  ))}
              </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {revenueTimeframe === 'weekly' && (
                  <AreaChart data={stats.dailyRevenue}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 500}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '16px',
                        border: 'none',
                        boxShadow: '0 10px 40px -5px rgba(0, 0, 0, 0.15)',
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)'
                      }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
              )}
              {revenueTimeframe === 'monthly' && (
                  <BarChart data={stats.monthlyRevenue}>
                    <defs>
                      <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1}/>
                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0.8}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 500}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '16px',
                        border: 'none',
                        boxShadow: '0 10px 40px -5px rgba(0, 0, 0, 0.15)',
                        background: 'rgba(255, 255, 255, 0.95)'
                      }}
                    />
                    <Bar dataKey="revenue" fill="url(#colorBar)" radius={[8, 8, 0, 0]} barSize={35} />
                  </BarChart>
              )}
              {revenueTimeframe === 'yearly' && (
                  <LineChart data={stats.yearlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 500}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '16px',
                        border: 'none',
                        boxShadow: '0 10px 40px -5px rgba(0, 0, 0, 0.15)',
                        background: 'rgba(255, 255, 255, 0.95)'
                      }}
                    />
                    <Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={3} dot={{r: 5, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 8, fill: '#f59e0b'}} />
                  </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Right: Status Breakdown */}
        <motion.div
            variants={itemVariants}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 lg:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700/50 hover:shadow-xl transition-shadow duration-500"
        >
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
            <div className="p-2 bg-accent-100 dark:bg-accent-900/30 rounded-xl text-accent-600 dark:text-accent-400">
              <Activity size={20} />
            </div>
            Submission Status
          </h3>
          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.statusBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {stats.statusBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 10px 40px -5px rgba(0, 0, 0, 0.15)',
                    background: 'rgba(255, 255, 255, 0.95)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="block text-4xl font-black text-slate-800 dark:text-white"
                    >
                        {stats.statusBreakdown.reduce((a,b) => a + b.value, 0)}
                    </motion.span>
                    <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Total</span>
                </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mt-6">
              {stats.statusBreakdown.map(s => (
                  <div key={s.name} className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full shadow-sm" style={{backgroundColor: s.color}}></span>
                      <span className="text-xs font-bold text-slate-500">{s.name}</span>
                  </div>
              ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function StatCard({ title, value, prefix, icon: Icon, color, gradient, onClick, isName, index }) {
    const colorClasses = {
      emerald: "from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20 border-emerald-200/50 dark:border-emerald-800/30",
      blue: "from-blue-500/10 to-cyan-500/10 hover:from-blue-500/20 hover:to-cyan-500/20 border-blue-200/50 dark:border-blue-800/30",
      amber: "from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 border-amber-200/50 dark:border-amber-800/30",
      purple: "from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 border-purple-200/50 dark:border-purple-800/30"
    };

    return (
        <motion.div
            whileHover={{ scale: 1.03, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`relative bg-gradient-to-br ${colorClasses[color]} bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border hover:shadow-xl cursor-pointer group transition-all duration-500 overflow-hidden`}
        >
            {/* Animated gradient background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

            {/* Icon glow */}
            <div className={`absolute top-4 right-4 w-20 h-20 bg-gradient-to-br ${gradient} rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500`} />

            <div className="relative z-10 flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">{title}</p>
                    <h4 className={`${isName ? 'text-xl' : 'text-3xl'} font-black text-slate-800 dark:text-white leading-tight`}>
                      {prefix && <span className="text-lg font-bold text-slate-500 dark:text-slate-400">{prefix}</span>}
                      {value}
                    </h4>
                </div>
                <motion.div
                  whileHover={{ rotate: 15, scale: 1.1 }}
                  className={`p-3 rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg`}
                >
                    <Icon size={24} />
                </motion.div>
            </div>

            {/* View more indicator */}
            <div className="mt-4 flex items-center gap-1 text-xs font-medium text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
              <span>View details</span>
              <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
        </motion.div>
    );
}

function Modal({ title, children, onClose }) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
          <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden border border-white/20 dark:border-slate-700/50"
          >
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-700">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-primary-500" />
                    {title}
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  >
                      <X size={20} />
                  </motion.button>
              </div>
              {children}
          </motion.div>
      </motion.div>
    );
}
