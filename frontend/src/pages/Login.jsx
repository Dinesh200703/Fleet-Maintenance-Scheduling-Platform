import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Loader2, User } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: ""
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // ✅ Load saved email (Remember Me)
  useEffect(() => {
    const savedEmail = localStorage.getItem("saved_email");
    if (savedEmail) {
      setForm((prev) => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 🔒 Password validation
      if (isSignup && form.password.length < 6) {
        toast.error("Password must be at least 6 characters");
        setIsLoading(false);
        return;
      }

      if (isSignup) {
        // ✅ SIGNUP
        await axios.post("http://127.0.0.1:8000/auth/signup", form);

        // 🔥 AUTO LOGIN AFTER SIGNUP
        const res = await axios.post(
          "http://127.0.0.1:8000/auth/login",
          {
            email: form.email,
            password: form.password
          }
        );

        // ✅ SAVE TOKEN + USER NAME
        localStorage.setItem("token", res.data.access_token);
        localStorage.setItem("user_name", form.full_name);

        toast.success("Account created successfully!");
        navigate("/dashboard");

      } else {
        // ✅ LOGIN
        const res = await axios.post(
          "http://127.0.0.1:8000/auth/login",
          {
            email: form.email,
            password: form.password
          }
        );

        // ✅ SAVE TOKEN
        localStorage.setItem("token", res.data.access_token);

        // ✅ SAVE EMAIL (Remember Me)
        if (rememberMe) {
          localStorage.setItem("saved_email", form.email);
        } else {
          localStorage.removeItem("saved_email");
        }

        // ✅ SAVE USER NAME (fallback using email)
        localStorage.setItem("user_name", form.full_name || form.email);

        toast.success("Login successful!");
        navigate("/dashboard");
      }

    } catch (err) {
      console.error(err);

      const message =
        err.response?.data?.detail ||
        (isSignup
          ? "Signup failed. Please try again."
          : "Invalid email or password.");

      toast.error(message);

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900">

      <div className="w-full max-w-md">

        <h1 className="text-center text-3xl font-bold text-white mb-2">
          Fleet Management
        </h1>

        <p className="text-center text-slate-400 mb-6">
          {isSignup ? "Create your account" : "Login to access your dashboard"}
        </p>

        <form
          onSubmit={handleSubmit}
          className="bg-slate-950 p-8 rounded-2xl shadow-xl space-y-5"
        >

          {/* Full Name */}
          {isSignup && (
            <div>
              <label className="text-sm text-slate-300">Full Name</label>
              <div className="flex items-center gap-2 mt-2 bg-slate-900 p-3 rounded-xl">
                <User className="text-slate-500" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={form.full_name}
                  onChange={(e) =>
                    setForm({ ...form, full_name: e.target.value })
                  }
                  className="bg-transparent w-full outline-none text-white"
                  required
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="text-sm text-slate-300">Email</label>
            <div className="flex items-center gap-2 mt-2 bg-slate-900 p-3 rounded-xl">
              <Mail className="text-slate-500" />
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                className="bg-transparent w-full outline-none text-white"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-sm text-slate-300">Password</label>
            <div className="flex items-center gap-2 mt-2 bg-slate-900 p-3 rounded-xl">
              <Lock className="text-slate-500" />
              <input
                type="password"
                placeholder={isSignup ? "Create password" : "Enter password"}
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                className="bg-transparent w-full outline-none text-white"
                required
              />
            </div>
          </div>

          {/* Remember Me */}
          {!isSignup && (
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember me
            </label>
          )}

          {/* Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-sky-600 py-3 rounded-xl text-white font-semibold hover:bg-sky-700 transition"
          >
            {isLoading ? (
              <Loader2 className="animate-spin mx-auto" />
            ) : isSignup ? (
              "Create Account"
            ) : (
              "Login"
            )}
          </button>

          {/* Toggle */}
          <p className="text-center text-sm text-slate-400">
            {isSignup ? "Already have an account?" : "Don't have an account?"}

            <button
              type="button"
              onClick={() => {
                setIsSignup(!isSignup);
                setForm({ full_name: "", email: "", password: "" });
              }}
              className="ml-1 text-sky-400 hover:underline"
            >
              {isSignup ? "Login" : "Sign Up"}
            </button>
          </p>

        </form>
      </div>
    </div>
  );
}

export default Login;