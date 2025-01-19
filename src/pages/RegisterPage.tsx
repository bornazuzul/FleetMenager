import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Register.css";

function RegisterPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "user",
  });
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // slanje registracije
      const response = await axios.post(
        "http://localhost:3000/registracija",
        formData
      );

      // uzimanje tokena kojeg je server izgenerira
      const token = response.data.token;

      localStorage.setItem("token", token);

      alert("Registration successful!");
      navigate("/protected");
    } catch (error: any) {
      if (error.response && error.response.data) {
        alert(`Registration failed: ${error.response.data}`);
      } else {
        alert("Registration failed. Please try again.");
      }
      console.error("Error:", error);
    }
  };

  return (
    <div className="background">
      <form onSubmit={handleSubmit}>
        <h2>Register</h2>
        <input
          type="text"
          placeholder="Username"
          value={formData.username}
          onChange={(e) =>
            setFormData({ ...formData, username: e.target.value })
          }
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          required
        />
        <select
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit">Register</button>
      </form>
      <div className="footer">
        <p>
          Have an account? <a href="/">Log in</a>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
