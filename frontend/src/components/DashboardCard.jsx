function DashboardCard({
  title,
  value,
  icon,
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          {icon}
        </div>

        <p className="text-sm font-semibold text-slate-600">
          {title}
        </p>
      </div>

      <h2 className="mt-6 text-5xl font-black text-slate-900">
        {value ?? 0}
      </h2>
    </div>
  );
}

export default DashboardCard;