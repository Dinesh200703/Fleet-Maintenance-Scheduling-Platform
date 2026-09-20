import { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail,Lock,Loader2,User } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

function Login(){
const [isSignup,setIsSignup]=useState(false);
const [form,setForm]=useState({
full_name:"",
email:"",
password:"",
role:"driver"
});
const [rememberMe,setRememberMe]=useState(false);
const [isLoading,setIsLoading]=useState(false);

const navigate=useNavigate();

useEffect(()=>{
const savedEmail=localStorage.getItem("saved_email");
if(savedEmail){
setForm((prev)=>({...prev,email:savedEmail}));
setRememberMe(true);
}
},[]);

const handleSubmit=async(e)=>{
e.preventDefault();
setIsLoading(true);

try{

if(isSignup && form.password.length<6){
toast.error("Password must be at least 6 characters");
setIsLoading(false);
return;
}

let res;

if(isSignup){

await axios.post("http://127.0.0.1:8000/auth/signup",{
full_name:form.full_name,
email:form.email,
password:form.password,
role:form.role
});

res=await axios.post("http://127.0.0.1:8000/auth/login",{
email:form.email,
password:form.password
});

}else{

res=await axios.post("http://127.0.0.1:8000/auth/login",{
email:form.email,
password:form.password
});

}

if(!res.data.role){
toast.error("Backend role missing");
localStorage.clear();
setIsLoading(false);
return;
}

localStorage.setItem("token",res.data.access_token);
localStorage.setItem("role",res.data.role);

if(rememberMe){
localStorage.setItem("saved_email",form.email);
}else{
localStorage.removeItem("saved_email");
}

localStorage.setItem("user_name",form.full_name||form.email);

toast.success(isSignup?"Account created successfully!":"Login successful!");

const role=res.data.role;

if(role==="admin"){
navigate("/admin");
}else if(role==="manager"){
navigate("/manager");
}else if(role==="driver"){
navigate("/driver");
}else{
toast.error("Invalid role received");
localStorage.clear();
}

}catch(err){

const message=
err.response?.data?.detail||
(isSignup?"Signup failed. Please try again.":"Invalid email or password.");

toast.error(message);

}finally{
setIsLoading(false);
}
};

return(
<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-black via-slate-900 to-black">

<div className="w-full max-w-md">

<div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">

<h1 className="text-center text-4xl font-bold text-white mb-2">
Fleet<span className="text-sky-400">AI</span>
</h1>

<p className="text-center text-slate-400 mb-8">
{isSignup?"Create your account":"Welcome back"}
</p>

<form onSubmit={handleSubmit} className="space-y-5">

{isSignup && (
<div className="relative">
<User className="absolute left-3 top-3 text-slate-400"/>
<input
type="text"
placeholder="Full Name"
value={form.full_name}
onChange={(e)=>setForm({...form,full_name:e.target.value})}
className="w-full pl-10 pr-3 py-3 rounded-xl bg-slate-800 text-white outline-none focus:ring-2 focus:ring-sky-500"
/>
</div>
)}

<div className="relative">
<Mail className="absolute left-3 top-3 text-slate-400"/>
<input
type="email"
placeholder="Email"
value={form.email}
onChange={(e)=>setForm({...form,email:e.target.value})}
className="w-full pl-10 pr-3 py-3 rounded-xl bg-slate-800 text-white outline-none focus:ring-2 focus:ring-sky-500"
/>
</div>

<div className="relative">
<Lock className="absolute left-3 top-3 text-slate-400"/>
<input
type="password"
placeholder="Password"
value={form.password}
onChange={(e)=>setForm({...form,password:e.target.value})}
className="w-full pl-10 pr-3 py-3 rounded-xl bg-slate-800 text-white outline-none focus:ring-2 focus:ring-sky-500"
/>
</div>

{isSignup && (
<div>
<select
value={form.role}
onChange={(e)=>setForm({...form,role:e.target.value})}
className="w-full p-3 rounded-xl bg-slate-800 text-white outline-none focus:ring-2 focus:ring-sky-500"
>
<option value="driver">Driver</option>
<option value="manager">Manager</option>
<option value="admin">Admin</option>
</select>
</div>
)}

{!isSignup && (
<label className="flex items-center gap-2 text-sm text-slate-300">
<input
type="checkbox"
checked={rememberMe}
onChange={(e)=>setRememberMe(e.target.checked)}
/>
Remember me
</label>
)}

<button
type="submit"
disabled={isLoading}
className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold hover:opacity-90 transition"
>
{isLoading?<Loader2 className="animate-spin mx-auto"/>:isSignup?"Sign Up":"Login"}
</button>

<p className="text-center text-sm text-slate-400">
{isSignup?"Already have an account?":"Don't have an account?"}
<button
type="button"
onClick={()=>{
setIsSignup(!isSignup);
setForm({full_name:"",email:"",password:"",role:"driver"});
}}
className="ml-1 text-sky-400 hover:underline"
>
{isSignup?"Login":"Sign Up"}
</button>
</p>

</form>

</div>

</div>

</div>
);
}

export default Login;