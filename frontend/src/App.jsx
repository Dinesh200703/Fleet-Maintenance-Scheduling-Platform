import { Routes,Route,Navigate,useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useEffect,useState } from "react";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Vehicles from "./pages/Vehicles";
import Maintenance from "./pages/Maintenance";

import AdminDashboard from "./pages/AdminDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import DriverDashboard from "./pages/DriverDashboard";

function ProtectedRoute({children,allowedRoles}){
const token=localStorage.getItem("token");
const role=localStorage.getItem("role");

if(!token){
return <Navigate to="/" replace/>;
}

if(allowedRoles && !allowedRoles.includes(role)){
return <Navigate to="/" replace/>;
}

return children;
}

function App(){

const [auth,setAuth]=useState({
token:null,
role:null
});

const location=useLocation();

useEffect(()=>{
setAuth({
token:localStorage.getItem("token"),
role:localStorage.getItem("role")
});
},[location]);

return(
<>
<Routes>

{/* LOGIN ROUTE */}
<Route
path="/"
element={
!auth.token
? <Login/>
: auth.role==="admin"
? <Navigate to="/admin" replace/>
: auth.role==="manager"
? <Navigate to="/manager" replace/>
: <Navigate to="/driver" replace/>
}
/>

{/* ROLE DASHBOARDS */}
<Route
path="/admin"
element={
<ProtectedRoute allowedRoles={["admin"]}>
<AdminDashboard/>
</ProtectedRoute>
}
/>

<Route
path="/manager"
element={
<ProtectedRoute allowedRoles={["manager"]}>
<ManagerDashboard/>
</ProtectedRoute>
}
/>

<Route
path="/driver"
element={
<ProtectedRoute allowedRoles={["driver"]}>
<DriverDashboard/>
</ProtectedRoute>
}
/>

{/* SHARED */}
<Route
path="/dashboard"
element={
<ProtectedRoute allowedRoles={["admin","manager"]}>
<Dashboard/>
</ProtectedRoute>
}
/>

<Route
path="/vehicles"
element={
<ProtectedRoute allowedRoles={["admin","manager"]}>
<Vehicles/>
</ProtectedRoute>
}
/>

<Route
path="/maintenance"
element={
<ProtectedRoute allowedRoles={["admin","manager"]}>
<Maintenance/>
</ProtectedRoute>
}
/>

{/* FALLBACK */}
<Route path="*" element={<Navigate to="/" replace/>}/>

</Routes>

<Toaster position="top-right"/>
</>
);
}

export default App;