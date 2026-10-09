import { useCallback, useEffect, useMemo, useState } from "react";
import { PlusCircle, RefreshCw, Search } from "lucide-react";
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
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // âœ… AUTO FETCH
  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getVehicles();
      setVehicles(data);
    } catch (error) {
      console.error(error);
      toast.error("Unable to fetch vehicles.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchVehicles();
  }, [fetchVehicles]);

  const filteredVehicles = useMemo(() => {
    const keyword = search.toLowerCase();
    return vehicles.filter((vehicle) =>
      vehicle.vehicle_number.toLowerCase().includes(keyword) ||
      vehicle.manufacturer.toLowerCase().includes(keyword) ||
      vehicle.model.toLowerCase().includes(keyword)
    );
  }, [search, vehicles]);

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
      } else {
        await addVehicle(vehicle);
      }

      toast.success(selectedVehicle ? "Vehicle updated successfully." : "Vehicle added successfully.");
      await fetchVehicles();
      setModalOpen(false);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.detail || "Vehicle save failed.");
    }
  };

  const handleDeleteVehicle = async (id) => {
    if (!window.confirm("Delete this vehicle?")) return;

    try {
      await deleteVehicle(id);
      toast.success("Vehicle deleted.");
      await fetchVehicles();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.detail || "Unable to delete vehicle.");
    }
  };

  return (
    <div className="flex"> {/* âœ… THIS FIXES EVERYTHING */}

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 ml-64">
        <Navbar />

        <main className="p-6 space-y-6">

          {/* Header */}
          <section className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Vehicle Management</h1>
              <p className="text-gray-500">Manage your fleet efficiently</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddVehicle}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded"
              >
                <PlusCircle size={18} />
                Add Vehicle
              </button>

              <button
                onClick={fetchVehicles}
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
              placeholder="Search vehicles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded w-full"
            />
          </div>

          {/* Table */}
          <VehicleTable
            vehicles={filteredVehicles}
            loading={loading}
            onEdit={handleEditVehicle}
            onDelete={handleDeleteVehicle}
          />

        </main>
      </div>

      {/* Modal */}
      <VehicleModal
        key={selectedVehicle?.id ?? "new"}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveVehicle}
        vehicle={selectedVehicle}
      />
    </div>
  );
}

export default Vehicles;
