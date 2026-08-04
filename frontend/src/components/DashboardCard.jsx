function DashboardCard({ title, value }) {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "12px",
        padding: "20px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        textAlign: "center",
      }}
    >
      <h3>{title}</h3>

      <h1
        style={{
          color: "#2563eb",
          marginTop: "10px",
        }}
      >
        {value}
      </h1>
    </div>
  );
}

export default DashboardCard;