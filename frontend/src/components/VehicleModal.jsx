import { useState } from "react";
import { X } from "lucide-react";

function VehicleModal({
  isOpen,
  onClose,
  onSave,
  vehicle,
}) {
  const emptyVehicle = {
    vehicle_number: "",
    vehicle_type: "",
    manufacturer: "",
    model: "",
    manufacture_year: "",
    fuel_type: "",
  };
  const [formData, setFormData] = useState(() => vehicle || emptyVehicle);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    onSave({
      ...formData,
      manufacture_year: formData.manufacture_year ? Number(formData.manufacture_year) : null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-3xl bg-white p-8 shadow-2xl">

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">
            {vehicle ? "Edit Vehicle" : "Add Vehicle"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 hover:bg-slate-100"
          >
            <X />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          <input
            name="vehicle_number"
            placeholder="Vehicle Number"
            value={formData.vehicle_number}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 p-3"
            required
          />

          <input
            name="vehicle_type"
            placeholder="Vehicle Type"
            value={formData.vehicle_type}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 p-3"
            required
          />

          <input
            name="manufacturer"
            placeholder="Manufacturer"
            value={formData.manufacturer}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 p-3"
            required
          />

          <input
            name="model"
            placeholder="Model"
            value={formData.model}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 p-3"
            required
          />

          <input
            type="number"
            name="manufacture_year"
            placeholder="Manufacture Year"
            value={formData.manufacture_year}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 p-3"
            required
          />

          <input
            name="fuel_type"
            placeholder="Fuel Type"
            value={formData.fuel_type}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 p-3"
            required
          />

          <div className="flex justify-end gap-3">

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 px-5 py-3"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Save Vehicle
            </button>

          </div>

        </form>

      </div>
    </div>
  );
}

export default VehicleModal;
