import React, { useState } from "react";
import { useLocation } from 'wouter'
import './RegistrationForm.css' // Import external CSS file

const SendEndPoint = "http://127.0.0.1:5000/api/send_data";

export function RegistrationForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    repeatPassword: "",
    role: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [error, setError] = useState("");
  const [, navigate] = useLocation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      role: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.repeatPassword || !formData.role) {
      setError("All fields are required");
    } else if (formData.password !== formData.repeatPassword) {
      setError("Passwords do not match");
    } else {
      setError("");
      try {
        const response = await fetch(SendEndPoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error("Failed to register");
        }

        setFormData({
          name: "",
          email: "",
          password: "",
          repeatPassword: "",
          role: "",
        });

        navigate('/login') // Redirect to dashboard after successful registration

        console.log("Registration Successful");
      } catch (error) {
        console.error("Error registering:", error);
        setError("Failed to register");
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleRepeatPasswordVisibility = () => {
    setShowRepeatPassword(!showRepeatPassword);
  };

  return (
    <div className="container h-100">
        <div className="d-flex justify-content-center h-100">
            <div className="user_card">
                <div className="d-flex justify-content-center">
                    <div className="brand_logo_container">
                        <img src="https://cdn.freebiesupply.com/logos/large/2x/pinterest-circle-logo-png-transparent.png" className="brand_logo" alt="Logo" />
                    </div>
                </div>
                <div className="d-flex justify-content-center form_container">
                    <form onSubmit={handleSubmit}>
                        <div className="input-group mb-3">
                            <div className="input-group-append">
                                <span className="input-group-text"><i className="fas fa-user"></i></span>
                            </div>
                            <input type="text" name="name" className="form-control input_user" value={formData.name} onChange={handleChange} placeholder="Name" />
                        </div>
                        <div className="input-group mb-3">
                            <div className="input-group-append">
                                <span className="input-group-text"><i className="fas fa-envelope"></i></span>
                            </div>
                            <input type="email" name="email" className="form-control input_email" value={formData.email} onChange={handleChange} placeholder="Email" />
                        </div>
                        <div className="input-group mb-3">
                            <div className="input-group-append">
                                <span className="input-group-text"><i className="fas fa-key"></i></span>
                            </div>
                            <input type={showPassword ? "text" : "password"} name="password" className="form-control input_pass" value={formData.password} onChange={handleChange} placeholder="Password" />
                            <div className="input-group-append">
                                <button className="btn btn-outline-secondary" type="button" onClick={togglePasswordVisibility}>{showPassword ? "Hide" : "Show"}</button>
                            </div>
                        </div>
                        <div className="input-group mb-3">
                            <div className="input-group-append">
                                <span className="input-group-text"><i className="fas fa-key"></i></span>
                            </div>
                            <input type={showRepeatPassword ? "text" : "password"} name="repeatPassword" className="form-control input_pass" value={formData.repeatPassword} onChange={handleChange} placeholder="Repeat Password" />
                            <div className="input-group-append">
                                <button className="btn btn-outline-secondary" type="button" onClick={toggleRepeatPasswordVisibility}>{showRepeatPassword ? "Hide" : "Show"}</button>
                            </div>
                        </div>
                        <div className="input-group mb-2">
                            <div className="input-group-append">
                                <span className="input-group-text"><i className="fas fa-users"></i></span>
                            </div>
                            <select name="role" className="form-control input_user" value={formData.role} onChange={handleRoleChange}>
                                <option value="">Select Role</option>
                                <option value="Organizer">Organizer</option>
                                <option value="Attendant">Attendant</option>
                            </select>
                        </div>
                        <div className="d-flex justify-content-center mt-3 login_container">
                            <button type="submit" className="btn login_btn">Register</button>
                        </div>
                    </form>
                </div>
                {error && <div className="mt-4 text-center text-danger">{error}</div>}
                <div className="mt-4">
                    <div className="d-flex justify-content-center links">
                        Already have an account? <a href="/login" className="ml-2">Login</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}
