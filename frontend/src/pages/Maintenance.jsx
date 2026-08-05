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
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="lg:flex">
        <Sidebar />

        <main className="flex-1 px-5 py-6 lg:px-8">
          <div className="mx-auto max-w-7xl space-y-6">

            {/* Hero */}

            <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">

              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                <div>

                  <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-600">
                    Maintenance Management
                  </p>

                  <h1 className="mt-3 text-5xl font-black text-slate-900">
                    Vehicle Maintenance
                  </h1>

                  <p className="mt-4 text-lg text-slate-600">
                    Schedule and manage maintenance records for your fleet.
                  </p>

                </div>

                <div className="flex gap-3">

                  <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 px-5 py-3 font-semibold text-white hover:scale-105 transition"
                  >
                    <PlusCircle size={20} />
                    Schedule
                  </button>

                  <button
                    onClick={fetchMaintenance}
                    className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    <RefreshCw size={18} />
                    Refresh
                  </button>

                </div>

              </div>

            </section>

            {/* Search */}

            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">

              <div className="relative max-w-lg">

                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                <input
                  type="text"
                  placeholder="Search maintenance..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 outline-none focus:border-blue-500"
                />

              </div>

            </section>

            {/* Table */}

            <MaintenanceTable
              maintenance={filteredMaintenance}
              loading={loading}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />

          </div>
        </main>
      </div>

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