import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import {
  MessageSquare,
  User,
  Calendar,
  DollarSign,
  Plus,
  Briefcase,
  Layers,
  Database,
  FileText
} from "lucide-react";
import { API_ENDPOINTS } from "../config/api";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("submissions"); // 'submissions' or 'master'
  const [submissions, setSubmissions] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [lineItems, setLineItems] = useState([]);

  // Remark State
  const [remarkModal, setRemarkModal] = useState(null);
  const [adminRemark, setAdminRemark] = useState("");

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
  }, []);

  const fetchSubmissions = async () => {
    try {
      const res = await axios.get(`${API_ENDPOINTS.submissions}?role=admin`);
      setSubmissions(res.data);
    } catch (err) {
      console.error("Failed to fetch submissions:", err);
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

  const handleCreateWO = async (e) => {
    e.preventDefault();
    try {
      await axios.post(API_ENDPOINTS.workOrders, {
        orderNumber: newWO,
      });
      setNewWO("");
      fetchMasterData();
      alert("Work Order Created");
    } catch (err) {
      console.error(err);
      alert("Error creating Work Order");
    }
  };

  const handleCreateLineItem = async (e) => {
    e.preventDefault();
    try {
      await axios.post(API_ENDPOINTS.lineItems, newLineItem);
      setNewLineItem({
        workOrderId: "",
        name: "",
        uom: "",
        rate: "",
        standardManpower: "",
      });
      fetchMasterData();
      alert("Line Item Created");
    } catch (err) {
      console.error(err);
      alert("Error creating Line Item");
    }
  };

  const handleRemark = async () => {
    try {
      await axios.put(
        `${API_ENDPOINTS.submissions}/${remarkModal}/admin-remark`,
        { adminRemarks: adminRemark }
      );
      fetchSubmissions();
      setRemarkModal(null);
      setAdminRemark("");
    } catch (err) {
      console.error("Error adding remark:", err);
      alert("Error adding remark");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      <Navbar />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
        
        {/* Header & Tabs */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Admin Dashboard
            </h1>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">
              Manage master data and view approved submissions.
            </p>
          </div>
          
          <div className="flex p-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveTab("submissions")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === "submissions"
                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <FileText size={16} /> Submissions
            </button>
            <button
              onClick={() => setActiveTab("master")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === "master"
                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <Database size={16} /> Master Data
            </button>
          </div>
        </div>

        {/* --- Submissions View --- */}
        {activeTab === "submissions" && (
          <div className="grid grid-cols-1 gap-4 sm:gap-6 max-h-[70vh] overflow-y-auto">
            {submissions.length === 0 && (
               <div className="text-center py-10 text-slate-500">No approved submissions found.</div>
            )}
            {submissions
              .slice()
              .reverse()
              .map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row gap-4 sm:gap-6 transition-colors hover:shadow-md"
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
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-1 capitalize bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                          {item.status}
                        </span>
                        <div className="flex items-center justify-end gap-1 text-xs text-slate-400 dark:text-slate-500">
                          <Calendar size={12} />
                          <p>{new Date(item.date).toLocaleDateString()}</p>
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
                  </div>

                  <div className="flex items-start justify-end md:pl-4 md:border-l border-slate-100 dark:border-slate-700">
                    <button
                      onClick={() => {
                        setRemarkModal(item.id);
                        setAdminRemark(item.adminRemarks || "");
                      }}
                      className="p-3 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 transition-all flex flex-col items-center gap-1 min-w-[80px]"
                    >
                      <MessageSquare size={20} />
                      <span className="text-sm font-bold">Remark</span>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* --- Master Data View --- */}
        {activeTab === "master" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Work Orders Column */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
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
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold">
                  <Plus size={20} />
                </button>
              </form>

              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {workOrders.map((wo) => (
                  <div key={wo.id} className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-700 flex justify-between items-center">
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{wo.order_number}</span>
                    <span className="text-xs text-slate-400">{new Date(wo.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Line Items Column */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
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
                <button type="submit" className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold">
                  Add Line Item
                </button>
              </form>

              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {lineItems.map((li) => {
                  const parentWO = workOrders.find(w => w.id === li.work_order_id);
                  return (
                    <div key={li.id} className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-700">
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
            </div>

          </div>
        )}
      </main>

      {/* Remark Modal */}
      {remarkModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
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
          </div>
        </div>
      )}
    </div>
  );
}
