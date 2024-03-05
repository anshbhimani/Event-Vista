import React, { useState } from "react";
import { useLocation } from 'wouter'
import './LoginForm.css' // Import external CSS file

const LoginEndPoint = "http://127.0.0.1:5000/api/login";

export function LoginForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [, navigate] = useLocation();
  const [, setUserRole] = useState(""); // New state to store user role

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError("All fields are required");
    } else {
      setError("");
      try {
        const response = await fetch(LoginEndPoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error("Failed to login");
        }

        const userData = await response.json(); // Assuming server returns user data including role
        setUserRole(userData.role); // Store user role

        setFormData({
          email: "",
          password: "",
        });

         // Redirect user based on role
         if (userData.role === "Organizer") {
          navigate('/organizer-dashboard');
        } else if (userData.role === "Attendant") {
          navigate('/attendee-dashboard');
        } else if(userData.role === "Admin"){
          navigate('/admin-dashboard')
        }
        else {
          navigate('/');
        }

        console.log("Login Successful");
      } catch (error) {
        console.error("Error logging in:", error);
        setError("Failed to login");
      }
    }
  };

  return (
    <div className="container h-100">
      <div className="d-flex justify-content-center align-items-center h-100">
        <div className="user_card">
          <div className="d-flex justify-content-center">
            <div className="brand_logo_container">
              <img
                src="https://cdn.freebiesupply.com/logos/large/2x/pinterest-circle-logo-png-transparent.png"
                className="brand_logo"
                alt="Logo"
              />
            </div>
          </div>
          <div className="d-flex justify-content-center form_container">
            <form onSubmit={handleSubmit}>
              <div className="d-flex justify-content-center mt-3 login_container">
                <div className="input-group-append">
                  <span className="input-group-text">
                    <i className="fas fa-user"></i>
                  </span>
                </div>
                <input
                  type="text"
                  name="email"
                  className="form-control input_user"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="username"
                />
              </div>
              <div className="d-flex justify-content-center mt-3 login_container">
                <div className="input-group-append">
                  <span className="input-group-text">
                    <i className="fas fa-key"></i>
                  </span>
                </div>
                <input
                  type="password"
                  name="password"
                  className="form-control input_pass"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="password"
                />
              </div>
              <div className="d-flex justify-content-center mt-3 login_container">
                <button type="submit" className="btn login_btn">
                  Login
                </button>
              </div>
            </form>
          </div>
          {error && (
            <div className="mt-4 text-center text-danger">{error}</div>
          )}
          <div className="mt-4">
            <div className="d-flex justify-content-center links">
              Don't have an account? <a href="/register" className="ml-2">Sign Up</a>
            </div>
            <div className="d-flex justify-content-center links">
              <a href="/forgot-password">Forgot your password?</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}  
