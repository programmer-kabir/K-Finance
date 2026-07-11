import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp, TrendingDown, DollarSign, ArrowRight,
  Plus, ArrowUpRight, ArrowDownRight, History,
  Coins, Loader2, AlertCircle, RefreshCw, Wallet,
  BarChart3, Zap
} from "lucide-react";
import API_BASE from "../api";

const categoryMeta = {
  in: {
    Salary: { label: "বেতন", color: "#818CF8", bg: "rgba(129,140,248,0.12)" },
    Business: { label: "ব্যবসা", color: "#A78BFA", bg: "rgba(167,139,250,0.12)" },
    Freelancing: { label: "ফ্রিল্যান্সিং", color: "#22D3EE", bg: "rgba(34,211,238,0.12)" },
    Investment: { label: "বিনিয়োগ", color: "#F59E0B", bg: "rgba(245,158,11,0.12)" },
    Loan: { label: "ঋণ গ্রহণ", color: "#F43F5E", bg: "rgba(244,63,94,0.12)" },
    Other: { label: "অন্যান্য", color: "#6B7280", bg: "rgba(107,114,128,0.12)" },
  },
  out: {
    Cigarettes: { label: "সিগারেট", color: "#F43F5E", bg: "rgba(244,63,94,0.12)" },
    Party: { label: "পার্টি", color: "#C084FC", bg: "rgba(192,132,252,0.12)" },
    Food: { label: "খাবার", color: "#F59E0B", bg: "rgba(245,158,11,0.12)" },
    Transport: { label: "যাতায়াত", color: "#38BDF8", bg: "rgba(56,189,248,0.12)" },
    Utilities: { label: "ইউটিলিটি", color: "#FB923C", bg: "rgba(251,146,60,0.12)" },
    Shopping: { label: "কেনাকাটা", color: "#F472B6", bg: "rgba(244,114,182,0.12)" },
    Bike: { label: "বাইক", color: "#2DD4BF", bg: "rgba(45,212,191,0.12)" },
    Loan: { label: "ঋণ পরিশোধ", color: "#A78BFA", bg: "rgba(167,139,250,0.12)" },
    Other: { label: "অন্যান্য", color: "#6B7280", bg: "rgba(107,114,128,0.12)" },
  }
};

const getCatMeta = (cat, type) => {
  const meta = categoryMeta[type]?.[cat];
  return meta || { label: cat, color: "#6B7280", bg: "rgba(107,114,128,0.12)" };
};

const HomePage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userName = localStorage.getItem("adminName") || "Kabir";

  const fetchTransactions = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const res = await fetch(`${API_BASE}/cash`);
      if (!res.ok) throw new Error("ডেটা লোড করতে ব্যর্থ হয়েছে");
      const result = await res.json();
      if (result.success) {
        setTransactions(result.data || []);
      } else {
        throw new Error(result.message || "ডেটা লোড করতে ব্যর্থ হয়েছে");
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

  const stats = useMemo(() => {
    let totalIn = 0, totalOut = 0;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    let thisMonthIn = 0, thisMonthOut = 0;
    let loansTaken = 0, loansRepaid = 0;

    transactions.forEach(tx => {
      const amt = Number(tx.amount);
      const d = new Date(tx.transaction_date);
      const isThisMonth = d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      if (tx.type === "in") {
        totalIn += amt;
        if (isThisMonth) thisMonthIn += amt;
        if (tx.category === "Loan") loansTaken += amt;
      } else {
        totalOut += amt;
        if (isThisMonth) thisMonthOut += amt;
        if (tx.category === "Loan") loansRepaid += amt;
      }
    });

    return {
      totalIn, totalOut,
      netBalance: totalIn - totalOut,
      thisMonthIn, thisMonthOut,
      thisMonthNet: thisMonthIn - thisMonthOut,
      loansTaken, loansRepaid,
      outstandingLoan: Math.max(0, loansTaken - loansRepaid),
      recentTransactions: [...transactions]
        .sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date))
        .slice(0, 6),
    };
  }, [transactions]);

  const topCategories = useMemo(() => {
    const sum = {};
    transactions.filter(t => t.type === "out").forEach(t => {
      sum[t.category] = (sum[t.category] || 0) + Number(t.amount);
    });
    return Object.entries(sum).map(([k, v]) => ({ category: k, amount: v }))
      .sort((a, b) => b.amount - a.amount).slice(0, 4);
  }, [transactions]);

  const expenseRatio = stats.totalIn > 0 ? Math.min((stats.totalOut / stats.totalIn) * 100, 100) : 0;

  const s = { fontFamily: "Inter, sans-serif" };

  return (
    <div className="min-h-screen p-4 md:p-7 space-y-6" style={{ ...s, background: "var(--bg-root)", color: "var(--text-primary)" }}>

      {/* ── Header ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5"
        style={{ borderBottom: "1px solid rgba(139,92,246,0.1)" }}>
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Zap size={16} style={{ color: "#7C3AED" }} />
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#4A4A6A" }}>
              Dashboard
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black leading-tight">
            <span style={{ color: "var(--text-primary)" }}>স্বাগতম, </span>
            <span className="gradient-text-violet">{userName}!</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            আপনার আর্থিক স্বাস্থ্যের রিয়েল-টাইম সারাংশ
          </p>
        </div>
        <div className="flex gap-2.5 shrink-0">
          <Link to="/cash-in"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg, #059669, #10B981)", boxShadow: "0 4px 20px rgba(16,185,129,0.3)" }}>
            <Plus size={14} /><span>আয় যোগ</span>
          </Link>
          <Link to="/cash-out"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg, #BE123C, #F43F5E)", boxShadow: "0 4px 20px rgba(244,63,94,0.3)" }}>
            <Plus size={14} /><span>ব্যয় যোগ</span>
          </Link>
        </div>
      </div>

      {/* ── Loading / Error ───────────────────────────── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-3">
          <Loader2 size={40} className="animate-spin" style={{ color: "#7C3AED" }} />
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>ডেটা লোড হচ্ছে...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <AlertCircle size={40} style={{ color: "#F43F5E" }} />
          <p className="text-sm" style={{ color: "#FB7185" }}>{error}</p>
          <button onClick={() => fetchTransactions(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors"
            style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", color: "#A78BFA" }}>
            <RefreshCw size={14} />আবার চেষ্টা করুন
          </button>
        </div>
      ) : (
        <>
          {/* ── KPI Cards ─────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* Net Balance */}
            <div className="rounded-2xl p-5 relative overflow-hidden group transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(79,70,229,0.06) 100%)",
                border: "1px solid rgba(124,58,237,0.2)",
                boxShadow: "0 0 30px rgba(124,58,237,0.06)"
              }}>
              <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: "radial-gradient(circle at 80% 20%, rgba(124,58,237,0.08), transparent 60%)" }} />
              <div className="flex items-start justify-between mb-4">
                <p className="text-xs font-semibold" style={{ color: "#6B6B8A" }}>নিট ব্যালেন্স</p>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.25)" }}>
                  <Wallet size={16} style={{ color: "#A78BFA" }} />
                </div>
              </div>
              <div className={`text-3xl font-black mb-1 ${stats.netBalance >= 0 ? "gradient-text-violet" : ""}`}
                style={stats.netBalance < 0 ? { color: "#F43F5E" } : {}}>
                ৳ {stats.netBalance.toLocaleString("bn-BD")}
              </div>
              <p className="text-[11px]" style={{ color: "#4A4A6A" }}>মোট আয় থেকে মোট ব্যয় বাদে</p>
            </div>

            {/* Monthly Income */}
            <div className="rounded-2xl p-5 relative overflow-hidden group transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(16,185,129,0.04) 100%)",
                border: "1px solid rgba(16,185,129,0.18)"
              }}>
              <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: "radial-gradient(circle at 80% 20%, rgba(16,185,129,0.08), transparent 60%)" }} />
              <div className="flex items-start justify-between mb-4">
                <p className="text-xs font-semibold" style={{ color: "#6B6B8A" }}>এই মাসের আয়</p>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.25)" }}>
                  <TrendingUp size={16} style={{ color: "#34D399" }} />
                </div>
              </div>
              <div className="text-3xl font-black mb-1 gradient-text-emerald">
                ৳ {stats.thisMonthIn.toLocaleString("bn-BD")}
              </div>
              <p className="text-[11px]" style={{ color: "#4A4A6A" }}>চলতি মাসের মোট ক্যাশ ইন</p>
            </div>

            {/* Monthly Expense */}
            <div className="rounded-2xl p-5 relative overflow-hidden group transition-all duration-300 sm:col-span-2 lg:col-span-1"
              style={{
                background: "linear-gradient(135deg, rgba(244,63,94,0.1) 0%, rgba(244,63,94,0.04) 100%)",
                border: "1px solid rgba(244,63,94,0.18)"
              }}>
              <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: "radial-gradient(circle at 80% 20%, rgba(244,63,94,0.08), transparent 60%)" }} />
              <div className="flex items-start justify-between mb-4">
                <p className="text-xs font-semibold" style={{ color: "#6B6B8A" }}>এই মাসের ব্যয়</p>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(244,63,94,0.15)", border: "1px solid rgba(244,63,94,0.25)" }}>
                  <TrendingDown size={16} style={{ color: "#FB7185" }} />
                </div>
              </div>
              <div className="text-3xl font-black mb-1 gradient-text-rose">
                ৳ {stats.thisMonthOut.toLocaleString("bn-BD")}
              </div>
              <p className="text-[11px]" style={{ color: "#4A4A6A" }}>চলতি মাসের মোট ক্যাশ আউট</p>
            </div>
          </div>

          {/* ── Mid Row: Ratio + Loans + Top Spend ─────── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Expense Ratio */}
            <div className="rounded-2xl p-5 flex flex-col gap-4"
              style={{ background: "rgba(15,15,26,0.7)", border: "1px solid rgba(139,92,246,0.1)" }}>
              <div className="flex items-center gap-2">
                <DollarSign size={15} style={{ color: "#7C3AED" }} />
                <h4 className="text-xs font-bold" style={{ color: "#9898B8" }}>ব্যয়ের অনুপাত</h4>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-black" style={{ color: expenseRatio > 80 ? "#F43F5E" : expenseRatio > 60 ? "#F59E0B" : "#A78BFA" }}>
                  {expenseRatio.toFixed(1)}%
                </span>
                <span className="text-[11px]" style={{ color: "#4A4A6A" }}>আয়ের তুলনায় ব্যয়</span>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "rgba(139,92,246,0.08)" }}>
                <div className="h-2 rounded-full transition-all duration-700"
                  style={{
                    width: `${expenseRatio}%`,
                    background: expenseRatio > 80
                      ? "linear-gradient(90deg, #F43F5E, #BE123C)"
                      : expenseRatio > 60
                      ? "linear-gradient(90deg, #F59E0B, #D97706)"
                      : "linear-gradient(90deg, #7C3AED, #4F46E5)"
                  }} />
              </div>
              <p className="text-[10px]" style={{ color: "#3D3D5C" }}>
                {expenseRatio > 80 ? "⚠ ব্যয় অনেক বেশি!" : expenseRatio > 60 ? "সতর্কতা প্রয়োজন" : "আর্থিক স্বাস্থ্য ভালো ✓"}
              </p>
            </div>

            {/* Outstanding Loan */}
            <div className="rounded-2xl p-5 flex flex-col gap-4"
              style={{ background: "rgba(15,15,26,0.7)", border: "1px solid rgba(139,92,246,0.1)" }}>
              <div className="flex items-center gap-2">
                <Coins size={15} style={{ color: "#A78BFA" }} />
                <h4 className="text-xs font-bold" style={{ color: "#9898B8" }}>ঋণ ট্র্যাকার</h4>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px]" style={{ color: "#4A4A6A" }}>বকেয়া ঋণ</span>
                <span className="text-xl font-black"
                  style={{ color: stats.outstandingLoan > 0 ? "#F43F5E" : "#10B981" }}>
                  ৳ {stats.outstandingLoan.toLocaleString("bn-BD")}
                </span>
              </div>
              <div className="space-y-1.5 text-[11px]" style={{ color: "#4A4A6A" }}>
                <div className="flex justify-between">
                  <span>গৃহীত লোন:</span>
                  <span style={{ color: "#F43F5E" }}>৳ {stats.loansTaken.toLocaleString("bn-BD")}</span>
                </div>
                <div className="flex justify-between">
                  <span>পরিশোধ লোন:</span>
                  <span style={{ color: "#10B981" }}>৳ {stats.loansRepaid.toLocaleString("bn-BD")}</span>
                </div>
              </div>
              <p className="text-[10px]" style={{ color: "#3D3D5C" }}>
                {stats.outstandingLoan > 0 ? "ঋণ পরিশোধে ক্যাশ আউট করুন।" : "কোনো বকেয়া ঋণ নেই! ✓"}
              </p>
            </div>

            {/* Top Spending Categories */}
            <div className="rounded-2xl p-5 flex flex-col gap-3"
              style={{ background: "rgba(15,15,26,0.7)", border: "1px solid rgba(139,92,246,0.1)" }}>
              <div className="flex items-center gap-2">
                <BarChart3 size={15} style={{ color: "#F43F5E" }} />
                <h4 className="text-xs font-bold" style={{ color: "#9898B8" }}>সর্বোচ্চ ব্যয়ের খাত</h4>
              </div>
              <div className="space-y-2.5 flex-1">
                {topCategories.length === 0 ? (
                  <p className="text-[11px] text-center py-4" style={{ color: "#3D3D5C" }}>কোনো ব্যয় নেই</p>
                ) : topCategories.map(({ category, amount }) => {
                  const meta = getCatMeta(category, "out");
                  const pct = stats.totalOut > 0 ? (amount / stats.totalOut) * 100 : 0;
                  return (
                    <div key={category} className="flex items-center gap-2.5">
                      <span className="text-[11px] font-medium w-20 shrink-0 truncate" style={{ color: "#9898B8" }}>
                        {meta.label}
                      </span>
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(139,92,246,0.08)" }}>
                        <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: meta.color }} />
                      </div>
                      <span className="text-[11px] font-bold shrink-0" style={{ color: meta.color }}>
                        {pct.toFixed(0)}%
                      </span>
                    </div>
                  );
                })}
              </div>
              <Link to="/reports"
                className="text-[11px] font-semibold flex items-center gap-1 mt-auto"
                style={{ color: "#7C3AED" }}>
                বিস্তারিত <ArrowRight size={10} />
              </Link>
            </div>
          </div>

          {/* ── Recent Transactions ───────────────────── */}
          <div className="rounded-2xl overflow-hidden"
            style={{ background: "rgba(15,15,26,0.7)", border: "1px solid rgba(139,92,246,0.1)" }}>
            <div className="px-5 py-4 flex items-center justify-between"
              style={{ borderBottom: "1px solid rgba(139,92,246,0.08)" }}>
              <div className="flex items-center gap-2">
                <History size={15} style={{ color: "#7C3AED" }} />
                <h4 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>সাম্প্রতিক লেনদেন</h4>
              </div>
              <Link to="/reports"
                className="text-xs font-semibold flex items-center gap-1 transition-colors"
                style={{ color: "#7C3AED" }}
                onMouseEnter={e => e.currentTarget.style.color = "#A78BFA"}
                onMouseLeave={e => e.currentTarget.style.color = "#7C3AED"}>
                সব দেখুন <ArrowRight size={12} />
              </Link>
            </div>

            <div>
              {stats.recentTransactions.length === 0 ? (
                <div className="py-12 text-center text-sm" style={{ color: "#3D3D5C" }}>
                  কোনো লেনদেনের রেকর্ড নেই
                </div>
              ) : stats.recentTransactions.map((tx, i) => {
                const isIn = tx.type === "in";
                const meta = getCatMeta(tx.category, tx.type);
                return (
                  <div key={tx.id}
                    className="flex items-center justify-between px-5 py-3.5 transition-colors"
                    style={{
                      borderBottom: i < stats.recentTransactions.length - 1 ? "1px solid rgba(139,92,246,0.05)" : "none",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(139,92,246,0.03)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: isIn ? "rgba(16,185,129,0.12)" : "rgba(244,63,94,0.12)" }}>
                        {isIn
                          ? <ArrowUpRight size={15} style={{ color: "#10B981" }} />
                          : <ArrowDownRight size={15} style={{ color: "#F43F5E" }} />
                        }
                      </div>
                      <div>
                        <p className="text-xs font-semibold leading-none mb-1.5" style={{ color: "var(--text-primary)" }}>
                          {tx.purpose}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                            style={{ background: meta.bg, color: meta.color }}>
                            {meta.label}
                          </span>
                          <span className="text-[10px]" style={{ color: "#3D3D5C" }}>
                            {new Date(tx.transaction_date).toLocaleDateString("bn-BD", { month: "short", day: "numeric" })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="text-sm font-black shrink-0"
                      style={{ color: isIn ? "#10B981" : "#F43F5E" }}>
                      {isIn ? "+" : "-"} ৳ {Number(tx.amount).toLocaleString("bn-BD")}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HomePage;