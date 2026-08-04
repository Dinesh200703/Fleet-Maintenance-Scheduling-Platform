import { useEffect, useState } from "react";
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
        alert("Session expired. Please login again.");

        localStorage.removeItem("token");

        window.location.href = "/";
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          textAlign: "center",
          marginTop: "100px",
          fontSize: "22px",
          fontWeight: "bold",
        }}
      >
        Loading Dashboard...
      </div>
    );
  }

  return (
    <div>
      <Navbar />

      <div style={{ display: "flex" }}>
        <Sidebar />

        <div
          style={{
            flex: 1,
            padding: "30px",
            background: "#f3f4f6",
            minHeight: "100vh",
          }}
        >
          <h1
            style={{
              marginBottom: "30px",
            }}
          >
            Fleet Dashboard
          </h1>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px,1fr))",
              gap: "20px",
            }}
          >
            <DashboardCard
              title="Total Users"
              value={summary.total_users}
            />

            <DashboardCard
              title="Total Vehicles"
              value={summary.total_vehicles}
            />

            <DashboardCard
              title="Total Maintenance"
              value={summary.total_maintenance_records}
            />

            <DashboardCard
              title="Scheduled Maintenance"
              value={summary.scheduled_maintenance}
            />

            <DashboardCard
              title="Completed Maintenance"
              value={summary.completed_maintenance}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;