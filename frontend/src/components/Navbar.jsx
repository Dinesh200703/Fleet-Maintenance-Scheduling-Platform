import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, ChevronDown, LogOut, Search, UserCircle } from "lucide-react";
import toast from "react-hot-toast";

function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const displayName = localStorage.getItem("user_name") || (role ? role[0].toUpperCase() + role.slice(1) : "User");

  const logout = () => {
    ["token", "role", "driver_id", "user_id", "user_name"].forEach((key) => localStorage.removeItem(key));
    toast.success("Logged out successfully");

    navigate("/", { replace: true });
  };

  return (
    <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">

      {/* Left */}
      <h1 className="text-xl font-bold text-slate-800">
        Fleet Operations
      </h1>

      {/* Right */}
      <div className="flex items-center gap-4">

        {/* Search */}
        <button className="flex h-12 w-12 items-center justify-center rounded-2xl border bg-white">
          <Search className="h-5 w-5 text-slate-600" />
        </button>

        {/* Notification */}
        <button className="flex h-12 w-12 items-center justify-center rounded-2xl border bg-white">
          <Bell className="h-5 w-5 text-slate-700" />
        </button>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex h-12 items-center gap-3 rounded-2xl border px-5 bg-white"
          >
            <UserCircle className="h-6 w-6 text-blue-600" />
            <span className="font-semibold text-slate-700">{displayName}</span>
            <ChevronDown className="h-4 w-4 text-slate-600" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-3 w-48 rounded-2xl border bg-white shadow-xl">
              <button
                onClick={logout}
                className="flex w-full items-center gap-3 px-5 py-3 text-sm hover:bg-slate-50"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}

export default Navbar;
