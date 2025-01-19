import React, { useState } from "react";
import "./Login.css";

interface LoginPageProps {
  setToken: (token: string | null) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ setToken }) => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3000/prijava", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.token);
        setToken(data.token);
        // alert("Prijava uspješna!");
      } else {
        alert("Neuspješna prijava");
      }
    } catch (error) {
      console.error("Greška:", error);
      alert("Došlo je do greške");
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <label>
            Email
            <div className="input-group">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </label>
          <br />
          <label>
            Lozinka:
            <div className="input-group">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </label>
          <br />
          <button type="submit" className="btn-login">
            Prijava
          </button>
        </form>
        <div className="footer">
          <p>Forgot your password?</p>
          <p>
            Don't have an account? <a href="/register">Sign up</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
