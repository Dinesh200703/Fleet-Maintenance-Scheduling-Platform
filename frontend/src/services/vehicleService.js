import api from "../api/api";

export const getVehicles = async () => {
  const token = localStorage.getItem("token");

  const response = await api.get("/vehicles", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};