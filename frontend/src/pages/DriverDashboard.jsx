import { useEffect,useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function DriverDashboard(){

const [vehicles,setVehicles]=useState([]);
const [tasks,setTasks]=useState([]);

const navigate=useNavigate();
const token=localStorage.getItem("token");
const driverId=localStorage.getItem("driver_id");

const api=axios.create({
baseURL:"http://127.0.0.1:8000",
headers:{Authorization:`Bearer ${token}`}
});

useEffect(()=>{
if(!driverId){
const newId=Math.floor(1000+Math.random()*9000);
localStorage.setItem("driver_id",newId);
}
fetchData();
},[]);

const fetchData=async()=>{
try{
const vehicleRes=await api.get(`/vehicles/?driver_id=${driverId}`);
const taskRes=await api.get(`/tasks/?driver_id=${driverId}`);

setVehicles(vehicleRes.data||[]);
setTasks(taskRes.data||[]);
}catch(err){
if(err.response?.status===401){
localStorage.clear();
navigate("/");
}
}
};

const updateTask=async(id,status)=>{
try{
await api.put(`/tasks/${id}`,{status});
fetchData();
}catch(err){}
};

const logout=()=>{
localStorage.clear();
navigate("/");
};

return(
<div className="min-h-screen bg-gray-100">

<div className="bg-white shadow flex justify-between items-center px-6 py-4">
<div>
<h1 className="text-2xl font-bold text-blue-600">Driver Dashboard</h1>
<p className="text-sm text-gray-500">Driver ID: {localStorage.getItem("driver_id")}</p>
</div>
<button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
Logout
</button>
</div>

<div className="p-6">

<div className="mb-6">
<h2 className="text-lg font-semibold text-blue-600 mb-4">Assigned Vehicles</h2>

<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
{vehicles.map((v)=>(
<div key={v.id} className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition">
<p className="text-gray-500">Vehicle ID: <span className="text-black">{v.id}</span></p>
<p className="text-gray-500">Number: <span className="text-black">{v.vehicle_number}</span></p>
<p className="text-gray-500">Type: <span className="text-black">{v.vehicle_type}</span></p>
<p className="text-gray-500">Status: <span className="text-black">{v.status}</span></p>
</div>
))}
</div>

</div>

<div className="bg-white rounded-xl shadow overflow-hidden">
<h2 className="p-4 text-blue-600 font-semibold">Tasks</h2>

<table className="w-full">

<thead className="bg-blue-600 text-white">
<tr>
<th className="p-3">ID</th>
<th className="p-3">Description</th>
<th className="p-3">Status</th>
<th className="p-3">Action</th>
</tr>
</thead>

<tbody>
{tasks.map((t)=>(
<tr key={t.id} className="border-b hover:bg-gray-100">
<td className="p-3">{t.id}</td>
<td className="p-3">{t.description}</td>
<td className="p-3">
<span className={`px-2 py-1 rounded text-white ${t.status==="completed"?"bg-green-500":"bg-yellow-500"}`}>
{t.status}
</span>
</td>
<td className="p-3">
<button onClick={()=>updateTask(t.id,"completed")} className="bg-green-500 text-white px-3 py-1 rounded mr-2 hover:bg-green-600">
Done
</button>
<button onClick={()=>updateTask(t.id,"pending")} className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600">
Pending
</button>
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

export default DriverDashboard;