import { useCallback, useEffect, useState } from "react";
import {
  ArrowUpRight,
  PlusCircle,
  Sparkles,
  Truck,
  Users,
  Wrench,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import api from "../api/api";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import DashboardCard from "../components/DashboardCard";

function Dashboard() {
  const [summary, setSummary] = useState({
    total_users: 0,
    total_vehicles: 0,
    total_maintenance_records: 0,
    scheduled_maintenance: 0,
    completed_maintenance: 0,
  });

  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchDashboard = useCallback(async () => {
    try {
      const response = await api.get("/dashboard/summary");

      setSummary(response.data);
    } catch (error) {
      console.error("Dashboard Error:", error);

      toast.error(error.response?.data?.detail || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDashboard();
  }, [fetchDashboard]);

  // ✅ LOADING UI FIX
  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-64">
          <Navbar />
          <main className="p-6">
            <p className="text-gray-500">Loading dashboard...</p>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      {/* ✅ Sidebar */}
      <Sidebar />

      {/* ✅ Main Content */}
      <div className="flex-1 ml-64">
        <Navbar />

        <main className="p-6 space-y-6">

          {/* Hero Section */}
          <section className="bg-white p-6 rounded-xl shadow">
            <h1 className="text-3xl font-bold text-slate-800">
              Fleet Maintenance Scheduling Platform
            </h1>

            <p className="text-gray-500 mt-2">
              Track vehicles, maintenance, and fleet performance in real time.
            </p>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => navigate("/vehicles")}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded"
              >
                <PlusCircle size={18} />
                Add Vehicle
              </button>

              <button
                onClick={() => navigate("/maintenance")}
                className="flex items-center gap-2 border px-4 py-2 rounded"
              >
                <Wrench size={18} />
                Schedule Maintenance
              </button>
            </div>
          </section>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
            <DashboardCard
              title="Total Users"
              value={summary.total_users}
              icon={<Users className="h-5 w-5" />}
            />

            <DashboardCard
              title="Total Vehicles"
              value={summary.total_vehicles}
              icon={<Truck className="h-5 w-5" />}
            />

            <DashboardCard
              title="Total Maintenance"
              value={summary.total_maintenance_records}
              icon={<Sparkles className="h-5 w-5" />}
            />

            <DashboardCard
              title="Scheduled"
              value={summary.scheduled_maintenance}
              icon={<Wrench className="h-5 w-5" />}
            />

            <DashboardCard
              title="Completed"
              value={summary.completed_maintenance}
              icon={<ArrowUpRight className="h-5 w-5" />}
            />
          </div>

        </main>
      </div>
    </div>
  );
}

export default Dashboard;
