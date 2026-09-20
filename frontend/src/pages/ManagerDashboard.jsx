import { useEffect,useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function ManagerDashboard(){

const [vehicles,setVehicles]=useState([]);
const [maintenance,setMaintenance]=useState([]);

const [selectedDriver,setSelectedDriver]=useState("");
const [selectedVehicle,setSelectedVehicle]=useState("");

const [newMaintenance,setNewMaintenance]=useState({
vehicle_id:"",
maintenance_type:"",
scheduled_date:"",
remarks:""
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
const vehiclesRes=await api.get("/vehicles/");
const maintenanceRes=await api.get("/maintenance/");

setVehicles(vehiclesRes.data||[]);
setMaintenance(maintenanceRes.data||[]);
}catch(err){
if(err.response?.status===401){
localStorage.clear();
navigate("/");
}
}
};

const assignDriver=async()=>{
try{
await api.put(`/vehicles/${selectedVehicle}`,{
driver_id:parseInt(selectedDriver)
});
fetchAll();
}catch(err){
console.log(err.response?.data);
}
};

const createMaintenance=async(e)=>{
e.preventDefault();
try{
await api.post("/maintenance/",{
vehicle_id:parseInt(newMaintenance.vehicle_id),
maintenance_type:newMaintenance.maintenance_type,
scheduled_date:newMaintenance.scheduled_date,
remarks:newMaintenance.remarks||null
});
setNewMaintenance({
vehicle_id:"",
maintenance_type:"",
scheduled_date:"",
remarks:""
});
fetchAll();
}catch(err){
console.log(err.response?.data);
}
};

const logout=()=>{
localStorage.clear();
navigate("/");
};

return(
<div className="min-h-screen bg-gray-100">

<div className="bg-white shadow flex justify-between items-center px-6 py-4">
<h1 className="text-2xl font-bold text-blue-600">Manager Dashboard</h1>
<button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
Logout
</button>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
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
<h2 className="text-blue-600 font-semibold mb-4">Assign Driver</h2>
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
<input
placeholder="Vehicle ID"
value={selectedVehicle}
onChange={(e)=>setSelectedVehicle(e.target.value)}
className="p-3 border rounded-lg"
/>
<input
placeholder="Driver ID"
value={selectedDriver}
onChange={(e)=>setSelectedDriver(e.target.value)}
className="p-3 border rounded-lg"
/>
<button onClick={assignDriver} className="bg-blue-600 text-white rounded-lg">
Assign
</button>
</div>
</div>

<div className="bg-white p-6 rounded-xl shadow mb-6">
<h2 className="text-blue-600 font-semibold mb-4">Create Maintenance</h2>

<form onSubmit={createMaintenance} className="grid grid-cols-1 md:grid-cols-4 gap-4">

<input
placeholder="Vehicle ID"
value={newMaintenance.vehicle_id}
onChange={(e)=>setNewMaintenance({...newMaintenance,vehicle_id:e.target.value})}
className="p-3 border rounded-lg"
/>

<input
placeholder="Maintenance Type"
value={newMaintenance.maintenance_type}
onChange={(e)=>setNewMaintenance({...newMaintenance,maintenance_type:e.target.value})}
className="p-3 border rounded-lg"
/>

<input
type="date"
value={newMaintenance.scheduled_date}
onChange={(e)=>setNewMaintenance({...newMaintenance,scheduled_date:e.target.value})}
className="p-3 border rounded-lg"
/>

<input
placeholder="Remarks"
value={newMaintenance.remarks}
onChange={(e)=>setNewMaintenance({...newMaintenance,remarks:e.target.value})}
className="p-3 border rounded-lg"
/>

<button className="bg-green-500 text-white rounded-lg">
Create
</button>

</form>

</div>

<div className="bg-white rounded-xl shadow mb-6 overflow-hidden">
<h2 className="p-4 text-blue-600 font-semibold">Vehicles</h2>
<table className="w-full">
<thead className="bg-blue-600 text-white">
<tr>
<th className="p-3">ID</th>
<th className="p-3">Number</th>
<th className="p-3">Type</th>
<th className="p-3">Manufacturer</th>
<th className="p-3">Model</th>
</tr>
</thead>
<tbody>
{vehicles.map((v)=>(
<tr key={v.id} className="border-b hover:bg-gray-100">
<td className="p-3">{v.id}</td>
<td className="p-3">{v.vehicle_number}</td>
<td className="p-3">{v.vehicle_type}</td>
<td className="p-3">{v.manufacturer}</td>
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
<th className="p-3">Type</th>
<th className="p-3">Date</th>
<th className="p-3">Status</th>
</tr>
</thead>
<tbody>
{maintenance.map((m)=>(
<tr key={m.id} className="border-b hover:bg-gray-100">
<td className="p-3">{m.id}</td>
<td className="p-3">{m.vehicle_id}</td>
<td className="p-3">{m.maintenance_type}</td>
<td className="p-3">{m.scheduled_date}</td>
<td className="p-3">
<span className={`px-2 py-1 rounded text-white ${m.status==="completed"?"bg-green-500":"bg-yellow-500"}`}>
{m.status}
</span>
</td>
</tr>
))}
</tbody>
</table>
</div>

</div>

</div>
);
}

export default ManagerDashboard;