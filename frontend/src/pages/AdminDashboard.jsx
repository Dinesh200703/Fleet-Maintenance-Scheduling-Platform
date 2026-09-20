import { useEffect,useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AdminDashboard(){

const [users,setUsers]=useState([]);
const [vehicles,setVehicles]=useState([]);
const [maintenance,setMaintenance]=useState([]);

const [newVehicle,setNewVehicle]=useState({
vehicle_number:"",
vehicle_type:"",
manufacturer:"",
model:"",
manufacture_year:"",
fuel_type:""
});

const navigate=useNavigate();
const token=localStorage.getItem("token");

const api=axios.create({
baseURL:"http://127.0.0.1:8000",
headers:{Authorization:`Bearer ${token}`}
});

useEffect(()=>{
fetchAll();
},[]);

const fetchAll=async()=>{
try{
const usersRes=await api.get("/users/");
const vehiclesRes=await api.get("/vehicles/");
const maintenanceRes=await api.get("/maintenance/");

setUsers(usersRes.data||[]);
setVehicles(vehiclesRes.data||[]);
setMaintenance(maintenanceRes.data||[]);
}catch(err){
if(err.response?.status===401){
localStorage.clear();
navigate("/");
}
}
};

const addVehicle=async(e)=>{
e.preventDefault();
try{
await api.post("/vehicles/",{
vehicle_number:newVehicle.vehicle_number,
vehicle_type:newVehicle.vehicle_type,
manufacturer:newVehicle.manufacturer,
model:newVehicle.model,
manufacture_year:Number(newVehicle.manufacture_year),
fuel_type:newVehicle.fuel_type
});
setNewVehicle({
vehicle_number:"",
vehicle_type:"",
manufacturer:"",
model:"",
manufacture_year:"",
fuel_type:""
});
fetchAll();
}catch(err){}
};

const deleteUser=async(id)=>{
try{
await api.delete(`/users/${id}`);
fetchAll();
}catch(err){}
};

const logout=()=>{
localStorage.clear();
navigate("/");
};

return(
<div className="min-h-screen bg-gray-100">

<div className="bg-white shadow flex justify-between items-center px-6 py-4">
<h1 className="text-2xl font-bold text-blue-600">Admin Dashboard</h1>
<button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
Logout
</button>
</div>

<div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
<div className="bg-white p-6 rounded-xl shadow">
<p className="text-gray-500">Users</p>
<h2 className="text-3xl font-bold text-blue-600">{users.length}</h2>
</div>
<div className="bg-white p-6 rounded-xl shadow">
<p className="text-gray-500">Vehicles</p>
<h2 className="text-3xl font-bold text-blue-600">{vehicles.length}</h2>
</div>
<div className="bg-white p-6 rounded-xl shadow">
<p className="text-gray-500">Maintenance</p>
<h2 className="text-3xl font-bold text-blue-600">{maintenance.length}</h2>
</div>
</div>

<div className="p-6">

<div className="bg-white p-6 rounded-xl shadow mb-6">
<h2 className="text-lg font-semibold text-blue-600 mb-4">Add Vehicle</h2>
<form onSubmit={addVehicle} className="grid grid-cols-1 md:grid-cols-3 gap-4">

<input value={newVehicle.vehicle_number} onChange={(e)=>setNewVehicle({...newVehicle,vehicle_number:e.target.value})} placeholder="Vehicle Number" className="p-3 border rounded-lg"/>

<input value={newVehicle.vehicle_type} onChange={(e)=>setNewVehicle({...newVehicle,vehicle_type:e.target.value})} placeholder="Vehicle Type" className="p-3 border rounded-lg"/>

<input value={newVehicle.manufacturer} onChange={(e)=>setNewVehicle({...newVehicle,manufacturer:e.target.value})} placeholder="Manufacturer" className="p-3 border rounded-lg"/>

<input value={newVehicle.model} onChange={(e)=>setNewVehicle({...newVehicle,model:e.target.value})} placeholder="Model" className="p-3 border rounded-lg"/>

<input value={newVehicle.manufacture_year} onChange={(e)=>setNewVehicle({...newVehicle,manufacture_year:e.target.value})} placeholder="Year" className="p-3 border rounded-lg"/>

<input value={newVehicle.fuel_type} onChange={(e)=>setNewVehicle({...newVehicle,fuel_type:e.target.value})} placeholder="Fuel Type" className="p-3 border rounded-lg"/>

<button className="bg-blue-600 text-white rounded-lg col-span-full py-2">Add Vehicle</button>

</form>
</div>

<div className="bg-white rounded-xl shadow mb-6 overflow-hidden">
<h2 className="p-4 text-blue-600 font-semibold">Users</h2>
<table className="w-full">
<thead className="bg-blue-600 text-white">
<tr>
<th className="p-3">ID</th>
<th className="p-3">Name</th>
<th className="p-3">Email</th>
<th className="p-3">Role</th>
<th className="p-3">Action</th>
</tr>
</thead>
<tbody>
{users.map((u)=>(
<tr key={u.id} className="border-b hover:bg-gray-100">
<td className="p-3">{u.id}</td>
<td className="p-3">{u.full_name}</td>
<td className="p-3">{u.email}</td>
<td className="p-3">{u.role}</td>
<td className="p-3">
<button onClick={()=>deleteUser(u.id)} className="bg-red-500 text-white px-3 py-1 rounded">
Delete
</button>
</td>
</tr>
))}
</tbody>
</table>
</div>

<div className="bg-white rounded-xl shadow mb-6 overflow-hidden">
<h2 className="p-4 text-blue-600 font-semibold">Vehicles</h2>
<table className="w-full">
<thead className="bg-blue-600 text-white">
<tr>
<th className="p-3">ID</th>
<th className="p-3">Number</th>
<th className="p-3">Type</th>
<th className="p-3">Model</th>
</tr>
</thead>
<tbody>
{vehicles.map((v)=>(
<tr key={v.id} className="border-b hover:bg-gray-100">
<td className="p-3">{v.id}</td>
<td className="p-3">{v.vehicle_number}</td>
<td className="p-3">{v.vehicle_type}</td>
<td className="p-3">{v.model}</td>
</tr>
))}
</tbody>
</table>
</div>

<div className="bg-white rounded-xl shadow overflow-hidden">
<h2 className="p-4 text-blue-600 font-semibold">Maintenance</h2>
<table className="w-full">
<thead className="bg-blue-600 text-white">
<tr>
<th className="p-3">ID</th>
<th className="p-3">Vehicle</th>
<th className="p-3">Status</th>
</tr>
</thead>
<tbody>
{maintenance.map((m)=>(
<tr key={m.id} className="border-b hover:bg-gray-100">
<td className="p-3">{m.id}</td>
<td className="p-3">{m.vehicle_id}</td>
<td className="p-3">{m.status}</td>
</tr>
))}
</tbody>
</table>
</div>

</div>

</div>
);
}

export default AdminDashboard;