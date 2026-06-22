import {
  LayoutDashboard,
  ArrowUp,
  ArrowDown,
  FileText,
  CheckSquare,
  Users,
  Settings,
  LogOut,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const menuItems = [
    {
      title: "ড্যাশবোর্ড",
      icon: LayoutDashboard,
      path: "/",
    },
    {
      title: "আয় (Cash In)",
      icon: ArrowUp,
      path: "/cash-in",
    },
    {
      title: "ব্যয় (Cash Out)",
      icon: ArrowDown,
      path: "/cash-out",
    },
    {
      title: "রিপোর্ট",
      icon: FileText,
      path: "/reports",
    },
    {
      title: "অনুদান",
      icon: CheckSquare,
      path: "/donations",
    },
    {
      title: "ব্যবহারকারী",
      icon: Users,
      path: "/users",
    },
  ];

  return (
    <aside className="w-72 min-h-screen bg-[#0B1220] border-r border-slate-800 flex flex-col">
      {/* Logo */}
      <div className="h-20 px-6 flex items-center border-b border-slate-800">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-lg">
          C
        </div>

        <div className="ml-3">
          <h2 className="text-white font-bold text-lg">
            Creative Cash
          </h2>

          <p className="text-slate-400 text-xs">
            Smart Management
          </p>
        </div>
      </div>

      {/* Menu */}
      <div className="flex-1 py-4 px-3">
        <p className="text-xs text-slate-500 uppercase px-3 mb-3">
          Main Menu
        </p>

        <div className="space-y-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={index}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`
                }
              >
                <Icon size={20} />
                <span className="font-medium">
                  {item.title}
                </span>
              </NavLink>
            );
          })}
        </div>

        <p className="text-xs text-slate-500 uppercase px-3 mt-8 mb-3">
          Settings
        </p>

        <NavLink
          to="/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white"
        >
          <Settings size={20} />
          <span>সেটিংস</span>
        </NavLink>
      </div>

      {/* User */}
      <div className="border-t border-slate-800 p-4">
        <div className="flex items-center justify-between bg-slate-900 rounded-xl p-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold">
              A
            </div>

            <div>
              <h3 className="text-white text-sm font-semibold">
                Admin
              </h3>

              <p className="text-slate-400 text-xs">
                Administrator
              </p>
            </div>
          </div>

          <button className="text-slate-400 hover:text-red-500">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;