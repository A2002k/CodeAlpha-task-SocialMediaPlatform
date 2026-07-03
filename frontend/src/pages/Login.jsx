import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import "../css/auth.css";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const login = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/auth/login", form);

      sessionStorage.setItem("token", res.data.token);
      sessionStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/home");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-hero">
        <div className="hero-content">
          <h1>◎ SocialSphere</h1>
          <h2>Connect. Share. Inspire.</h2>
          <p>
            Share your moments, follow friends, discover creators,
            and build your own digital community.
          </p>

          <div className="hero-features">
            <span>📷 Share Photos</span>
            <span>❤️ Like & Comment</span>
            <span>👥 Follow Friends</span>
            <span>🌎 Discover People</span>
          </div>
        </div>
      </div>

      <div className="auth-container">
        <div className="auth-card">
          <h1>Welcome Back</h1>
          <p>Login to continue your journey.</p>

          <form onSubmit={login}>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
            />

            <button type="submit">Login</button>
          </form>

          <span>
            Don’t have an account? <Link to="/register">Register</Link>
          </span>
        </div>
      </div>
    </div>
  );
}

export default Login;