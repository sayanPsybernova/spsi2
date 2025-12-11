import { useState } from "react";
import PropTypes from "prop-types";
import { X, Download, Calendar } from "lucide-react";
import axios from "axios";
import { API_ENDPOINTS } from "../config/api";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from "xlsx";
import Swal from 'sweetalert2';
import Loader from "./Loader";

export default function ExportDataModal({ onClose }) {
  const [dateRange, setDateRange] = useState("last_1_month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleExport = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Calculate Dates
      let start = new Date();
      let end = new Date();

      if (dateRange === "custom") {
        if (!startDate || !endDate) {
          throw new Error("Please select both start and end dates.");
        }
        start = new Date(startDate);
        end = new Date(endDate);
        // Set end date to end of day
        end.setHours(23, 59, 59, 999);
      } else {
        if (dateRange === "last_1_month") {
          start.setMonth(start.getMonth() - 1);
        } else if (dateRange === "last_3_months") {
          start.setMonth(start.getMonth() - 3);
        } else if (dateRange === "last_6_months") {
          start.setMonth(start.getMonth() - 6);
        }
        // Start date should be at 00:00:00
        start.setHours(0, 0, 0, 0);
      }

      // 2. Fetch Data
      // Fetching all admin submissions then filtering client-side for simplicity/safety
      // Assuming API returns enough data. If heavy, backend filtering would be better.
      const res = await axios.get(API_ENDPOINTS.submissions, {
        params: { role: "admin", view: "all" } // 'all' to ensure we get everything to filter
      });

      let data = res.data;

      // 3. Filter Data
      const filteredData = data.filter((item) => {
        // Only Approved
        if (item.status !== "Approved") return false;

        const itemDate = new Date(item.created_at);
        return itemDate >= start && itemDate <= end;
      });

      if (filteredData.length === 0) {
        throw new Error("No approved data found for the selected date range.");
      }

      // 4. Sort Old to New
      filteredData.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

      // 5. Format for Excel
      const excelData = filteredData.map(item => ({
        "Date": new Date(item.created_at).toLocaleDateString(),
        "Time": new Date(item.created_at).toLocaleTimeString(),
        "Work Order": item.work_order_number,
        "Line Item": item.line_item_name,
        "Supervisor Name": item.supervisor_name,
        "Supervisor Emp ID": item.supervisor_emp_id,
        "Quantity": item.quantity,
        "UOM": item.uom,
        "Rate": item.snapshot_rate,
        "Revenue": item.revenue,
        "Status": item.status,
        "Remarks": item.remarks || "-"
      }));

      // 6. Generate Excel
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Submissions");
      
      const fileName = `Submissions_Export_${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      Swal.fire({
        title: "Export Successful",
        text: `Downloaded ${filteredData.length} records.`,
        icon: "success",
        timer: 2000,
        showConfirmButton: false
      });
      onClose();

    } catch (err) {
      console.error("Export Error:", err);
      Swal.fire("Export Failed", err.message || "An error occurred during export.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {loading && <Loader text="Generating Export..." />}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
        />
        
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="relative w-full max-w-md bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/50 overflow-hidden"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-slate-200/50 dark:border-slate-700/50">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-300">
              Export Data
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleExport} className="p-6 space-y-5">
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-2">
                <Calendar size={14} /> Date Range
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white font-medium transition-all appearance-none cursor-pointer"
              >
                <option value="last_1_month">Last 1 Month</option>
                <option value="last_3_months">Last 3 Months</option>
                <option value="last_6_months">Last 6 Months</option>
                <option value="custom">Custom Date Range</option>
              </select>
            </div>

            <AnimatePresence>
              {dateRange === "custom" && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="grid grid-cols-2 gap-4 overflow-hidden"
                >
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">From</label>
                    <input
                      required={dateRange === "custom"}
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white font-medium transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">To</label>
                    <input
                      required={dateRange === "custom"}
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white font-medium transition-all"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-emerald-500/30 active:scale-[0.98] transition-all"
              >
                <Download size={20} />
                Download Excel
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

ExportDataModal.propTypes = {
  onClose: PropTypes.func.isRequired,
};
