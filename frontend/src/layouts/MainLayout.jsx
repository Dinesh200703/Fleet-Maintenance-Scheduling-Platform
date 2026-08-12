import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function MainLayout() {
  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 ml-64">
        <Navbar />

        <main className="p-6">
          <Outlet /> {/* 🔥 Page will render here */}
        </main>
      </div>
    </div>
  );
}

export default MainLayout;