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

  // ✅ FIXED NAV ITEMS (icons added)
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

  // ✅ Active route check
  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <aside
      className={`h-screen bg-slate-900 text-white flex flex-col transition-all ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* ✅ Header */}
      <div className="flex items-center justify-between p-4">
        {!collapsed && (
          <h2 className="text-lg font-bold">Fleet</h2>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 bg-slate-700 rounded"
        >
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </button>
      </div>

      {/* ✅ Navigation */}
      <nav className="flex-1 space-y-2 px-2">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition ${
              isActive(item.path)
                ? "bg-slate-700 text-white"
                : "text-gray-300 hover:bg-slate-800"
            }`}
          >
            {item.icon}
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* ✅ Logout */}
      <div className="p-4">
        <button
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/", { replace: true });
          }}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-red-500 hover:bg-red-600"
        >
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;