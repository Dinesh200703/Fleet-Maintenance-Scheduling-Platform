import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Loader2, User } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/api";

function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState(() => ({ full_name: "", email: localStorage.getItem("saved_email") || "", password: "", role: "driver" }));
  const [rememberMe, setRememberMe] = useState(() => Boolean(localStorage.getItem("saved_email")));
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      if (isSignup) {
        if (form.password.length < 8) throw new Error("Password must be at least 8 characters");
        await api.post("/auth/signup", { full_name: form.full_name, email: form.email, password: form.password, role: form.role });
      }
      const { data } = await api.post("/auth/login", { email: form.email, password: form.password });
      const user = data.user;
      const role = String(user?.role || "").trim().toLowerCase();
      if (!data.access_token || !role || !user?.id) throw new Error("The server returned an invalid login response");
      const dashboardByRole = { driver: "/driver", manager: "/manager", admin: "/admin" };
      const dashboard = dashboardByRole[role];
      if (!dashboard) throw new Error("The server returned an unsupported account role");
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("role", role);
      localStorage.setItem("user_id", String(user.id));
      localStorage.setItem("driver_id", String(user.id));
      localStorage.setItem("user_name", user.full_name);
      if (rememberMe) localStorage.setItem("saved_email", form.email);
      else localStorage.removeItem("saved_email");
      toast.success(isSignup ? "Account created successfully" : "Login successful");
      navigate(dashboard, { replace: true });
    } catch (error) {
      const detail = error.response?.data?.detail;
      toast.error(Array.isArray(detail) ? detail.map((item) => item.msg).join("; ") : detail || error.message || "Unable to sign in");
    } finally { setIsLoading(false); }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-black via-slate-900 to-black">
      <div className="w-full max-w-md"><div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
        <h1 className="mb-2 text-center text-4xl font-bold text-white">Fleet<span className="text-sky-400">AI</span></h1>
        <p className="mb-8 text-center text-slate-400">{isSignup ? "Create your account" : "Welcome back"}</p>
        <form onSubmit={handleSubmit} className="space-y-5">
          {isSignup && <div className="relative"><User className="absolute left-3 top-3 text-slate-400"/><input required maxLength={100} placeholder="Full Name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="w-full rounded-xl bg-slate-800 py-3 pl-10 pr-3 text-white"/></div>}
          {isSignup && <label className="block text-sm text-slate-300">Account role<select required value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="mt-1 w-full rounded-xl bg-slate-800 p-3 text-white"><option value="driver">Driver</option><option value="manager">Manager</option><option value="admin">Admin</option></select></label>}
          <div className="relative"><Mail className="absolute left-3 top-3 text-slate-400"/><input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-xl bg-slate-800 py-3 pl-10 pr-3 text-white"/></div>
          <div className="relative"><Lock className="absolute left-3 top-3 text-slate-400"/><input required type="password" minLength={isSignup ? 8 : undefined} placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full rounded-xl bg-slate-800 py-3 pl-10 pr-3 text-white"/></div>
          {!isSignup && <label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}/>Remember me</label>}
          <button disabled={isLoading} className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 py-3 font-semibold text-white">{isLoading ? <Loader2 className="mx-auto animate-spin"/> : isSignup ? "Create Account" : "Login"}</button>
          <p className="text-center text-sm text-slate-400">{isSignup ? "Already have an account?" : "Need an account?"}<button type="button" onClick={() => setIsSignup(!isSignup)} className="ml-1 text-sky-400 hover:underline">{isSignup ? "Login" : "Sign Up"}</button></p>
        </form>
      </div></div>
    </div>
  );
}
export default Login;
