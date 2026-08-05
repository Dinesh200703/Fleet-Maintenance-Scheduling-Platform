import { Pencil, Trash2 } from "lucide-react";

function MaintenanceTable({
  maintenance,
  loading,
  onEdit,
  onDelete,
}) {
  if (loading) {
    return (
      <div className="rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-sm">
        <h3 className="text-lg font-semibold text-slate-700">
          Loading maintenance records...
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
              <th className="px-6 py-4 text-left">Vehicle ID</th>
              <th className="px-6 py-4 text-left">Maintenance Type</th>
              <th className="px-6 py-4 text-left">Scheduled Date</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-left">Remarks</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>

          </thead>

          <tbody>

            {maintenance.length === 0 ? (

              <tr>

                <td
                  colSpan="6"
                  className="py-10 text-center text-slate-500"
                >
                  No maintenance records found.
                </td>

              </tr>

            ) : (

              maintenance.map((item) => (

                <tr
                  key={item.id}
                  className="border-b border-slate-100 hover:bg-slate-50 transition"
                >

                  <td className="px-6 py-4 font-semibold">
                    {item.vehicle_id}
                  </td>

                  <td className="px-6 py-4">
                    {item.maintenance_type}
                  </td>

                  <td className="px-6 py-4">
                    {item.scheduled_date}
                  </td>

                  <td className="px-6 py-4 text-center">

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        item.status === "Completed"
                          ? "bg-green-100 text-green-700"
                          : item.status === "Scheduled"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.status}
                    </span>

                  </td>

                  <td className="px-6 py-4">
                    {item.remarks || "-"}
                  </td>

                  <td className="px-6 py-4">

                    <div className="flex justify-center gap-2">

                      <button
                        onClick={() => onEdit(item)}
                        className="rounded-xl bg-blue-600 p-2 text-white hover:bg-blue-700"
                      >
                        <Pencil size={18} />
                      </button>

                      <button
                        onClick={() => onDelete(item.id)}
                        className="rounded-xl bg-red-600 p-2 text-white hover:bg-red-700"
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

        <button className="rounded-xl border border-slate-300 px-4 py-2 hover:bg-white">
          Previous
        </button>

        <span className="text-sm text-slate-600">
          Page 1 of 1
        </span>

        <button className="rounded-xl border border-slate-300 px-4 py-2 hover:bg-white">
          Next
        </button>

      </div>

    </div>
  );
}

export default MaintenanceTable;