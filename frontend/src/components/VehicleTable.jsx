import { Pencil, Trash2 } from "lucide-react";

function VehicleTable({
  vehicles,
  loading,
  onEdit,
  onDelete,
}) {
  if (loading) {
    return (
      <div className="rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-sm">
        <h3 className="text-lg font-semibold text-slate-700">
          Loading vehicles...
        </h3>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-900 text-white">
            <tr>
              <th className="px-6 py-4 text-left">Vehicle No</th>
              <th className="px-6 py-4 text-left">Type</th>
              <th className="px-6 py-4 text-left">Manufacturer</th>
              <th className="px-6 py-4 text-left">Model</th>
              <th className="px-6 py-4 text-left">Year</th>
              <th className="px-6 py-4 text-left">Fuel</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {vehicles.length === 0 ? (
              <tr>
                <td
                  colSpan="8"
                  className="py-10 text-center text-slate-500"
                >
                  No vehicles found.
                </td>
              </tr>
            ) : (
              vehicles.map((vehicle) => (
                <tr
                  key={vehicle.id}
                  className="border-b border-slate-100 hover:bg-slate-50 transition"
                >
                  <td className="px-6 py-4 font-semibold text-slate-800">
                    {vehicle.vehicle_number}
                  </td>

                  <td className="px-6 py-4">
                    {vehicle.vehicle_type}
                  </td>

                  <td className="px-6 py-4">
                    {vehicle.manufacturer}
                  </td>

                  <td className="px-6 py-4">
                    {vehicle.model}
                  </td>

                  <td className="px-6 py-4">
                    {vehicle.manufacture_year}
                  </td>

                  <td className="px-6 py-4">
                    {vehicle.fuel_type}
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                      Available
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() =>
                          onEdit && onEdit(vehicle)
                        }
                        className="rounded-xl bg-blue-600 p-2 text-white transition hover:bg-blue-700"
                      >
                        <Pencil size={18} />
                      </button>

                      <button
                        onClick={() =>
                          onDelete && onDelete(vehicle.id)
                        }
                        className="rounded-xl bg-red-600 p-2 text-white transition hover:bg-red-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
        <button className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-white">
          Previous
        </button>

        <span className="text-sm text-slate-600">
          Page 1 of 1
        </span>

        <button className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-white">
          Next
        </button>
      </div>
    </div>
  );
}

export default VehicleTable;