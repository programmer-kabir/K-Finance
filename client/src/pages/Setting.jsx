import { useState, useEffect } from "react";
import {
  User,
  Settings,
  Database,
  Download,
  CheckCircle,
  Loader2,
  AlertCircle,
  Save
} from "lucide-react";
import API_BASE from "../api";

const Setting = () => {
  // Profile settings
  const [profileName, setProfileName] = useState(() => localStorage.getItem("adminName") || "Kabir");
  const [currency, setCurrency] = useState(() => localStorage.getItem("currency") || "BDT (৳)");
  
  // Statuses
  const [dbStatus, setDbStatus] = useState("checking"); // 'checking' | 'connected' | 'error'
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Load database status
  useEffect(() => {
    // Verify DB/API Status
    const checkDb = async () => {
      try {
        const res = await fetch(`${API_BASE}/cash`);
        const json = await res.json();
        if (json.success) {
          setDbStatus("connected");
        } else {
          setDbStatus("error");
        }
      } catch (err) {
        console.error("DB Connection Check Failed:", err);
        setDbStatus("error");
      }
    };
    checkDb();
  }, []);

  // Save Settings
  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      localStorage.setItem("adminName", profileName);
      localStorage.setItem("currency", currency);

      // Dispatch custom event to notify sidebar
      const event = new Event("settings-update");
      window.dispatchEvent(event);

      setTimeout(() => {
        setSaving(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }, 600);
    } catch (err) {
      console.error("Save Settings Failed:", err);
      setSaving(false);
      alert("সেটিংস সেভ করতে ব্যর্থ হয়েছে।");
    }
  };

  // Export Data to CSV
  const handleExportCSV = async () => {
    try {
      setExporting(true);
      const res = await fetch("http://localhost:3000/cash");
      const result = await res.json();
      if (!result.success) throw new Error(result.message);
      
      const data = result.data || [];
      if (data.length === 0) {
        alert("রপ্তানি করার জন্য কোন লেনদেন পাওয়া যায়নি।");
        return;
      }
      
      // Build CSV String (with UTF-8 BOM to support Bengali character encoding)
      const headers = ["ID", "Type", "Transaction Date", "Purpose", "Category", "Amount", "Source/Payee", "Remarks", "Created At"];
      const csvRows = [headers.join(",")];
      
      data.forEach(tx => {
        const values = [
          tx.id,
          tx.type === "in" ? "Income" : "Expense",
          tx.transaction_date,
          `"${(tx.purpose || "").replace(/"/g, '""')}"`,
          tx.category,
          tx.amount,
          `"${(tx.source || "").replace(/"/g, '""')}"`,
          `"${(tx.remarks || "").replace(/"/g, '""')}"`,
          tx.created_at
        ];
        csvRows.push(values.join(","));
      });
      
      const csvContent = "\uFEFF" + csvRows.join("\n"); // UTF-8 BOM
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `k_finance_export_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert("এক্সপোর্ট করতে ব্যর্থ হয়েছে: " + err.message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-100 p-2 md:p-6 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            কে-ফাইনান্স সেটিংস (Settings)
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            আপনার ব্যবহারকারী প্রোফাইল কনফিগারেশন এবং সিস্টেম ডেটা ম্যানেজ করুন
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Form Settings (Colspan 2) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-md">
            <h3 className="text-base font-bold text-slate-200 mb-5 flex items-center gap-2 pb-2 border-b border-slate-800/60">
              <User size={18} className="text-blue-400" />
              <span>ব্যবহারকারী প্রোফাইল সেটিংস</span>
            </h3>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              
              {/* Profile Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-medium">ব্যবহারকারীর নাম (Profile Name)</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="যেমন: Kabir"
                  required
                  className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-blue-500/50 w-full"
                />
                <span className="text-[10px] text-slate-500">এটি আপনার ইন্টারফেস এবং সাইডবারে নাম হিসেবে প্রদর্শিত হবে।</span>
              </div>

              {/* Currency Display */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-medium">মুদ্রা বা কারেন্সি ফরম্যাট (Currency)</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-blue-500/50 w-full"
                >
                  <option value="BDT (৳)">বাংলাদেশী টাকা (৳)</option>
                  <option value="USD ($)">ইউএস ডলার ($)</option>
                  <option value="EUR (€)">ইউরো (€)</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800/60">
                <div>
                  {saveSuccess && (
                    <span className="text-xs text-emerald-400 flex items-center gap-1.5 animation-fade-in font-medium">
                      <CheckCircle size={14} />
                      <span>সেটিংস সফলভাবে সংরক্ষিত হয়েছে!</span>
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-950/20 transition-all active:scale-95"
                >
                  {saving ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      <span>সংরক্ষণ হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>সেভ করুন</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>

          {/* Backup and Data Management */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-md">
            <h3 className="text-base font-bold text-slate-200 mb-4 flex items-center gap-2 pb-2 border-b border-slate-800/60">
              <Settings size={18} className="text-indigo-400" />
              <span>ডেটা ব্যাকআপ এবং রপ্তানি (Data Management)</span>
            </h3>

            <div className="space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed">
                আপনার K-Finance প্রজেক্টের সব লেনদেন ডকআউট করে একটি এক্সেল-সামঞ্জস্যপূর্ণ CSV ফাইল হিসাবে আপনার কম্পিউটারে ডাউনলোড করুন। এটি দ্বারা যেকোনো স্প্রেডশীট অ্যাপে আপনার আয়ের হিসাব বিশ্লেষণ করতে পারবেন।
              </p>

              <button
                onClick={handleExportCSV}
                disabled={exporting}
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/60 active:scale-95 transition-all shadow-md"
              >
                {exporting ? (
                  <>
                    <Loader2 className="animate-spin text-indigo-400" size={16} />
                    <span>প্রস্তুত করা হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Download size={16} className="text-indigo-400" />
                    <span>সব ডেটা CSV ফাইল হিসেবে নামিয়ে নিন</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Database connection status (Colspan 1) */}
        <div className="space-y-6">
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-md">
            <h3 className="text-base font-bold text-slate-200 mb-4 flex items-center gap-2 pb-2 border-b border-slate-800/60">
              <Database size={18} className="text-purple-400" />
              <span>ডেটাবেস সংযোগ স্থিতি</span>
            </h3>

            <div className="space-y-4 text-xs">
              {/* API Status */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-850">
                <span className="text-slate-400">সার্ভার স্ট্যাটাস:</span>
                <div className="flex items-center gap-1.5 font-bold">
                  {dbStatus === "checking" ? (
                    <>
                      <Loader2 className="animate-spin text-slate-500" size={14} />
                      <span className="text-slate-500">যাচাই করা হচ্ছে</span>
                    </>
                  ) : dbStatus === "connected" ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="text-emerald-400 font-semibold">সচল (Online)</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="text-red-400" size={14} />
                      <span className="text-red-400 font-semibold">অফলাইন (Offline)</span>
                    </>
                  )}
                </div>
              </div>

              {/* Supabase URL */}
              <div className="flex flex-col gap-1 p-3 rounded-xl bg-slate-950/40 border border-slate-850">
                <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">ডেটাবেস সার্ভিস:</span>
                <span className="text-slate-300 font-medium truncate">Supabase Cloud PostgreSQL</span>
              </div>

              {/* Host URL */}
              <div className="flex flex-col gap-1 p-3 rounded-xl bg-slate-950/40 border border-slate-850">
                <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">ব্যাকএন্ড হোস্ট:</span>
                <span className="text-slate-300 font-medium truncate">{API_BASE}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Setting;