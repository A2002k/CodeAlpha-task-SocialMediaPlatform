import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import "../css/auth.css";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const register = async (e) => {
    e.preventDefault();

    try {
      await API.post("/auth/register", form);

      alert("Account created successfully 🎉");
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Register failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-hero">
        <div className="hero-content">
          <h1>◎ SocialSphere</h1>
          <h2>Your people are waiting.</h2>
          <p>
            Create your profile, post your favorite moments,
            and connect with people around the world.
          </p>

          <div className="hero-features">
            <span>✨ Build Your Profile</span>
            <span>📸 Upload Posts</span>
            <span>💬 Join Conversations</span>
            <span>🚀 Grow Your Network</span>
          </div>
        </div>
      </div>

      <div className="auth-container">
        <div className="auth-card">
          <h1>Join SocialSphere</h1>
          <p>Create your account and start sharing today.</p>

          <form onSubmit={register}>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
            />

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

            <button type="submit">Register</button>
          </form>

          <span>
            Already have an account? <Link to="/">Login</Link>
          </span>
        </div>
      </div>
    </div>
  );
}

export default Register;