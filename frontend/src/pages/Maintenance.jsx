import { useEffect, useState } from "react";
import { PlusCircle, RefreshCw, Search } from "lucide-react";
import toast from "react-hot-toast";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import MaintenanceTable from "../components/MaintenanceTable";
import MaintenanceModal from "../components/MaintenanceModal";

import {
  getMaintenance,
  addMaintenance,
  updateMaintenance,
  deleteMaintenance,
} from "../services/maintenanceService";

function Maintenance() {
  const [maintenance, setMaintenance] = useState([]);
  const [filteredMaintenance, setFilteredMaintenance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState(null);

  // ✅ AUTO FETCH
  useEffect(() => {
    fetchMaintenance();
  }, []);

  useEffect(() => {
    filterMaintenance();
  }, [search, maintenance]);

  const fetchMaintenance = async () => {
    try {
      setLoading(true);
      const data = await getMaintenance();
      setMaintenance(data);
      setFilteredMaintenance(data);
    } catch (error) {
      console.error(error);
      toast.error("Unable to load maintenance records.");
    } finally {
      setLoading(false);
    }
  };

  const filterMaintenance = () => {
    const keyword = search.toLowerCase();

    setFilteredMaintenance(
      maintenance.filter(
        (item) =>
          item.maintenance_type.toLowerCase().includes(keyword) ||
          String(item.vehicle_id).includes(keyword) ||
          (item.status || "").toLowerCase().includes(keyword)
      )
    );
  };

  const handleAdd = () => {
    setSelectedMaintenance(null);
    setModalOpen(true);
  };

  const handleEdit = (item) => {
    setSelectedMaintenance(item);
    setModalOpen(true);
  };

  const handleSave = async (item) => {
    try {
      if (selectedMaintenance) {
        await updateMaintenance(selectedMaintenance.id, item);
        toast.success("Maintenance updated successfully.");
      } else {
        await addMaintenance(item);
        toast.success("Maintenance scheduled successfully.");
      }

      setModalOpen(false);
      fetchMaintenance();
    } catch (error) {
      console.error(error);
      toast.error("Operation failed.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this maintenance record?")) return;

    try {
      await deleteMaintenance(id);
      toast.success("Maintenance deleted.");
      fetchMaintenance();
    } catch (error) {
      console.error(error);
      toast.error("Unable to delete maintenance.");
    }
  };

  return (
    <div className="flex">
      
      {/* ✅ Sidebar */}
      <Sidebar />

      {/* ✅ Main Content */}
      <div className="flex-1 ml-64">
        <Navbar />

        <main className="p-6 space-y-6">

          {/* Header */}
          <section className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Maintenance Management</h1>
              <p className="text-gray-500">
                Schedule and manage maintenance records
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAdd}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded"
              >
                <PlusCircle size={18} />
                Schedule
              </button>

              <button
                onClick={fetchMaintenance}
                className="flex items-center gap-2 border px-4 py-2 rounded"
              >
                <RefreshCw size={18} />
                Refresh
              </button>
            </div>
          </section>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search maintenance..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded w-full"
            />
          </div>

          {/* Table */}
          <MaintenanceTable
            maintenance={filteredMaintenance}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

        </main>
      </div>

      {/* Modal */}
      <MaintenanceModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        maintenance={selectedMaintenance}
      />
    </div>
  );
}

export default Maintenance;