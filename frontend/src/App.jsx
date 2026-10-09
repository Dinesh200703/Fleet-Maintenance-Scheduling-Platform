import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import api from "./api/api";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Vehicles from "./pages/Vehicles";
import Maintenance from "./pages/Maintenance";
import AdminDashboard from "./pages/AdminDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import DriverDashboard from "./pages/DriverDashboard";

function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  const [session, setSession] = useState({ loading: Boolean(token), role: null });

  useEffect(() => {
    if (!token) return;
    let active = true;
    api.get("/auth/me")
      .then(({ data }) => active && setSession({ loading: false, role: String(data.role || "").trim().toLowerCase() }))
      .catch(() => active && setSession({ loading: false, role: null }));
    return () => { active = false; };
  }, [token]);

  if (!token) return <Navigate to="/" replace />;
  if (session.loading) return <div className="p-8 text-center text-slate-500">Checking session...</div>;
  if (!allowedRoles.includes(session.role)) {
    const home = { admin: "/admin", manager: "/manager", driver: "/driver" }[session.role] || "/";
    return <Navigate to={home} replace />;
  }
  return children;
}

function AuthenticatedHome() {
  const token = localStorage.getItem("token");
  const [session, setSession] = useState({ loading: Boolean(token), role: null, failed: false });

  useEffect(() => {
    if (!token) return;
    let active = true;
    api.get("/auth/me")
      .then(({ data }) => active && setSession({ loading: false, role: String(data.role || "").trim().toLowerCase(), failed: false }))
      .catch(() => active && setSession({ loading: false, role: null, failed: true }));
    return () => { active = false; };
  }, [token]);

  if (!token) return <Login />;
  if (session.loading) return <div className="p-8 text-center text-slate-500">Checking session...</div>;
  if (session.failed) return <Login />;
  const home = { admin: "/admin", manager: "/manager", driver: "/driver" }[session.role];
  return home ? <Navigate to={home} replace /> : <Login />;
}

function App() {
  const location = useLocation();
  const [, setSessionVersion] = useState(0);

  useEffect(() => {
    const handleExpiredSession = () => setSessionVersion((version) => version + 1);
    window.addEventListener("fleet:session-expired", handleExpiredSession);
    return () => window.removeEventListener("fleet:session-expired", handleExpiredSession);
  }, []);

  return <>
    <Routes location={location}>
      <Route path="/" element={<AuthenticatedHome />} />
      <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/manager" element={<ProtectedRoute allowedRoles={["manager"]}><ManagerDashboard /></ProtectedRoute>} />
      <Route path="/driver" element={<ProtectedRoute allowedRoles={["driver"]}><DriverDashboard /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute allowedRoles={["admin", "manager"]}><Dashboard /></ProtectedRoute>} />
      <Route path="/vehicles" element={<ProtectedRoute allowedRoles={["admin", "manager"]}><Vehicles /></ProtectedRoute>} />
      <Route path="/maintenance" element={<ProtectedRoute allowedRoles={["admin", "manager"]}><Maintenance /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    <Toaster position="top-right" />
  </>;
}

export default App;
