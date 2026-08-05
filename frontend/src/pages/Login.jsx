import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import { loginUser } from "../services/authService";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = await loginUser(email, password);
      localStorage.setItem("token", data.access_token);
      toast.success("Login successful. Redirecting...");
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error("Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-6xl items-center justify-center px-4">
        <div className="w-full rounded-[2rem] border border-slate-200/70 bg-white/90 p-8 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur-xl transition sm:p-10">
          <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.32em] text-sky-600">Fleet Management</p>
              <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-black sm:text-5xl">
                Login to access your dashboard
              </h1>
              <p className="max-w-lg text-sm leading-7 text-slate-600 sm:text-base">
                Manage vehicles, schedule maintenance, and monitor fleet performance from one polished admin portal.
              </p>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-slate-950/95 p-8 text-slate-50 shadow-xl shadow-slate-950/10 sm:p-10">
              <div className="mb-8 space-y-2">
                <p className="text-sm uppercase tracking-[0.24em] text-sky-400">Welcome back</p>
                <h2 className="text-2xl font-semibold text-white">Sign in to continue</h2>
                <p className="text-sm text-slate-400">Secure access to the fleet operations dashboard.</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <label className="block text-sm text-slate-300">
                  <span className="font-medium text-slate-300">Email</span>
                  <div className="mt-3 flex items-center gap-3 rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20">
                    <Mail className="h-5 w-5 text-slate-500" />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
                      required
                    />
                  </div>
                </label>

                <label className="block text-sm text-slate-300">
                  <span className="font-medium text-slate-300">Password</span>
                  <div className="mt-3 flex items-center gap-3 rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20">
                    <Lock className="h-5 w-5 text-slate-500" />
                    <input
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
                      required
                    />
                  </div>
                </label>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <label className="inline-flex items-center gap-2 text-sm text-slate-300">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-sky-500 focus:ring-sky-500"
                    />
                    Remember me
                  </label>
                  <button type="button" className="text-sm text-slate-400 transition hover:text-white">
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {isLoading ? "Signing in..." : "Login"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;