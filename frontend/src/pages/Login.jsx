import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { loginUser } from "../services/authService";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const data = await loginUser(email, password);

      localStorage.setItem("token", data.access_token);

      alert("Login Successful!");

      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      alert("Invalid Email or Password");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto" }}>
      <h2>Fleet Maintenance Login</h2>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "10px",
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "10px",
          }}
        />

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "10px",
          }}
        >
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;