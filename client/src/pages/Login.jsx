import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Lock, Mail, AlertCircle, Wallet, TrendingUp, ShieldCheck } from "lucide-react";
import API_BASE from "../api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("isLoggedIn") === "true") {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "লগইন করতে ব্যর্থ হয়েছে");
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("adminName", data.user?.name || "Kabir");
      localStorage.setItem("adminEmail", data.user?.email || email);
      window.dispatchEvent(new Event("settings-update"));
      navigate("/", { replace: true });
    } catch (err) {
      console.error(err);
      setError(err.message || "সার্ভার সংযোগে সমস্যা হচ্ছে");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg-root)", fontFamily: "Inter, sans-serif" }}>

      {/* Left Panel — Branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(145deg, #0D0D1F 0%, #130D2E 50%, #0A0A1A 100%)" }}>
        
        {/* Purple glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)", filter: "blur(40px)" }} />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(79,70,229,0.14) 0%, transparent 70%)", filter: "blur(60px)" }} />

        {/* Logo top */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-lg"
            style={{ background: "linear-gradient(135deg, #7C3AED, #4F46E5)", boxShadow: "0 0 24px rgba(124,58,237,0.4)" }}>
            K
          </div>
          <div>
            <div className="font-bold text-white text-lg leading-none gradient-text-violet">K-Finance</div>
            <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Kabir&apos;s Personal Finance</div>
          </div>
        </div>

        {/* Center content */}
        <div className="relative z-10 space-y-10">
          <div>
            <h1 className="text-4xl font-black text-white leading-tight mb-4">
              আপনার অর্থের<br />
              <span className="gradient-text-violet">সম্পূর্ণ নিয়ন্ত্রণ</span>
            </h1>
            <p className="text-base leading-relaxed" style={{ color: "var(--text-muted)" }}>
              আয়, ব্যয়, লোন এবং সঞ্চয় — সবকিছু এক জায়গায় ট্র্যাক করুন।
              সহজ, দ্রুত এবং সুন্দর।
            </p>
          </div>

          {/* Feature pills */}
          <div className="space-y-3">
            {[
              { icon: TrendingUp, label: "রিয়েল-টাইম ট্র্যাকিং", color: "#10B981" },
              { icon: Wallet, label: "ক্যাটাগরি অনুযায়ী বিশ্লেষণ", color: "#7C3AED" },
              { icon: ShieldCheck, label: "নিরাপদ ডেটা ম্যানেজমেন্ট", color: "#4F46E5" },
            ].map(({ icon: Icon, label, color }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${color}1A`, border: `1px solid ${color}33` }}>
                  <Icon size={16} style={{ color }} />
                </div>
                <span className="text-sm font-medium" style={{ color: "#C4C4E0" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div className="relative z-10">
          <p className="text-xs italic" style={{ color: "#3D3D5C" }}>
            &ldquo;আজকের সঞ্চয়, আগামীর স্বাধীনতা।&rdquo;
          </p>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12"
        style={{ background: "linear-gradient(180deg, #08080F 0%, #0C0C1A 100%)" }}>
        
        {/* Subtle bg glow */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(79,70,229,0.06) 0%, transparent 70%)", filter: "blur(80px)" }} />

        <div className="w-full max-w-md relative z-10 animate-fadeInUp">
          
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-lg"
              style={{ background: "linear-gradient(135deg, #7C3AED, #4F46E5)", boxShadow: "0 0 20px rgba(124,58,237,0.35)" }}>
              K
            </div>
            <div className="font-bold text-lg gradient-text-violet">K-Finance</div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-black text-white mb-2">স্বাগতম আবার! 👋</h2>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>আপনার অ্যাকাউন্টে প্রবেশ করতে নিচে লগইন করুন।</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 p-4 rounded-2xl flex items-start gap-3 text-sm animate-fadeIn"
              style={{ background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.2)" }}>
              <AlertCircle size={16} className="shrink-0 mt-0.5" style={{ color: "#F43F5E" }} />
              <span style={{ color: "#FB7185" }}>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold block" style={{ color: "#9898B8" }}
                htmlFor="email">ইমেইল এড্রেস</label>
              <div className="relative">
                <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: "#4A4A6A" }} />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="kabir@gmail.com"
                  className="input-field w-full pl-12 pr-4 py-3.5 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold block" style={{ color: "#9898B8" }}
                htmlFor="password">পাসওয়ার্ড</label>
              <div className="relative">
                <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: "#4A4A6A" }} />
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field w-full pl-12 pr-4 py-3.5 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-sm flex items-center justify-center gap-2 mt-2"
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>যাচাই হচ্ছে...</span>
                </>
              ) : (
                <span>প্রবেশ করুন →</span>
              )}
            </button>
          </form>

          {/* Hint */}
          <div className="mt-8 p-4 rounded-2xl text-xs"
            style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.12)" }}>
            <p className="font-semibold mb-1.5" style={{ color: "#9898B8" }}>পরীক্ষার অ্যাকাউন্ট:</p>
            <div className="space-y-0.5" style={{ color: "var(--text-muted)" }}>
              <p>ইমেইল: <span style={{ color: "#A78BFA" }}>kabir@gmail.com</span></p>
              <p>পাসওয়ার্ড: <span style={{ color: "#A78BFA" }}>password123</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
