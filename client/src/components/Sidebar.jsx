import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  ArrowUp,
  ArrowDown,
  FileText,
  Settings,
  LogOut,
  X,
  Wallet,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

const Sidebar = ({ onClose }) => {
  const [userName, setUserName] = useState(() => localStorage.getItem("adminName") || "Kabir");
  const navigate = useNavigate();

  useEffect(() => {
    const handleUpdate = () => {
      setUserName(localStorage.getItem("adminName") || "Kabir");
    };
    window.addEventListener("settings-update", handleUpdate);
    return () => window.removeEventListener("settings-update", handleUpdate);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("adminName");
    localStorage.removeItem("adminEmail");
    navigate("/login", { replace: true });
  };

  const menuItems = [
    { title: "ড্যাশবোর্ড", icon: LayoutDashboard, path: "/" },
    { title: "আয় (Cash In)", icon: ArrowUp, path: "/cash-in" },
    { title: "ব্যয় (Cash Out)", icon: ArrowDown, path: "/cash-out" },
    { title: "রিপোর্ট", icon: FileText, path: "/reports" },
  ];

  const initials = userName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <aside
      className="w-72 min-h-screen flex flex-col select-none"
      style={{
        background: "linear-gradient(180deg, #0C0C1E 0%, #080810 100%)",
        borderRight: "1px solid rgba(139,92,246,0.1)",
        fontFamily: "Inter, sans-serif"
      }}
    >
      {/* Logo Header */}
      <div className="h-[70px] px-5 flex items-center justify-between shrink-0"
        style={{ borderBottom: "1px solid rgba(139,92,246,0.08)" }}>
        
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-base shrink-0"
            style={{
              background: "linear-gradient(135deg, #7C3AED, #4F46E5)",
              boxShadow: "0 0 20px rgba(124,58,237,0.35)"
            }}
          >
            <Wallet size={16} />
          </div>
          <div>
            <div className="font-extrabold text-sm leading-none gradient-text-violet tracking-wide">
              K-Finance
            </div>
            <div className="text-[10px] mt-0.5 font-medium tracking-widest uppercase"
              style={{ color: "#3D3D5C" }}>
              Kabir&apos;s Cash
            </div>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: "#4A4A6A" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#F1F0FF"; e.currentTarget.style.background = "rgba(139,92,246,0.1)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#4A4A6A"; e.currentTarget.style.background = "transparent"; }}
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-bold tracking-widest uppercase px-3 mb-3"
          style={{ color: "#2E2E4E" }}>Menu</p>

        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                  isActive ? "nav-active" : ""
                }`
              }
              style={({ isActive }) => ({
                color: isActive ? "#C4B5FD" : "#52527A",
                fontWeight: isActive ? "600" : "500",
              })}
            >
              {({ isActive }) => (
                <>
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200"
                    style={{
                      background: isActive ? "rgba(124,58,237,0.2)" : "transparent",
                      border: isActive ? "1px solid rgba(124,58,237,0.25)" : "1px solid transparent",
                    }}
                  >
                    <Icon size={16} style={{ color: isActive ? "#A78BFA" : "#3D3D5C" }} />
                  </div>
                  <span className="text-sm">{item.title}</span>
                  {isActive && (
                    <div
                      className="absolute right-3 w-1.5 h-1.5 rounded-full"
                      style={{ background: "#7C3AED", boxShadow: "0 0 6px rgba(124,58,237,0.8)" }}
                    />
                  )}
                </>
              )}
            </NavLink>
          );
        })}

        <div className="my-4" style={{ borderTop: "1px solid rgba(139,92,246,0.06)" }} />
        <p className="text-[10px] font-bold tracking-widest uppercase px-3 mb-3"
          style={{ color: "#2E2E4E" }}>General</p>

        <NavLink
          to="/settings"
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${isActive ? "nav-active" : ""}`
          }
          style={({ isActive }) => ({
            color: isActive ? "#C4B5FD" : "#52527A",
            fontWeight: isActive ? "600" : "500",
          })}
        >
          {({ isActive }) => (
            <>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{
                  background: isActive ? "rgba(124,58,237,0.2)" : "transparent",
                  border: isActive ? "1px solid rgba(124,58,237,0.25)" : "1px solid transparent",
                }}
              >
                <Settings size={16} style={{ color: isActive ? "#A78BFA" : "#3D3D5C" }} />
              </div>
              <span className="text-sm">সেটিংস</span>
            </>
          )}
        </NavLink>
      </nav>

      {/* User Profile at Bottom */}
      <div className="px-3 pb-4 shrink-0" style={{ borderTop: "1px solid rgba(139,92,246,0.08)", paddingTop: "12px" }}>
        <div
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
          style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.1)" }}
        >
          {/* Avatar */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0"
            style={{
              background: "linear-gradient(135deg, #7C3AED, #4F46E5)",
              boxShadow: "0 0 12px rgba(124,58,237,0.3)"
            }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold truncate" style={{ color: "#E0DFFF" }}>{userName}</div>
            <div className="text-[10px]" style={{ color: "#3D3D5C" }}>Administrator</div>
          </div>
          <button
            onClick={handleLogout}
            className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors shrink-0"
            style={{ color: "#3D3D5C" }}
            title="লগআউট"
            onMouseEnter={e => { e.currentTarget.style.color = "#F43F5E"; e.currentTarget.style.background = "rgba(244,63,94,0.1)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#3D3D5C"; e.currentTarget.style.background = "transparent"; }}
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;