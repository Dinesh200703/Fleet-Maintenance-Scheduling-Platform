import api from "../api/api";

// ✅ GET ALL VEHICLES
export const getVehicles = async () => {
  try {
    const res = await api.get("/vehicles/");
    return res.data;
  } catch (error) {
    console.error("GET VEHICLES ERROR:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ ADD VEHICLE
export const addVehicle = async (vehicle) => {
  try {
    const res = await api.post("/vehicles/", vehicle);
    return res.data;
  } catch (error) {
    console.error("ADD VEHICLE ERROR:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ UPDATE VEHICLE
export const updateVehicle = async (id, vehicle) => {
  try {
    const res = await api.put(`/vehicles/${id}`, vehicle);
    return res.data;
  } catch (error) {
    console.error("UPDATE VEHICLE ERROR:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ DELETE VEHICLE
export const deleteVehicle = async (id) => {
  try {
    const res = await api.delete(`/vehicles/${id}`);
    return res.data;
  } catch (error) {
    console.error("DELETE VEHICLE ERROR:", error.response?.data || error.message);
    throw error;
  }
};