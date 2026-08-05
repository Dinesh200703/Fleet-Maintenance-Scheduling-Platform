import { useEffect, useState } from "react";
import { PlusCircle, RefreshCw, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import VehicleTable from "../components/VehicleTable";
import VehicleModal from "../components/VehicleModal";

import {
  getVehicles,
  addVehicle,
  updateVehicle,
  deleteVehicle,
} from "../services/vehicleService";

function Vehicles() {
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    filterVehicles();
  }, [search, vehicles]);

  const fetchVehicles = async () => {
    try {
      setLoading(true);

      const data = await getVehicles();

      setVehicles(data);
      setFilteredVehicles(data);
    } catch (error) {
      console.error(error);
      toast.error("Unable to fetch vehicles.");
    } finally {
      setLoading(false);
    }
  };

  const filterVehicles = () => {
    const keyword = search.toLowerCase();

    const filtered = vehicles.filter((vehicle) =>
      vehicle.vehicle_number.toLowerCase().includes(keyword) ||
      vehicle.manufacturer.toLowerCase().includes(keyword) ||
      vehicle.model.toLowerCase().includes(keyword)
    );

    setFilteredVehicles(filtered);
  };

  const handleAddVehicle = () => {
    setSelectedVehicle(null);
    setModalOpen(true);
  };

  const handleEditVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setModalOpen(true);
  };

  const handleSaveVehicle = async (vehicle) => {
    try {
      if (selectedVehicle) {
        await updateVehicle(selectedVehicle.id, vehicle);
        toast.success("Vehicle updated successfully.");
      } else {
        await addVehicle(vehicle);
        toast.success("Vehicle added successfully.");
      }

      setModalOpen(false);
      fetchVehicles();
    } catch (error) {
      console.error(error);
      toast.error("Operation failed.");
    }
  };

  const handleDeleteVehicle = async (id) => {
    const confirmDelete = window.confirm(
      "Delete this vehicle?"
    );

    if (!confirmDelete) return;

    try {
      await deleteVehicle(id);
      toast.success("Vehicle deleted.");
      fetchVehicles();
    } catch (error) {
      console.error(error);
      toast.error("Unable to delete vehicle.");
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
                    Vehicle Management
                  </p>

                  <h1 className="mt-3 text-5xl font-black text-slate-900">
                    Manage Your Fleet
                  </h1>

                  <p className="mt-4 text-lg text-slate-600">
                    Search, update and manage all fleet vehicles.
                  </p>

                </div>

                <div className="flex gap-3">

                  <button
                    onClick={handleAddVehicle}
                    className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 px-5 py-3 font-semibold text-white transition hover:scale-105"
                  >
                    <PlusCircle size={20} />
                    Add Vehicle
                  </button>

                  <button
                    onClick={fetchVehicles}
                    className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
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
                  placeholder="Search vehicle number, manufacturer or model..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-slate-700 outline-none transition focus:border-blue-500"
                />

              </div>

            </section>

            {/* Table */}

            <VehicleTable
              vehicles={filteredVehicles}
              loading={loading}
              onEdit={handleEditVehicle}
              onDelete={handleDeleteVehicle}
            />

          </div>
        </main>
      </div>

      {/* Vehicle Modal */}
      <VehicleModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveVehicle}
        vehicle={selectedVehicle}
      />
    </div>
  );
}

export default Vehicles;