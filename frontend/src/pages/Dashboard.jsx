import { useEffect, useState } from "react";
import { ArrowUpRight, PlusCircle, Sparkles, Truck, Users, Wrench } from "lucide-react";
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

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/dashboard/summary", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSummary(response.data);
    } catch (error) {
      console.error("Dashboard Error:", error);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        localStorage.removeItem("token");
        window.location.href = "/";
      } else {
        toast.error("Failed to load dashboard data.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="lg:flex">
          <Sidebar />
          <main className="flex-1 px-4 py-8 lg:px-8">
            <div className="mx-auto max-w-7xl space-y-6">
              <div className="grid gap-4 xl:grid-cols-5">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="h-40 rounded-3xl bg-slate-200" />
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="lg:flex">
        <Sidebar />
        <main className="flex-1 px-4 py-6 lg:px-8">
          <div className="mx-auto max-w-7xl space-y-6">
            {/* Hero Section */}
            <section className="rounded-[2.5rem] border border-slate-200 bg-white p-10 shadow-md">
              <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                <div className="max-w-3xl">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-600">
                    Fleet Management
                  </p>
                  <h1
                    className="mt-3 text-5xl font-black tracking-tight"
                    style={{
                      color: "#0f172a",
                      opacity: 1,
                    }}
                  >
                    Fleet Maintenance Scheduling Platform
                  </h1>
                  <p className="mt-4 text-lg leading-7 text-slate-700">
                    Track vehicles, maintenance, and fleet performance in real time with clear, enterprise-grade insights.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => navigate("/vehicles")}
                    className="inline-flex items-center gap-2 rounded-3xl bg-gradient-to-r from-blue-600 to-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:from-blue-700 hover:to-sky-600"
                  >
                    <PlusCircle className="h-5 w-5" />
                    Add Vehicle
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/maintenance")}
                    className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <Wrench className="h-5 w-5 text-slate-700" />
                    Schedule Maintenance
                  </button>
                </div>
              </div>
            </section>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-5">
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
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;