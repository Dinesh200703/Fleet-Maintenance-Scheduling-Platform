import { useState } from "react";
import { X } from "lucide-react";

function MaintenanceModal({
  isOpen,
  onClose,
  onSave,
 maintenance,
}) {
  const [formData, setFormData] = useState(() => maintenance ? {
        vehicle_id: maintenance.vehicle_id,
        maintenance_type: maintenance.maintenance_type,
        scheduled_date: maintenance.scheduled_date,
        remarks: maintenance.remarks || "",
      } : {
        vehicle_id: "",
        maintenance_type: "",
        scheduled_date: "",
        remarks: "",
      });

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
      vehicle_id: Number(formData.vehicle_id),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">

      <div className="w-full max-w-2xl rounded-3xl bg-white p-8 shadow-2xl">

        <div className="mb-6 flex items-center justify-between">

          <h2 className="text-2xl font-bold text-slate-900">
            {maintenance ? "Edit Maintenance" : "Schedule Maintenance"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 hover:bg-slate-100"
          >
            <X />
          </button>

        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-5 md:grid-cols-2"
        >

          <input
            type="number"
            name="vehicle_id"
            placeholder="Vehicle ID"
            value={formData.vehicle_id}
            onChange={handleChange}
            className="rounded-xl border border-slate-300 p-3"
            required
          />

          <input
            type="text"
            name="maintenance_type"
            placeholder="Maintenance Type"
            value={formData.maintenance_type}
            onChange={handleChange}
            className="rounded-xl border border-slate-300 p-3"
            required
          />

          <input
            type="date"
            name="scheduled_date"
            value={formData.scheduled_date}
            onChange={handleChange}
            className="rounded-xl border border-slate-300 p-3"
            required
          />

          <textarea
            name="remarks"
            rows="4"
            placeholder="Remarks"
            value={formData.remarks}
            onChange={handleChange}
            className="col-span-2 rounded-xl border border-slate-300 p-3"
          />

          <div className="col-span-2 flex justify-end gap-3">

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
              Save
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default MaintenanceModal;
