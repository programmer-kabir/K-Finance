import { useState, useEffect } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { Menu } from "lucide-react";

const MainLayout = () => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsSidebarOpen(false);
  }, [location]);

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg-root)", fontFamily: "Inter, sans-serif" }}>

      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: "rgba(8,8,15,0.75)", backdropFilter: "blur(4px)" }}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out md:relative md:translate-x-0 shrink-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:flex`}
      >
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Mobile Header */}
        <header
          className="h-14 px-4 flex items-center justify-between md:hidden sticky top-0 z-30"
          style={{
            background: "rgba(8,8,15,0.85)",
            backdropFilter: "blur(16px)",
            borderBottom: "1px solid rgba(139,92,246,0.1)"
          }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="w-9 h-9 flex items-center justify-center rounded-xl transition-colors"
              style={{ color: "#52527A", background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.12)" }}
            >
              <Menu size={20} />
            </button>
            <span className="font-extrabold text-sm gradient-text-violet">K-Finance</span>
          </div>
          <div
            className="text-xs font-semibold px-3 py-1.5 rounded-full"
            style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.15)", color: "#A78BFA" }}
          >
            ৳ Kabir
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;