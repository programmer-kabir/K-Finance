import { useState, useEffect, useMemo } from "react";
import {
  TrendingDown,
  Plus,
  X,
  ArrowDownRight,
  Loader2,
  FileText,
  ListFilter,
  DollarSign,
  AlertCircle
} from "lucide-react";
import API_BASE from "../../api";

const monthsBengali = [
  "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"
];

const categories = [
  { value: "Cigarettes", label: "সিগারেট (Cigarettes)" },
  { value: "Party", label: "পার্টি / আড্ডা (Party)" },
  { value: "Food", label: "খাবার (Food)" },
  { value: "Transport", label: "যাতায়াত (Transport)" },
  { value: "Utilities", label: "বিল / ইউটিলিটি (Utilities)" },
  { value: "Shopping", label: "কেনাকাটা (Shopping)" },
  { value: "Bike", label: "বাইক (Bike)" },
  { value: "Loan", label: "ঋণ পরিশোধ (Loan Repayment)" },
  { value: "Other", label: "অন্যান্য (Other)" }
];

const CashOut = () => {
  // Core States
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filtering States
  const [filterType, setFilterType] = useState("all"); // 'all' | 'monthly' | 'yearly' | 'custom'
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // 0-11
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    purpose: "",
    category: "Food",
    transaction_date: new Date().toISOString().split("T")[0],
    remarks: "",
    source: "", // Will represent payee / place of spend
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Fetch Transactions
  const fetchTransactions = async (showLoading = false) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const res = await fetch(`${API_BASE}/cash?type=out`);
      if (!res.ok) throw new Error("ডেটা লোড করতে ব্যর্থ হয়েছে");
      const result = await res.json();
      if (result.success) {
        setTransactions(result.data || []);
      } else {
        throw new Error(result.message || "ডেটা লোড করতে ব্যর্থ হয়েছে");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTransactions(false);
  }, []);

  // Filter transactions by date range first
  const dateFilteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const txDate = new Date(tx.transaction_date);
      const txYear = txDate.getFullYear();
      const txMonth = txDate.getMonth();

      if (filterType === "monthly") {
        return txYear === parseInt(selectedYear) && txMonth === parseInt(selectedMonth);
      }
      if (filterType === "yearly") {
        return txYear === parseInt(selectedYear);
      }
      if (filterType === "custom") {
        if (!startDate && !endDate) return true;
        const start = startDate ? new Date(startDate) : new Date("1970-01-01");
        const end = endDate ? new Date(endDate) : new Date("2999-12-31");
        // Set hours to include the full days
        start.setHours(0,0,0,0);
        end.setHours(23,59,59,999);
        return txDate >= start && txDate <= end;
      }
      return true; // 'all'
    });
  }, [transactions, filterType, selectedMonth, selectedYear, startDate, endDate]);

  // Compute category-wise totals from date-filtered transactions
  const categoryTotals = useMemo(() => {
    const totals = {};
    categories.forEach(cat => {
      totals[cat.value] = 0;
    });
    dateFilteredTransactions.forEach(tx => {
      if (totals[tx.category] !== undefined) {
        totals[tx.category] += Number(tx.amount);
      } else {
        totals[tx.category] = (totals[tx.category] || 0) + Number(tx.amount);
      }
    });
    return totals;
  }, [dateFilteredTransactions]);

  // Filter transactions by category for display
  const filteredTransactions = useMemo(() => {
    return dateFilteredTransactions.filter(tx => {
      if (selectedCategory !== "all") {
        return tx.category === selectedCategory;
      }
      return true;
    });
  }, [dateFilteredTransactions, selectedCategory]);

  // Statistics calculation
  const stats = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyTotal = transactions
      .filter((tx) => {
        const d = new Date(tx.transaction_date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, tx) => sum + Number(tx.amount), 0);

    const yearlyTotal = transactions
      .filter((tx) => new Date(tx.transaction_date).getFullYear() === currentYear)
      .reduce((sum, tx) => sum + Number(tx.amount), 0);

    const totalAllTime = transactions.reduce((sum, tx) => sum + Number(tx.amount), 0);

    return {
      monthlyTotal,
      yearlyTotal,
      totalAllTime,
      count: filteredTransactions.length
    };
  }, [transactions, filteredTransactions]);

  // Form input handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit new Cash Out
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.purpose || !formData.transaction_date) {
      setSubmitError("দয়া করে সব আবশ্যক ক্ষেত্রগুলো পূরণ করুন।");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const res = await fetch(`${API_BASE}/cash`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          type: "out",
        }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || "সংরক্ষণ করতে ব্যর্থ হয়েছে");
      }

      // Refresh list, close modal, reset form
      await fetchTransactions(true);
      setIsModalOpen(false);
      setFormData({
        amount: "",
        purpose: "",
        category: "Food",
        transaction_date: new Date().toISOString().split("T")[0],
        remarks: "",
        source: "",
      });
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Category Badge Color helper
  const getCategoryColor = (cat) => {
    switch (cat) {
      case "Cigarettes":
        return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
      case "Party":
        return "bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20";
      case "Food":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      case "Transport":
        return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
      case "Utilities":
        return "bg-orange-500/10 text-orange-400 border border-orange-500/20";
      case "Shopping":
        return "bg-pink-500/10 text-pink-400 border border-pink-500/20";
      case "Bike":
        return "bg-teal-500/10 text-teal-400 border border-teal-500/20";
      case "Loan":
        return "bg-violet-500/10 text-violet-400 border border-violet-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border border-slate-500/20";
    }
  };

  const getCategoryLabel = (cat) => {
    const found = categories.find((c) => c.value === cat);
    return found ? found.label.split(" ")[0] : cat;
  };

  return (
    <div className="space-y-6 text-slate-100 p-2 md:p-6 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-red-400 to-rose-300 bg-clip-text text-transparent">
            ব্যয় (Cash Out) ম্যানেজমেন্ট
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            আপনার দৈনন্দিন খরচ ও ব্যয়সমূহ ট্র্যাক এবং ক্যাটাগরি অনুযায়ী ফিল্টার করুন
          </p>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold shadow-lg shadow-red-955/20 hover:shadow-red-500/10 transition-all duration-300 transform active:scale-95"
        >
          <Plus size={20} />
          <span>ব্যয় যোগ করুন</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Monthly Cash Out */}
        <div className="bg-gradient-to-br from-red-950/20 to-slate-900 border border-red-500/20 rounded-2xl p-6 relative overflow-hidden group hover:border-red-500/40 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition-all duration-300"></div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm font-medium">চলতি মাসের মোট ব্যয়</span>
            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400">
              <TrendingDown size={20} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold tracking-tight text-red-400">
              ৳ {stats.monthlyTotal.toLocaleString("bn-BD")}
            </h3>
            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
              <ArrowDownRight size={14} className="text-red-400" />
              <span>চলতি মাস: {monthsBengali[new Date().getMonth()]} {new Date().getFullYear()}</span>
            </p>
          </div>
        </div>

        {/* Card 2: Yearly Cash Out */}
        <div className="bg-gradient-to-br from-amber-955/20 to-slate-900 border border-amber-500/20 rounded-2xl p-6 relative overflow-hidden group hover:border-amber-500/40 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all duration-300"></div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm font-medium">চলতি বছরের মোট ব্যয়</span>
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold tracking-tight text-amber-400">
              ৳ {stats.yearlyTotal.toLocaleString("bn-BD")}
            </h3>
            <p className="text-xs text-slate-500 mt-2">
              চলতি বছর: {new Date().getFullYear()}
            </p>
          </div>
        </div>

        {/* Card 3: All Time or Transaction count */}
        <div className="bg-gradient-to-br from-rose-955/20 to-slate-900 border border-rose-500/20 rounded-2xl p-6 relative overflow-hidden group hover:border-rose-500/40 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all duration-300"></div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm font-medium">সর্বমোট ব্যয় (All Time)</span>
            <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
              <FileText size={20} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold tracking-tight text-rose-400">
              ৳ {stats.totalAllTime.toLocaleString("bn-BD")}
            </h3>
            <p className="text-xs text-slate-500 mt-2">
              ফিল্টারকৃত ট্রানজেকশন সংখ্যা: <span className="font-semibold text-rose-400">{stats.count} টি</span>
            </p>
          </div>
        </div>
      </div>

      {/* Filter Options */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-md">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <ListFilter size={18} className="text-rose-400" />
              <h4 className="font-semibold text-slate-300 text-sm">ফিল্টারিং কন্ট্রোলস</h4>
            </div>
            
            {/* Category Dropdown Filter */}
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-400 font-medium">ক্যাটাগরি:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 outline-none focus:border-rose-500/40"
              >
                <option value="all">সব ক্যাটাগরি (All)</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label.split(" ")[0]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Filter buttons */}
            <button
              onClick={() => setFilterType("all")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border ${
                filterType === "all"
                  ? "bg-rose-500/15 border-rose-500/40 text-rose-400"
                  : "bg-slate-800/40 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-300"
              }`}
            >
              সব সময় (All)
            </button>

            <button
              onClick={() => setFilterType("monthly")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border ${
                filterType === "monthly"
                  ? "bg-rose-500/15 border-rose-500/40 text-rose-400"
                  : "bg-slate-800/40 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-300"
              }`}
            >
              মাসিক (Monthly)
            </button>

            <button
              onClick={() => setFilterType("yearly")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border ${
                filterType === "yearly"
                  ? "bg-rose-500/15 border-rose-500/40 text-rose-400"
                  : "bg-slate-800/40 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-300"
              }`}
            >
              বার্ষিক (Yearly)
            </button>

            <button
              onClick={() => setFilterType("custom")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border ${
                filterType === "custom"
                  ? "bg-rose-500/15 border-rose-500/40 text-rose-400"
                  : "bg-slate-800/40 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-300"
              }`}
            >
              তারিখ অনুযায়ী (Custom Date)
            </button>
          </div>

          {/* Conditional filters */}
          {filterType === "monthly" && (
            <div className="flex flex-wrap gap-4 items-center bg-slate-950/40 p-4 rounded-xl border border-slate-800/50">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-medium">মাস সিলেক্ট করুন</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-rose-500/40"
                >
                  {monthsBengali.map((m, idx) => (
                    <option key={idx} value={idx}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-medium">বছর সিলেক্ট করুন</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-rose-500/40"
                >
                  {[2024, 2025, 2026, 2027, 2028].map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {filterType === "yearly" && (
            <div className="flex flex-wrap gap-4 items-center bg-slate-950/40 p-4 rounded-xl border border-slate-800/50">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-medium">বছর সিলেক্ট করুন</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-rose-500/40"
                >
                  {[2024, 2025, 2026, 2027, 2028].map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {filterType === "custom" && (
            <div className="flex flex-wrap gap-4 items-end bg-slate-950/40 p-4 rounded-xl border border-slate-800/50">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-medium">শুরুর তারিখ (Start Date)</label>
                <div className="relative">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-rose-500/40 w-44"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-medium">শেষ তারিখ (End Date)</label>
                <div className="relative">
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-rose-500/40 w-44"
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                }}
                className="px-4 py-2.5 rounded-xl text-xs bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200 transition-colors duration-200"
              >
                রিসেট
              </button>
            </div>
          )}

          {/* Category-wise totals grid */}
          <div className="border-t border-slate-800/60 pt-4 mt-2">
            <h5 className="text-xs font-semibold text-slate-400 mb-3 flex items-center gap-1.5">
              <span>ক্যাটাগরি ভিত্তিক হিসাব (Category Summary)</span>
              <span className="text-[10px] text-slate-500 font-normal">(ক্লিক করে ফিল্টার করুন)</span>
            </h5>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {categories.map((cat) => {
                const total = categoryTotals[cat.value] || 0;
                const isSelected = selectedCategory === cat.value;
                return (
                  <div
                    key={cat.value}
                    onClick={() => setSelectedCategory(prev => prev === cat.value ? "all" : cat.value)}
                    className={`cursor-pointer p-3 rounded-xl border transition-all duration-300 flex flex-col justify-between group active:scale-95 ${
                      isSelected
                        ? "bg-rose-500/10 border-rose-500/40 shadow-lg shadow-rose-950/20"
                        : "bg-slate-950/30 border-slate-800/60 hover:border-slate-700/80 hover:bg-slate-900/40"
                    }`}
                  >
                    <span className="text-xs text-slate-400 group-hover:text-slate-300 truncate">{cat.label.split(" ")[0]}</span>
                    <span className={`text-sm font-bold mt-1.5 transition-colors duration-300 ${
                      isSelected 
                        ? "text-rose-400" 
                        : total > 0 
                          ? "text-rose-400/80 group-hover:text-rose-400" 
                          : "text-slate-600 group-hover:text-slate-500"
                    }`}>
                      ৳ {total.toLocaleString("bn-BD")}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content (Transactions Table) */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
            <Loader2 className="animate-spin text-rose-400" size={36} />
            <p className="text-sm">লোড হচ্ছে, দয়া করে অপেক্ষা করুন...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-red-400">
            <AlertCircle size={36} />
            <p className="text-sm">{error}</p>
            <button
              onClick={fetchTransactions}
              className="px-4 py-2 bg-slate-800 text-slate-200 rounded-xl text-xs hover:bg-slate-700 transition-colors"
            >
              আবার চেষ্টা করুন
            </button>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-500">
            <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-600">
              <FileText size={28} />
            </div>
            <div className="text-center">
              <h5 className="font-semibold text-slate-400">কোন ট্রানজেকশন পাওয়া যায়নি</h5>
              <p className="text-xs text-slate-600 mt-1">
                {filterType !== "all" ? "আপনার ফিল্টারের সাথে মিলে এমন কোনো ডেটা পাওয়া যায়নি।" : "নতুন ব্যয় এন্ট্রি যোগ করতে ওপরের বাটনে ক্লিক করুন।"}
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800/80 text-xs text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="px-6 py-4.5">তারিখ</th>
                  <th className="px-6 py-4.5">উদ্দেশ্য (Purpose)</th>
                  <th className="px-6 py-4.5">ক্যাটাগরি</th>
                  <th className="px-6 py-4.5">কোথায় / কাকে (Payee)</th>
                  <th className="px-6 py-4.5 text-right">পরিমাণ (Amount)</th>
                  <th className="px-6 py-4.5">মন্তব্য</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-sm">
                {filteredTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-slate-800/20 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400">
                      {new Date(tx.transaction_date).toLocaleDateString("bn-BD", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-200">
                      {tx.purpose}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${getCategoryColor(tx.category)}`}>
                        {getCategoryLabel(tx.category)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-xs whitespace-nowrap">
                      {tx.source || "—"}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-red-400 whitespace-nowrap text-base">
                      - ৳ {tx.amount.toLocaleString("bn-BD")}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400 max-w-xs truncate">
                      {tx.remarks || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Cash Out Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            onClick={() => !isSubmitting && setIsModalOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          ></div>

          {/* Modal Container */}
          <div className="relative bg-[#0F172A] border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400">
                  <TrendingDown size={18} />
                </div>
                <h3 className="text-lg font-bold text-slate-100">নতুন ব্যয় এন্ট্রি করুন</h3>
              </div>
              <button
                onClick={() => !isSubmitting && setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 rounded-lg p-1 hover:bg-slate-800 transition-colors"
                disabled={isSubmitting}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              {submitError && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Amount */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-medium">ব্যয়ের পরিমাণ (টাকায়) <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 font-semibold">
                    ৳
                  </div>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    placeholder="যেমন: ৫০০"
                    required
                    className="bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-4 py-3 text-sm text-slate-200 outline-none focus:border-red-500/50 w-full"
                  />
                </div>
              </div>

              {/* Purpose */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-medium">ব্যয়ের উদ্দেশ্য বা বিবরণ <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleInputChange}
                  placeholder="যেমন: চা-সিগারেট ও নাস্তা"
                  required
                  className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-red-500/50 w-full"
                />
              </div>

              {/* Row: Category & Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-medium">ক্যাটাগরি</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-red-500/50 w-full"
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-medium">তারিখ <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    name="transaction_date"
                    value={formData.transaction_date}
                    onChange={handleInputChange}
                    required
                    className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-red-500/50 w-full"
                  />
                </div>
              </div>

              {/* Payee / Place (Optional) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-medium">কোথায় / কাকে দেওয়া হয়েছে (ঐচ্ছিক)</label>
                <input
                  type="text"
                  name="source"
                  value={formData.source}
                  onChange={handleInputChange}
                  placeholder="যেমন: টং দোকান, রেস্টুরেন্ট"
                  className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-red-500/50 w-full"
                />
              </div>

              {/* Remarks (Optional) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-medium">মন্তব্য (ঐচ্ছিক)</label>
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleInputChange}
                  placeholder="অতিরিক্ত কোনো তথ্য থাকলে এখানে লিখুন..."
                  rows="2"
                  className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-red-500/50 w-full resize-none"
                />
              </div>

              {/* Form Footer Actions */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  disabled={isSubmitting}
                >
                  বাতিল করুন
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-955/20 transition-all active:scale-95"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      <span>সেভ হচ্ছে...</span>
                    </>
                  ) : (
                    <span>যোগ করুন</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashOut;