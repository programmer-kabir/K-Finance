import { useState, useEffect, useMemo } from "react";
import {
  FileText, Calendar, ListFilter, TrendingUp, TrendingDown,
  RefreshCw, Loader2, AlertCircle, Wallet, ArrowUpRight,
  ArrowDownRight, BarChart3, ChevronDown, X, Zap
} from "lucide-react";
import API_BASE from "../../api";

/* ── Constants ───────────────────────────────────────────── */
const MONTHS_BN = [
  "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"
];

const CAT_IN = [
  { value: "Salary",      label: "বেতন",        color: "#818CF8", bg: "rgba(129,140,248,0.12)" },
  { value: "Business",    label: "ব্যবসা",       color: "#A78BFA", bg: "rgba(167,139,250,0.12)" },
  { value: "Freelancing", label: "ফ্রিল্যান্সিং", color: "#22D3EE", bg: "rgba(34,211,238,0.12)"  },
  { value: "Investment",  label: "বিনিয়োগ",      color: "#F59E0B", bg: "rgba(245,158,11,0.12)"  },
  { value: "Loan",        label: "ঋণ গ্রহণ",     color: "#F43F5E", bg: "rgba(244,63,94,0.12)"   },
  { value: "Other",       label: "অন্যান্য",      color: "#6B7280", bg: "rgba(107,114,128,0.12)" },
];

const CAT_OUT = [
  { value: "Cigarettes",  label: "সিগারেট",   color: "#F43F5E", bg: "rgba(244,63,94,0.12)"   },
  { value: "Party",       label: "পার্টি",     color: "#C084FC", bg: "rgba(192,132,252,0.12)" },
  { value: "Food",        label: "খাবার",      color: "#F59E0B", bg: "rgba(245,158,11,0.12)"  },
  { value: "Transport",   label: "যাতায়াত",    color: "#38BDF8", bg: "rgba(56,189,248,0.12)"  },
  { value: "Utilities",   label: "ইউটিলিটি",   color: "#FB923C", bg: "rgba(251,146,60,0.12)"  },
  { value: "Shopping",    label: "কেনাকাটা",   color: "#F472B6", bg: "rgba(244,114,182,0.12)" },
  { value: "Bike",        label: "বাইক",       color: "#2DD4BF", bg: "rgba(45,212,191,0.12)"  },
  { value: "Loan",        label: "ঋণ পরিশোধ", color: "#A78BFA", bg: "rgba(167,139,250,0.12)" },
  { value: "Other",       label: "অন্যান্য",   color: "#6B7280", bg: "rgba(107,114,128,0.12)" },
];

// get unique cats by value (prefer IN list first)
const ALL_CATS = (() => {
  const seen = new Set();
  return [...CAT_IN, ...CAT_OUT].filter(c => seen.has(c.value) ? false : seen.add(c.value));
})();

const getCatMeta = (cat, type) => {
  const list = type === "in" ? CAT_IN : CAT_OUT;
  return list.find(c => c.value === cat) || ALL_CATS.find(c => c.value === cat) || { label: cat, color: "#6B7280", bg: "rgba(107,114,128,0.12)" };
};

// Parse a date string like "2026-07-09" without timezone shift
const parseLocalDate = (dateStr) => {
  if (!dateStr) return new Date();
  // ISO string from Supabase like "2026-07-09T00:00:00" or "2026-07-09"
  const parts = dateStr.substring(0, 10).split("-");
  return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
};

// available years from data + current year
const getYears = (transactions) => {
  const years = new Set([new Date().getFullYear()]);
  transactions.forEach(tx => years.add(parseLocalDate(tx.transaction_date).getFullYear()));
  return [...years].sort((a, b) => b - a);
};

/* ── Component ───────────────────────────────────────────── */
const CashReports = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter state
  const [filterMode, setFilterMode] = useState("all"); // all | monthly | yearly | custom
  const [selYear, setSelYear] = useState(new Date().getFullYear());
  const [selMonth, setSelMonth] = useState(new Date().getMonth()); // 0-11
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selType, setSelType] = useState("all"); // all | in | out
  const [selCat, setSelCat] = useState("all");

  const fetchData = async (showLoad = true) => {
    try {
      if (showLoad) setLoading(true);
      const res = await fetch(`${API_BASE}/cash`);
      if (!res.ok) throw new Error("ডেটা লোড করতে ব্যর্থ হয়েছে");
      const result = await res.json();
      if (result.success) setTransactions(result.data || []);
      else throw new Error(result.message || "ডেটা লোড করতে ব্যর্থ হয়েছে");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData(true);
  }, []);

  const availableYears = useMemo(() => getYears(transactions), [transactions]);

  /* ── Date-filtered transactions ─────────────────────── */
  const dateFiltered = useMemo(() => {
    return transactions.filter(tx => {
      const d = parseLocalDate(tx.transaction_date);
      const y = d.getFullYear();
      const m = d.getMonth();
      if (filterMode === "monthly") return y === selYear && m === selMonth;
      if (filterMode === "yearly")  return y === selYear;
      if (filterMode === "custom") {
        if (!startDate && !endDate) return true;
        const s = startDate ? parseLocalDate(startDate) : new Date("1970-01-01");
        const e = endDate   ? parseLocalDate(endDate)   : new Date("2999-12-31");
        return d >= s && d <= e;
      }
      return true;
    });
  }, [transactions, filterMode, selYear, selMonth, startDate, endDate]);

  /* ── Type + Category filtered (for table) ───────────── */
  const finalFiltered = useMemo(() => {
    return dateFiltered
      .filter(tx => {
        if (selType !== "all" && tx.type !== selType) return false;
        if (selCat  !== "all" && tx.category !== selCat) return false;
        return true;
      })
      .sort((a, b) => parseLocalDate(b.transaction_date) - parseLocalDate(a.transaction_date));
  }, [dateFiltered, selType, selCat]);

  /* ── Stats for date range ───────────────────────────── */
  const stats = useMemo(() => {
    let totalIn = 0, totalOut = 0;
    dateFiltered.forEach(tx => {
      if (tx.type === "in") totalIn += Number(tx.amount);
      else totalOut += Number(tx.amount);
    });
    return { totalIn, totalOut, net: totalIn - totalOut, count: dateFiltered.length };
  }, [dateFiltered]);

  /* ── Cumulative balance (all data up to period end) ─── */
  const cumulativeBalance = useMemo(() => {
    let endD;
    if (filterMode === "monthly") endD = new Date(selYear, selMonth + 1, 0, 23, 59, 59);
    else if (filterMode === "yearly") endD = new Date(selYear, 11, 31, 23, 59, 59);
    else if (filterMode === "custom" && endDate) endD = parseLocalDate(endDate);
    else endD = new Date("2999-12-31");

    let bal = 0;
    transactions.forEach(tx => {
      const d = parseLocalDate(tx.transaction_date);
      if (d <= endD) {
        bal += tx.type === "in" ? Number(tx.amount) : -Number(tx.amount);
      }
    });
    return bal;
  }, [transactions, filterMode, selYear, selMonth, endDate]);

  /* ── Category breakdown ─────────────────────────────── */
  const catBreakdown = useMemo(() => {
    const inTotals = {}, outTotals = {};
    CAT_IN.forEach(c => inTotals[c.value] = 0);
    CAT_OUT.forEach(c => outTotals[c.value] = 0);
    dateFiltered.forEach(tx => {
      const amt = Number(tx.amount);
      if (tx.type === "in")  inTotals[tx.category]  = (inTotals[tx.category]  || 0) + amt;
      else                   outTotals[tx.category]  = (outTotals[tx.category] || 0) + amt;
    });
    return { inTotals, outTotals };
  }, [dateFiltered]);

  /* ── Monthly cash-flow summary ──────────────────────── */
  const monthlySummary = useMemo(() => {
    // Which year to show
    const year = (filterMode === "all" || filterMode === "custom") ? new Date().getFullYear() : selYear;
    const arr = Array.from({ length: 12 }, (_, i) => ({ idx: i, name: MONTHS_BN[i], income: 0, expense: 0 }));
    transactions.forEach(tx => {
      const d = parseLocalDate(tx.transaction_date);
      if (d.getFullYear() === year) {
        const m = d.getMonth();
        if (tx.type === "in")  arr[m].income  += Number(tx.amount);
        else                   arr[m].expense += Number(tx.amount);
      }
    });
    // When monthly mode: only show that specific month
    if (filterMode === "monthly") return { year, data: [arr[selMonth]] };
    return { year, data: arr.filter(m => m.income > 0 || m.expense > 0) };
  }, [transactions, filterMode, selYear, selMonth]);

  /* ── Reset filters ──────────────────────────────────── */
  const resetFilters = () => {
    setFilterMode("all");
    setSelYear(new Date().getFullYear());
    setSelMonth(new Date().getMonth());
    setStartDate(""); setEndDate("");
    setSelType("all"); setSelCat("all");
  };

  /* ── Active filter label ────────────────────────────── */
  const filterLabel = useMemo(() => {
    if (filterMode === "monthly") return `${MONTHS_BN[selMonth]} ${selYear}`;
    if (filterMode === "yearly")  return `সালে ${selYear}`;
    if (filterMode === "custom")  return startDate || endDate ? `${startDate || "..."} → ${endDate || "..."}` : "কাস্টম";
    return "সব সময়";
  }, [filterMode, selYear, selMonth, startDate, endDate]);

  const hasActiveFilter = filterMode !== "all" || selType !== "all" || selCat !== "all";

  /* ── Styles shortcuts ───────────────────────────────── */
  const card = {
    background: "rgba(15,15,26,0.7)",
    border: "1px solid rgba(139,92,246,0.1)",
    borderRadius: 16,
  };

  /* ══════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen p-4 md:p-7 space-y-5"
      style={{ background: "var(--bg-root)", color: "var(--text-primary)", fontFamily: "Inter, sans-serif" }}>

      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-5"
        style={{ borderBottom: "1px solid rgba(139,92,246,0.1)" }}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 size={15} style={{ color: "#7C3AED" }} />
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#4A4A6A" }}>Reports</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black gradient-text-violet">আর্থিক রিপোর্ট</h1>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            ফিল্টার করুন • বিশ্লেষণ করুন • রিপোর্ট দেখুন
          </p>
        </div>
        <button onClick={() => fetchData(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:-translate-y-0.5"
          style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", color: "#A78BFA" }}>
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          রিলোড
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-3">
          <Loader2 size={40} className="animate-spin" style={{ color: "#7C3AED" }} />
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>রিপোর্ট লোড হচ্ছে...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <AlertCircle size={40} style={{ color: "#F43F5E" }} />
          <p className="text-sm" style={{ color: "#FB7185" }}>{error}</p>
          <button onClick={() => fetchData(true)}
            className="px-4 py-2 rounded-xl text-xs font-semibold"
            style={{ background: "rgba(244,63,94,0.1)", color: "#FB7185" }}>
            আবার চেষ্টা করুন
          </button>
        </div>
      ) : (
        <>
          {/* ══ FILTER PANEL ══════════════════════════════ */}
          <div style={{ ...card, padding: "20px 20px 16px" }}>
            <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom: "1px solid rgba(139,92,246,0.1)" }}>
              <ListFilter size={15} style={{ color: "#7C3AED" }} />
              <h4 className="text-sm font-bold" style={{ color: "#C4B5FD" }}>ফিল্টার প্যানেল</h4>
              {hasActiveFilter && (
                <button onClick={resetFilters}
                  className="ml-auto flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg"
                  style={{ background: "rgba(244,63,94,0.1)", color: "#FB7185" }}>
                  <X size={11} />রিসেট
                </button>
              )}
            </div>

            {/* Row 1: Mode selector tabs */}
            <div className="flex flex-wrap gap-2 mb-4">
              {[
                { key: "all",     label: "সব সময়",   icon: "∞" },
                { key: "monthly", label: "মাসিক",     icon: "📅" },
                { key: "yearly",  label: "বার্ষিক",    icon: "📆" },
                { key: "custom",  label: "কাস্টম তারিখ", icon: "🗓" },
              ].map(({ key, label, icon }) => (
                <button key={key} onClick={() => setFilterMode(key)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                  style={{
                    background: filterMode === key ? "rgba(124,58,237,0.2)" : "rgba(15,15,26,0.6)",
                    border: filterMode === key ? "1px solid rgba(124,58,237,0.45)" : "1px solid rgba(139,92,246,0.1)",
                    color: filterMode === key ? "#C4B5FD" : "#52527A",
                    boxShadow: filterMode === key ? "0 0 12px rgba(124,58,237,0.15)" : "none"
                  }}>
                  <span>{icon}</span>{label}
                </button>
              ))}
            </div>

            {/* Row 2: Conditional date inputs + type + category */}
            <div className="flex flex-wrap gap-3 items-end">

              {/* Monthly: Month + Year */}
              {filterMode === "monthly" && (
                <>
                  <SelectField label="মাস" value={selMonth} onChange={v => setSelMonth(Number(v))}>
                    {MONTHS_BN.map((m, i) => <option key={i} value={i}>{m}</option>)}
                  </SelectField>
                  <SelectField label="বছর" value={selYear} onChange={v => setSelYear(Number(v))}>
                    {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                  </SelectField>
                </>
              )}

              {/* Yearly: Year only */}
              {filterMode === "yearly" && (
                <SelectField label="বছর" value={selYear} onChange={v => setSelYear(Number(v))}>
                  {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                </SelectField>
              )}

              {/* Custom: date range */}
              {filterMode === "custom" && (
                <>
                  <DateField label="শুরুর তারিখ" value={startDate} onChange={setStartDate} />
                  <DateField label="শেষ তারিখ"   value={endDate}   onChange={setEndDate} />
                </>
              )}

              {/* Type filter - always visible */}
              <SelectField label="লেনদেনের ধরন" value={selType} onChange={v => { setSelType(v); setSelCat("all"); }}>
                <option value="all">সব লেনদেন</option>
                <option value="in">শুধু আয় (Cash In)</option>
                <option value="out">শুধু ব্যয় (Cash Out)</option>
              </SelectField>

              {/* Category filter - always visible */}
              <SelectField label="ক্যাটাগরি" value={selCat} onChange={setSelCat}>
                <option value="all">সব ক্যাটাগরি</option>
                {selType === "in"  && CAT_IN.map(c  => <option key={c.value} value={c.value}>{c.label}</option>)}
                {selType === "out" && CAT_OUT.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                {selType === "all" && ALL_CATS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </SelectField>
            </div>

            {/* Active filter badge */}
            <div className="mt-3 flex items-center gap-2">
              <Zap size={12} style={{ color: "#7C3AED" }} />
              <span className="text-[11px]" style={{ color: "#52527A" }}>
                সক্রিয় ফিল্টার:&nbsp;
                <span style={{ color: "#A78BFA", fontWeight: 600 }}>{filterLabel}</span>
                {selType !== "all" && <> · <span style={{ color: "#A78BFA", fontWeight: 600 }}>{selType === "in" ? "শুধু আয়" : "শুধু ব্যয়"}</span></>}
                {selCat  !== "all" && <> · <span style={{ color: "#A78BFA", fontWeight: 600 }}>{getCatMeta(selCat, selType).label}</span></>}
              </span>
              <span className="ml-auto text-[11px]" style={{ color: "#3D3D5C" }}>
                {finalFiltered.length} টি লেনদেন
              </span>
            </div>
          </div>

          {/* ══ KPI CARDS ════════════════════════════════ */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "মোট আয়",       val: stats.totalIn,        color: "#10B981", Icon: TrendingUp,   glow: "rgba(16,185,129,0.15)"  },
              { label: "মোট ব্যয়",      val: stats.totalOut,       color: "#F43F5E", Icon: TrendingDown, glow: "rgba(244,63,94,0.15)"   },
              { label: "পিরিয়ড নিট",   val: stats.net,            color: stats.net >= 0 ? "#A78BFA" : "#F59E0B", Icon: Wallet, glow: "rgba(124,58,237,0.1)" },
              { label: "ক্রমসঞ্চিত ব্যালেন্স", val: cumulativeBalance, color: cumulativeBalance >= 0 ? "#A78BFA" : "#F43F5E", Icon: BarChart3, glow: "rgba(124,58,237,0.1)" },
            ].map(({ label, val, color, Icon, glow }) => (
              <div key={label} className="rounded-2xl p-4 flex flex-col gap-3 transition-all duration-300"
                style={{ background: `linear-gradient(135deg, ${glow} 0%, rgba(15,15,26,0.8) 100%)`, border: `1px solid ${color}22` }}>
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-medium" style={{ color: "#6B6B8A" }}>{label}</p>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
                    <Icon size={13} style={{ color }} />
                  </div>
                </div>
                <p className="text-xl font-black leading-none" style={{ color }}>
                  ৳ {Math.abs(val).toLocaleString("bn-BD")}
                  {val < 0 && <span className="text-xs font-medium ml-1" style={{ color: "#6B6B8A" }}>(ঋণাত্মক)</span>}
                </p>
              </div>
            ))}
          </div>

          {/* ══ MONTHLY SUMMARY ══════════════════════════ */}
          <div style={card} className="p-5">
            <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom: "1px solid rgba(139,92,246,0.1)" }}>
              <Calendar size={14} style={{ color: "#7C3AED" }} />
              <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                {filterMode === "monthly"
                  ? `${MONTHS_BN[selMonth]} ${selYear} — মাসিক সারাংশ`
                  : `মাসিক আয়-ব্যয় সারাংশ (${monthlySummary.year})`}
              </h3>
            </div>

            {monthlySummary.data.length === 0 ? (
              <p className="text-center py-8 text-xs" style={{ color: "#3D3D5C" }}>
                এই পিরিয়ডে কোনো ডেটা নেই।
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {monthlySummary.data.map((m) => {
                  const net = m.income - m.expense;
                  const maxAmt = Math.max(m.income, m.expense, 1);
                  return (
                    <div key={m.idx} className="rounded-xl p-3.5 flex flex-col gap-2.5 transition-all duration-200 hover:-translate-y-0.5"
                      style={{ background: "rgba(8,8,15,0.7)", border: "1px solid rgba(139,92,246,0.1)" }}>
                      <h4 className="text-xs font-bold" style={{ color: "#C4B5FD" }}>{m.name}</h4>

                      {/* Mini bar chart */}
                      <div className="flex items-end gap-1 h-8">
                        <div className="flex-1 rounded-sm transition-all duration-500"
                          style={{ height: `${(m.income / maxAmt) * 100}%`, minHeight: m.income > 0 ? 4 : 0, background: "linear-gradient(to top, #059669, #10B981)" }} />
                        <div className="flex-1 rounded-sm transition-all duration-500"
                          style={{ height: `${(m.expense / maxAmt) * 100}%`, minHeight: m.expense > 0 ? 4 : 0, background: "linear-gradient(to top, #BE123C, #F43F5E)" }} />
                      </div>

                      <div className="space-y-1 text-[10px]">
                        <div className="flex justify-between">
                          <span style={{ color: "#4A4A6A" }}>আয়</span>
                          <span style={{ color: "#10B981", fontWeight: 700 }}>৳{m.income.toLocaleString("bn-BD")}</span>
                        </div>
                        <div className="flex justify-between">
                          <span style={{ color: "#4A4A6A" }}>ব্যয়</span>
                          <span style={{ color: "#F43F5E", fontWeight: 700 }}>৳{m.expense.toLocaleString("bn-BD")}</span>
                        </div>
                        <div className="flex justify-between pt-1.5" style={{ borderTop: "1px solid rgba(139,92,246,0.08)" }}>
                          <span style={{ color: "#4A4A6A" }}>উদ্বৃত্ত</span>
                          <span style={{ color: net >= 0 ? "#A78BFA" : "#F59E0B", fontWeight: 700 }}>৳{net.toLocaleString("bn-BD")}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ══ CATEGORY BREAKDOWN ════════════════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[
              { title: "আয়ের খাতসমূহ", Icon: TrendingUp, cats: CAT_IN,  totals: catBreakdown.inTotals,  total: stats.totalIn,  accent: "#10B981" },
              { title: "ব্যয়ের খাতসমূহ", Icon: TrendingDown, cats: CAT_OUT, totals: catBreakdown.outTotals, total: stats.totalOut, accent: "#F43F5E" },
            ].map(({ title, Icon, cats, totals, total, accent }) => (
              <div key={title} style={card} className="p-5">
                <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom: "1px solid rgba(139,92,246,0.1)" }}>
                  <Icon size={14} style={{ color: accent }} />
                  <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{title}</h3>
                </div>
                {total === 0 ? (
                  <p className="text-center py-6 text-xs" style={{ color: "#3D3D5C" }}>কোনো রেকর্ড নেই</p>
                ) : (
                  <div className="space-y-3">
                    {cats.map(cat => {
                      const amt = totals[cat.value] || 0;
                      const pct = total > 0 ? (amt / total) * 100 : 0;
                      if (amt === 0) return null;
                      return (
                        <div key={cat.value} className="space-y-1">
                          <div className="flex justify-between items-center text-xs">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full inline-block shrink-0" style={{ background: cat.color }} />
                              <span style={{ color: "#9898B8" }}>{cat.label}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span style={{ color: cat.color, fontWeight: 700 }}>৳{amt.toLocaleString("bn-BD")}</span>
                              <span style={{ color: "#3D3D5C" }}>{pct.toFixed(1)}%</span>
                            </div>
                          </div>
                          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(139,92,246,0.08)" }}>
                            <div className="h-1.5 rounded-full transition-all duration-700"
                              style={{ width: `${pct}%`, background: cat.color }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* ══ TRANSACTIONS TABLE ════════════════════════ */}
          <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(15,15,26,0.7)", border: "1px solid rgba(139,92,246,0.1)" }}>
            <div className="px-5 py-4 flex items-center justify-between flex-wrap gap-2"
              style={{ borderBottom: "1px solid rgba(139,92,246,0.08)" }}>
              <div className="flex items-center gap-2">
                <FileText size={14} style={{ color: "#7C3AED" }} />
                <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>লেনদেনের ইতিহাস</h3>
              </div>
              <span className="text-xs" style={{ color: "#4A4A6A" }}>
                মোট <span style={{ color: "#A78BFA", fontWeight: 700 }}>{finalFiltered.length}</span> টি লেনদেন
              </span>
            </div>

            {finalFiltered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <FileText size={32} style={{ color: "#2E2E4E" }} />
                <p className="text-xs" style={{ color: "#3D3D5C" }}>ফিল্টারের সাথে মিলে এমন কোনো লেনদেন নেই।</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[10px] font-bold uppercase tracking-wider"
                      style={{ background: "rgba(8,8,15,0.8)", borderBottom: "1px solid rgba(139,92,246,0.1)", color: "#3D3D5C" }}>
                      <th className="px-5 py-3">তারিখ</th>
                      <th className="px-5 py-3">ধরন</th>
                      <th className="px-5 py-3">উদ্দেশ্য</th>
                      <th className="px-5 py-3">ক্যাটাগরি</th>
                      <th className="px-5 py-3">উৎস</th>
                      <th className="px-5 py-3 text-right">পরিমাণ</th>
                      <th className="px-5 py-3">মন্তব্য</th>
                    </tr>
                  </thead>
                  <tbody>
                    {finalFiltered.map((tx, i) => {
                      const isIn = tx.type === "in";
                      const catMeta = getCatMeta(tx.category, tx.type);
                      return (
                        <tr key={tx.id}
                          className="text-xs transition-colors"
                          style={{
                            borderBottom: i < finalFiltered.length - 1 ? "1px solid rgba(139,92,246,0.05)" : "none",
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = "rgba(139,92,246,0.04)"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        >
                          <td className="px-5 py-3 whitespace-nowrap" style={{ color: "#52527A" }}>
                            {parseLocalDate(tx.transaction_date).toLocaleDateString("bn-BD", { year: "numeric", month: "short", day: "numeric" })}
                          </td>
                          <td className="px-5 py-3">
                            <span className="flex items-center gap-1 w-fit px-2.5 py-1 rounded-full text-[10px] font-bold"
                              style={{ background: isIn ? "rgba(16,185,129,0.1)" : "rgba(244,63,94,0.1)", color: isIn ? "#10B981" : "#F43F5E" }}>
                              {isIn ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                              {isIn ? "আয়" : "ব্যয়"}
                            </span>
                          </td>
                          <td className="px-5 py-3 font-semibold" style={{ color: "var(--text-primary)" }}>
                            {tx.purpose}
                          </td>
                          <td className="px-5 py-3">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold"
                              style={{ background: catMeta.bg, color: catMeta.color }}>
                              {catMeta.label}
                            </span>
                          </td>
                          <td className="px-5 py-3 whitespace-nowrap" style={{ color: "#52527A" }}>
                            {tx.source || "—"}
                          </td>
                          <td className="px-5 py-3 text-right font-black whitespace-nowrap"
                            style={{ color: isIn ? "#10B981" : "#F43F5E" }}>
                            {isIn ? "+" : "-"} ৳{Number(tx.amount).toLocaleString("bn-BD")}
                          </td>
                          <td className="px-5 py-3 max-w-[160px] truncate" style={{ color: "#52527A" }}>
                            {tx.remarks || "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

/* ── Helper: SelectField ─────────────────────────────────── */
const SelectField = ({ label, value, onChange, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#4A4A6A" }}>
      {label}
    </label>
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="appearance-none pr-8 pl-3 py-2.5 text-xs font-medium rounded-xl outline-none cursor-pointer"
        style={{
          background: "rgba(8,8,15,0.9)",
          border: "1px solid rgba(139,92,246,0.2)",
          color: "#C4B5FD",
          minWidth: 130
        }}
      >
        {children}
      </select>
      <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: "#52527A" }} />
    </div>
  </div>
);

/* ── Helper: DateField ───────────────────────────────────── */
const DateField = ({ label, value, onChange }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#4A4A6A" }}>
      {label}
    </label>
    <input
      type="date"
      value={value}
      onChange={e => onChange(e.target.value)}
      className="px-3 py-2.5 text-xs font-medium rounded-xl outline-none cursor-pointer"
      style={{
        background: "rgba(8,8,15,0.9)",
        border: "1px solid rgba(139,92,246,0.2)",
        color: "#C4B5FD",
        minWidth: 140,
        colorScheme: "dark"
      }}
    />
  </div>
);

export default CashReports;