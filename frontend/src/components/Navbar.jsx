import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, ChevronDown, LogOut, Search, UserCircle } from "lucide-react";
import toast from "react-hot-toast";

function Navbar() {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 h-24 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-8">
        {/* Left */}
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-blue-600">
            Fleet Operations
          </p>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          {/* Search Button */}
          <button
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:bg-slate-50"
          >
            <Search className="h-5 w-5 text-slate-600" />
          </button>

          {/* Notification */}
          <button
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:bg-slate-50"
          >
            <Bell className="h-5 w-5 text-slate-700" />
          </button>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex h-12 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 shadow-sm transition hover:bg-slate-50"
            >
              <UserCircle className="h-6 w-6 text-blue-600" />
              <span className="font-semibold text-slate-700">Admin</span>
              <ChevronDown className="h-4 w-4 text-slate-600" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-3 w-48 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-3 px-5 py-3 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;