import { useState, useEffect } from "react";
import { X } from "lucide-react";

function VehicleForm({ isOpen, onClose, onSubmit, editingVehicle }) {
  const [formData, setFormData] = useState({
    vehicle_number: "",
    vehicle_type: "",
    manufacturer: "",
    model: "",
    manufacture_year: "",
    fuel_type: "",
  });

  useEffect(() => {
    if (!isOpen) return;

    if (editingVehicle) {
      setFormData({
        vehicle_number: editingVehicle.vehicle_number || "",
        vehicle_type: editingVehicle.vehicle_type || "",
        manufacturer: editingVehicle.manufacturer || "",
        model: editingVehicle.model || "",
        manufacture_year: editingVehicle.manufacture_year || "",
        fuel_type: editingVehicle.fuel_type || "",
      });
    } else {
      setFormData({
        vehicle_number: "",
        vehicle_type: "",
        manufacturer: "",
        model: "",
        manufacture_year: "",
        fuel_type: "",
      });
    }
  }, [editingVehicle, isOpen]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    onSubmit({
      ...formData,
      manufacture_year: Number(formData.manufacture_year),
    });
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div className="w-full max-w-2xl rounded-[2rem] bg-white p-6 shadow-2xl ring-1 ring-slate-200">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-600">
              {editingVehicle ? "Edit vehicle" : "New vehicle"}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">
              {editingVehicle ? "Update vehicle details" : "Add a fleet vehicle"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-3xl border border-slate-200 bg-slate-100 text-slate-600 transition hover:bg-slate-200"
            aria-label="Close vehicle form"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Vehicle Number</span>
              <input
                name="vehicle_number"
                placeholder="1234-ABC"
                value={formData.vehicle_number}
                onChange={handleChange}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Vehicle Type</span>
              <input
                name="vehicle_type"
                placeholder="Truck, Van, Sedan"
                value={formData.vehicle_type}
                onChange={handleChange}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Manufacturer</span>
              <input
                name="manufacturer"
                placeholder="Toyota, Ford, Tesla"
                value={formData.manufacturer}
                onChange={handleChange}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Model</span>
              <input
                name="model"
                placeholder="F-150, Camry, Model Y"
                value={formData.model}
                onChange={handleChange}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Manufacture Year</span>
              <input
                type="number"
                name="manufacture_year"
                placeholder="2024"
                value={formData.manufacture_year}
                onChange={handleChange}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Fuel Type</span>
              <input
                name="fuel_type"
                placeholder="Gasoline, Diesel, Electric"
                value={formData.fuel_type}
                onChange={handleChange}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                required
              />
            </label>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex justify-center rounded-3xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex justify-center rounded-3xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
            >
              {editingVehicle ? "Update vehicle" : "Create vehicle"}
            </button>
          </div>
        </form>
  </div>
</div>
  );
}

export default VehicleForm;