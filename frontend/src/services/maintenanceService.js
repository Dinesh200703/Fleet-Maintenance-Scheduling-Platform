import api from "../api/api";

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export const getMaintenance = async () => {
  const response = await api.get("/maintenance", getHeaders());
  return response.data;
};

export const addMaintenance = async (maintenance) => {
  const response = await api.post(
    "/maintenance",
    maintenance,
    getHeaders()
  );

  return response.data;
};

export const updateMaintenance = async (id, maintenance) => {
  const response = await api.put(
    `/maintenance/${id}`,
    maintenance,
    getHeaders()
  );

  return response.data;
};

export const deleteMaintenance = async (id) => {
  const response = await api.delete(
    `/maintenance/${id}`,
    getHeaders()
  );

  return response.data;
};