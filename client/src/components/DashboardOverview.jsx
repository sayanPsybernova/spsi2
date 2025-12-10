import { useState, useEffect } from "react";
import axios from "axios";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line 
} from "recharts";
import { API_ENDPOINTS } from "../config/api";
import { DollarSign, TrendingUp, Activity, Users, X, Clock, Calendar, Phone, Mail, BadgeCheck, Briefcase } from "lucide-react";

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
      if (status === "Pending Validation" || status === "Resubmitted") return { name: "Validator", color: "bg-orange-100 text-orange-700" };
      if (status === "Rejected") return { name: "Supervisor", color: "bg-red-100 text-red-700" };
      return { name: "Admin", color: "bg-blue-100 text-blue-700" };
  };

  if (!stats) return <div className="p-10 text-center text-slate-500 animate-pulse">Loading dashboard data...</div>;

  return (
    <div className="space-y-6">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Revenue" 
          value={`₹${stats.totalRevenue.toLocaleString()}`} 
          icon={<DollarSign size={24} />} 
          color="bg-emerald-500" 
          onClick={() => setShowRevenueModal(true)}
        />
        <StatCard 
          title="Approved Jobs" 
          value={stats.statusBreakdown.find(s => s.name === "Approved")?.value || 0} 
          icon={<TrendingUp size={24} />} 
          color="bg-blue-500" 
          onClick={() => setShowUsersModal(true)}
        />
        <StatCard 
          title="Pending Review" 
          value={stats.statusBreakdown.find(s => s.name === "Pending")?.value || 0} 
          icon={<Activity size={24} />} 
          color="bg-amber-500" 
          onClick={handlePendingClick}
        />
        <StatCard 
          title="Top Performer" 
          value={stats.topSupervisors[0]?.name || "N/A"} 
          icon={<Users size={24} />} 
          color="bg-purple-500" 
          onClick={() => setShowPerformerModal(true)}
        />
      </div>

      {/* --- MODALS --- */}

      {/* 1. Pending Workflow Modal */}
      {showPendingModal && (
          <Modal title="Pending Workflow Status" onClose={() => setShowPendingModal(false)}>
              <div className="flex-1 overflow-y-auto p-6">
                  {loadingPending ? (
                      <div className="text-center py-10 text-slate-500">Loading details...</div>
                  ) : pendingItems.length === 0 ? (
                      <div className="text-center py-10 text-slate-500">No pending items found. Good job!</div>
                  ) : (
                      <table className="w-full text-left border-collapse">
                          <thead className="bg-slate-50 dark:bg-slate-900/50 sticky top-0">
                              <tr>
                                  <th className="p-3 text-xs font-bold text-slate-500 uppercase">Date</th>
                                  <th className="p-3 text-xs font-bold text-slate-500 uppercase">Supervisor</th>
                                  <th className="p-3 text-xs font-bold text-slate-500 uppercase">Work Order</th>
                                  <th className="p-3 text-xs font-bold text-slate-500 uppercase">Status</th>
                                  <th className="p-3 text-xs font-bold text-slate-500 uppercase">Current Pending With</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                              {pendingItems.map(item => {
                                  const owner = getOwner(item.status);
                                  return (
                                      <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                          <td className="p-3 text-sm text-slate-600 dark:text-slate-300">
                                              {new Date(item.created_at).toLocaleDateString()}
                                          </td>
                                          <td className="p-3 text-sm font-bold text-slate-800 dark:text-white">
                                              {item.supervisor_name || item.supervisorName || "Unknown"}
                                          </td>
                                          <td className="p-3 text-sm text-slate-600 dark:text-slate-300 font-mono">
                                              {item.work_order_number}
                                          </td>
                                          <td className="p-3">
                                              <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                  item.status === 'Rejected' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                                              }`}>
                                                  {item.status}
                                              </span>
                                          </td>
                                          <td className="p-3">
                                              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${owner.color}`}>
                                                  <Clock size={12} />
                                                  {owner.name}
                                              </div>
                                          </td>
                                      </tr>
                                  );
                              })}
                          </tbody>
                      </table>
                  )}
              </div>
          </Modal>
      )}

      {/* 2. Revenue Details Modal */}
      {showRevenueModal && (
          <Modal title="Financial Breakdown" onClose={() => setShowRevenueModal(false)}>
              <div className="p-6">
                  <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800/30 flex items-center justify-between">
                      <div>
                          <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase">Total Revenue</p>
                          <h2 className="text-3xl font-black text-slate-900 dark:text-white">₹{stats.totalRevenue.toLocaleString()}</h2>
                      </div>
                      <div className="bg-white dark:bg-emerald-900/50 p-3 rounded-full text-emerald-500">
                          <DollarSign size={32} />
                      </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Revenue by Work Order</h3>
                  <div className="space-y-3">
                      {stats.revenueBreakdown && stats.revenueBreakdown.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-700">
                              <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs">
                                      {idx + 1}
                                  </div>
                                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{item.name}</span>
                              </div>
                              <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{item.value.toLocaleString()}</span>
                          </div>
                      ))}
                  </div>
              </div>
          </Modal>
      )}

      {/* 3. User Performance Details Modal (Approved Jobs Click) */}
      {showUsersModal && (
          <Modal title="User Productivity Report" onClose={() => setShowUsersModal(false)}>
              <div className="p-6 overflow-y-auto">
                  <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50 dark:bg-slate-900/50 sticky top-0">
                          <tr>
                              <th className="p-3 text-xs font-bold text-slate-500 uppercase">User</th>
                              <th className="p-3 text-xs font-bold text-slate-500 uppercase">Role</th>
                              <th className="p-3 text-xs font-bold text-slate-500 uppercase text-center">Approved Jobs</th>
                              <th className="p-3 text-xs font-bold text-slate-500 uppercase text-right">Revenue Generated</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                          {stats.userPerformance && stats.userPerformance.map(u => (
                              <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                  <td className="p-3 flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                          {u.image ? <img src={u.image.startsWith('http') ? u.image : `${API_ENDPOINTS.uploads}/../${u.image}`} className="w-full h-full object-cover" /> : <Users size={16} className="m-2 text-slate-400"/>}
                                      </div>
                                      <span className="font-bold text-slate-800 dark:text-white text-sm">{u.name}</span>
                                  </td>
                                  <td className="p-3 text-xs uppercase font-bold text-slate-500">
                                      {u.role}
                                  </td>
                                  <td className="p-3 text-center">
                                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold">
                                          {u.approved_count}
                                      </span>
                                  </td>
                                  <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                                      ₹{u.revenue_generated.toLocaleString()}
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </Modal>
      )}

      {/* 4. Top Performer Profile Modal */}
      {showPerformerModal && (
          <Modal title="Top Performer Profile" onClose={() => setShowPerformerModal(false)}>
              <div className="p-8 flex flex-col items-center text-center">
                  {stats.topPerformerDetails ? (
                      <>
                          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 p-1 shadow-xl mb-6 relative">
                              <div className="w-full h-full rounded-full overflow-hidden bg-white">
                                  {stats.topPerformerDetails.image ? (
                                      <img src={stats.topPerformerDetails.image.startsWith('http') ? stats.topPerformerDetails.image : `${API_ENDPOINTS.uploads}/../${stats.topPerformerDetails.image}`} className="w-full h-full object-cover" />
                                  ) : (
                                      <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                                          <Users size={64} />
                                      </div>
                                  )}
                              </div>
                              <div className="absolute bottom-0 right-0 bg-yellow-400 text-white p-2 rounded-full shadow-lg border-2 border-white">
                                  <BadgeCheck size={24} />
                              </div>
                          </div>
                          
                          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1">{stats.topPerformerDetails.name}</h2>
                          <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide mb-6">{stats.topPerformerDetails.role}</p>
                          
                          <div className="w-full max-w-sm bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 space-y-4 text-left">
                              <div className="flex items-center gap-4">
                                  <div className="p-2 bg-white dark:bg-slate-800 rounded-lg text-slate-400 border border-slate-100 dark:border-slate-700">
                                      <Briefcase size={18} />
                                  </div>
                                  <div>
                                      <p className="text-xs font-bold text-slate-400 uppercase">Employee ID</p>
                                      <p className="font-mono font-bold text-slate-800 dark:text-white">{stats.topPerformerDetails.emp_id}</p>
                                  </div>
                              </div>
                              <div className="flex items-center gap-4">
                                  <div className="p-2 bg-white dark:bg-slate-800 rounded-lg text-slate-400 border border-slate-100 dark:border-slate-700">
                                      <Phone size={18} />
                                  </div>
                                  <div>
                                      <p className="text-xs font-bold text-slate-400 uppercase">Phone</p>
                                      <p className="font-bold text-slate-800 dark:text-white">{stats.topPerformerDetails.phone}</p>
                                  </div>
                              </div>
                              <div className="flex items-center gap-4">
                                  <div className="p-2 bg-white dark:bg-slate-800 rounded-lg text-slate-400 border border-slate-100 dark:border-slate-700">
                                      <Mail size={18} />
                                  </div>
                                  <div>
                                      <p className="text-xs font-bold text-slate-400 uppercase">Email</p>
                                      <p className="font-bold text-slate-800 dark:text-white truncate max-w-[200px]">{stats.topPerformerDetails.email || "N/A"}</p>
                                  </div>
                              </div>
                          </div>

                          <div className="mt-6 w-full max-w-sm">
                              <div className="flex justify-between items-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
                                  <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">Total Revenue Generated</span>
                                  <span className="text-xl font-black text-indigo-700 dark:text-indigo-300">₹{stats.topPerformerDetails.total_revenue.toLocaleString()}</span>
                              </div>
                          </div>
                      </>
                  ) : (
                      <div className="text-slate-500">No top performer data available.</div>
                  )}
              </div>
          </Modal>
      )}

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Revenue Trend (Big) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Revenue Analysis</h3>
              <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
                  {['weekly', 'monthly', 'yearly'].map(t => (
                      <button 
                        key={t}
                        onClick={() => setRevenueTimeframe(t)}
                        className={`px-3 py-1 rounded-md text-xs font-bold capitalize transition-all ${
                            revenueTimeframe === t 
                            ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-white shadow-sm' 
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
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
              )}
              {revenueTimeframe === 'monthly' && (
                  <BarChart data={stats.monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Bar dataKey="revenue" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={30} />
                  </BarChart>
              )}
              {revenueTimeframe === 'yearly' && (
                  <LineChart data={stats.yearlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={3} dot={{r: 4, fill: '#f59e0b'}} />
                  </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Status Breakdown */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Submission Status</h3>
          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.statusBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.statusBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                    <span className="block text-3xl font-bold text-slate-800 dark:text-white">
                        {stats.statusBreakdown.reduce((a,b) => a + b.value, 0)}
                    </span>
                    <span className="text-xs text-slate-400 uppercase font-bold">Total</span>
                </div>
            </div>
          </div>
          
          <div className="flex justify-center gap-4 mt-4">
              {stats.statusBreakdown.map(s => (
                  <div key={s.name} className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{backgroundColor: s.color}}></span>
                      <span className="text-xs font-bold text-slate-500">{s.name}</span>
                  </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, onClick }) {
    return (
        <div 
            onClick={onClick}
            className={`bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300 cursor-pointer group`}
        >
            <div className={`p-4 rounded-xl text-white shadow-lg shadow-${color.replace('bg-', '')}/30 ${color} group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</p>
                <h4 className="text-2xl font-black text-slate-800 dark:text-white mt-1">{value}</h4>
            </div>
        </div>
    )
}

function Modal({ title, children, onClose }) {
    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}