import api from "../api/api";

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export const getVehicles = async () => {
  const response = await api.get("/vehicles", getHeaders());
  return response.data;
};

export const addVehicle = async (vehicle) => {
  const response = await api.post("/vehicles", vehicle, getHeaders());
  return response.data;
};

export const updateVehicle = async (id, vehicle) => {
  const response = await api.put(`/vehicles/${id}`, vehicle, getHeaders());
  return response.data;
};

export const deleteVehicle = async (id) => {
  const response = await api.delete(`/vehicles/${id}`, getHeaders());
  return response.data;
};