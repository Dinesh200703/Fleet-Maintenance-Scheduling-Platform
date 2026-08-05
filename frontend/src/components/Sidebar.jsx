import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Truck,
  Wrench,
} from "lucide-react";

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      path: "/vehicles",
      label: "Vehicles",
      icon: <Truck className="h-5 w-5" />,
    },
    {
      path: "/maintenance",
      label: "Maintenance",
      icon: <Wrench className="h-5 w-5" />,
    },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside
      className={`sticky top-0 z-20 h-screen overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 transition-all duration-300 ${
        collapsed ? "w-20" : "w-72"
      }`}
    >
      <div className="flex h-full flex-col p-5">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 text-white font-bold shadow-lg">
              F
            </div>

            {!collapsed && (
              <div>
                <p className="text-xs uppercase tracking-[0.30em] text-slate-400">
                  Fleet Ops
                </p>
                <h2 className="text-3xl font-bold text-white">
                  Command
                </h2>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            className="h-11 w-11 rounded-full bg-slate-800 hover:bg-slate-700 transition hover:translate-x-1 flex items-center justify-center text-slate-300 hover:text-white"
            aria-label="Toggle sidebar"
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`group flex w-full items-center gap-3 rounded-2xl px-5 py-4 text-sm font-medium transition-all duration-300 hover:translate-x-1 ${
                isActive(item.path)
                  ? "bg-slate-800 text-white shadow-lg"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {item.icon}
              {!collapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Logout Button - Pinned to bottom */}
        <div className="mt-auto">
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/");
            }}
            className="group flex w-full items-center gap-3 rounded-2xl bg-slate-900 border border-slate-800 px-5 py-4 text-sm font-medium text-slate-300 transition-all duration-300 hover:bg-red-600 hover:border-red-600 hover:text-white hover:translate-x-1"
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;