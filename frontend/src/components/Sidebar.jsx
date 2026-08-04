import { useNavigate, useLocation } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const menuStyle = (path) => ({
    width: "100%",
    padding: "12px",
    marginTop: "12px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    textAlign: "left",
    fontSize: "16px",
    background:
      location.pathname === path ? "#2563eb" : "#374151",
    color: "white",
  });

  return (
    <div
      style={{
        width: "230px",
        background: "#1f2937",
        color: "white",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <h2 style={{ textAlign: "center" }}>Menu</h2>

      <button
        style={menuStyle("/dashboard")}
        onClick={() => navigate("/dashboard")}
      >
        📊 Dashboard
      </button>

      <button
        style={menuStyle("/vehicles")}
        onClick={() => navigate("/vehicles")}
      >
        🚗 Vehicles
      </button>

      <button
        style={menuStyle("/maintenance")}
        onClick={() => navigate("/maintenance")}
      >
        🔧 Maintenance
      </button>

      <button
        style={{
          ...menuStyle("/"),
          background: "#dc2626",
          marginTop: "40px",
        }}
        onClick={logout}
      >
        🚪 Logout
      </button>
    </div>
  );
}

export default Sidebar;