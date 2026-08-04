import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function Maintenance() {
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
          <h1>Maintenance Management</h1>

          <p>Maintenance CRUD operations will be displayed here.</p>
        </div>
      </div>
    </div>
  );
}

export default Maintenance;