import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import { getVehicles } from "../services/vehicleService";

function Vehicles() {
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      const data = await getVehicles();
      setVehicles(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <Navbar />

      <div style={{ display: "flex" }}>
        <Sidebar />

        <div
          style={{
            flex: 1,
            padding: "30px",
            background: "#f3f4f6",
            minHeight: "100vh",
          }}
        >
          <h1>Vehicle Management</h1>

          <table
            style={{
              width: "100%",
              marginTop: "30px",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr>
                <th>ID</th>
                <th>Vehicle Number</th>
                <th>Type</th>
                <th>Manufacturer</th>
                <th>Model</th>
                <th>Year</th>
                <th>Fuel</th>
              </tr>
            </thead>

            <tbody>
              {vehicles.map((vehicle) => (
                <tr key={vehicle.id}>
                  <td>{vehicle.id}</td>
                  <td>{vehicle.vehicle_number}</td>
                  <td>{vehicle.vehicle_type}</td>
                  <td>{vehicle.manufacturer}</td>
                  <td>{vehicle.model}</td>
                  <td>{vehicle.manufacture_year}</td>
                  <td>{vehicle.fuel_type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Vehicles;