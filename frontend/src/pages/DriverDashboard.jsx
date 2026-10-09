import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/api";

function DriverDashboard() {
  const [summary,setSummary]=useState(null);const [assignments,setAssignments]=useState([]);const [vehicles,setVehicles]=useState([]);const [busy,setBusy]=useState(null);const navigate=useNavigate();
  const fetchData=useCallback(async()=>{const [stats,work,fleet]=await Promise.all([api.get("/dashboard/driver"),api.get("/maintenance/mine"),api.get("/vehicles/")]);setSummary(stats.data);setAssignments(work.data);setVehicles(fleet.data);},[]);
  // Load remote data on entry and refresh it to show manager/admin updates.
  useEffect(()=>{
    if(!localStorage.getItem("token")){navigate("/",{replace:true});return;}
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData().catch(()=>toast.error("Could not load driver dashboard"));
    const refreshTimer=window.setInterval(()=>fetchData().catch(()=>{}),30000);
    return ()=>window.clearInterval(refreshTimer);
  },[fetchData,navigate]);
  const logout=()=>{["token","role","driver_id","user_id","user_name"].forEach((key)=>localStorage.removeItem(key));navigate("/",{replace:true});};
  const act=async(id,path,body,onSaved)=>{setBusy(id);try{await api.post(`/maintenance/${id}/${path}`,body);onSaved?.();toast.success(path==="response"?"Assignment response saved":path==="complete"?"Completion submitted for admin review":"Updated");}catch(error){toast.error(error.response?.data?.detail||"Action failed");setBusy(null);return;}try{await fetchData();}catch{toast.error("Your update was saved, but dashboard data could not refresh.");}finally{setBusy(null);}};
  const activity=summary?.activity||[];const max=Math.max(1,...activity.map((a)=>a.count));
  return <main className="min-h-screen bg-gray-100"><header className="flex items-center justify-between bg-white px-6 py-4 shadow"><div><h1 className="text-2xl font-bold text-blue-600">Driver Dashboard</h1><p className="text-sm text-gray-500">{summary?.profile?.full_name} · Driver ID: {summary?.profile?.id}</p></div><button onClick={logout} className="rounded-lg bg-red-500 px-4 py-2 text-white">Logout</button></header>
    <section className="grid grid-cols-2 gap-4 p-6 md:grid-cols-6">{[["Assigned",summary?.total_assigned],["Accepted",summary?.accepted],["Declined",summary?.declined],["Completed",summary?.completed],["Pending",summary?.pending],["Completion rate",`${summary?.completion_rate??0}%`]].map(([label,value])=><article key={label} className="rounded-xl bg-white p-5 shadow"><p className="text-gray-500">{label}</p><strong className="text-2xl text-blue-600">{value??0}</strong></article>)}</section>
    <section className="grid gap-5 px-6 lg:grid-cols-2"><article className="rounded-xl bg-white p-5 shadow"><h2 className="mb-3 text-xl font-semibold">Maintenance assignments</h2>{assignments.length===0?<p className="text-gray-500">No assignments yet.</p>:<div className="grid gap-4">{assignments.map((item)=><article key={item.id} className="rounded border p-4"><h3 className="font-semibold">{item.maintenance_type} · {item.status}</h3><p>Scheduled {item.scheduled_date} · {item.vehicle?.vehicle_number||`Vehicle #${item.vehicle_id}`} {item.vehicle?.vehicle_type?`· ${item.vehicle.vehicle_type} ${item.vehicle.model}`:""}</p><p>Response: {item.assignment_response}</p><p>{item.remarks||"No instructions provided"}</p>{item.completion_remarks&&<p>Driver report: {item.completion_remarks}</p>}{item.verification_remarks&&<p>Admin remarks: {item.verification_remarks}</p>}
      {item.assignment_response==="Pending"&&<div className="mt-3 flex gap-2"><button disabled={busy===item.id} onClick={()=>act(item.id,"response",{response:"Accepted"})} className="rounded bg-green-600 px-3 py-2 text-white">Accept</button><button disabled={busy===item.id} onClick={()=>act(item.id,"response",{response:"Declined"})} className="rounded bg-red-600 px-3 py-2 text-white">Decline</button></div>}
      {item.assignment_response==="Accepted"&&item.status==="Scheduled"&&<button disabled={busy===item.id} onClick={()=>act(item.id,"start",{})} className="mt-3 rounded bg-indigo-600 px-3 py-2 text-white">Start work</button>}
      {item.assignment_response==="Accepted"&&["InProgress","NeedsRework"].includes(item.status)&&<form className="mt-3 flex gap-2" onSubmit={(e)=>{e.preventDefault();const form=e.currentTarget;act(item.id,"complete",{remarks:form.elements.remarks.value},()=>form.reset());}}><input name="remarks" required placeholder="Work completed / findings" className="min-w-0 flex-1 rounded border p-2"/><button type="submit" disabled={busy===item.id} className="rounded bg-blue-600 px-3 py-2 text-white">Submit completion</button></form>}
    </article>)}</div>}</article><article className="rounded-xl bg-white p-5 shadow"><h2 className="mb-3 text-xl font-semibold">Activity over time</h2>{activity.length===0?<p className="text-gray-500">No activity data yet.</p>:activity.map((a)=><div key={a.date} className="mb-2"><div className="flex justify-between text-sm"><span>{a.date}</span><span>{a.count} task(s)</span></div><div className="h-3 rounded bg-gray-100"><div className="h-3 rounded bg-sky-600" style={{width:`${a.count*100/max}%`}}/></div></div>)}</article></section>
    <section className="p-6"><h2 className="mb-3 text-xl font-semibold">Assigned vehicles</h2><div className="flex flex-wrap gap-3">{vehicles.length===0?<p className="text-gray-500">No vehicles assigned.</p>:vehicles.map((v)=><p key={v.id} className="rounded-lg bg-white p-4 shadow">{v.vehicle_number} · {v.vehicle_type} · {v.status}</p>)}</div></section>
  </main>;
}
export default DriverDashboard;
