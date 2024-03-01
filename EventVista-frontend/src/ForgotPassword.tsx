import React, { useState } from "react";
import { useLocation } from 'wouter'
import './ForgotPassword.css' // Import external CSS file

const ForgotPasswordEndPoint = "http://127.0.0.1:5000/api/forgot_password";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [, navigate] = useLocation();

  const handleChange = (e: { target: { value: React.SetStateAction<string>; }; }) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email");
    } else {
      setError("");
      try {
        const response = await fetch(ForgotPasswordEndPoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });

        if (!response.ok) {
          throw new Error("Failed to request password reset");
        }

        setEmail("");
        setError("");

        // Redirect to a page indicating successful password reset request
        navigate('/password-reset-requested');

        console.log("Password reset request successful");
      } catch (error) {
        console.error("Error requesting password reset:", error);
        setError("Failed to request password reset");
      }
    }
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
              <div className="d-flex justify-content-center mt-3 login_container">
                <div className="input-group-append">
                  <span className="input-group-text"><i className="fas fa-envelope"></i></span>
                </div>
                <input type="email" name="email" className="form-control input_user" value={email} onChange={handleChange} placeholder="Email" />
              </div>
              <div className="d-flex justify-content-center mt-3 login_container">
                <button type="submit" className="btn login_btn">Submit</button>
              </div>
            </form>
          </div>
          {error && <div className="mt-4 text-center text-danger">{error}</div>}
          <div className="mt-4">
            <div className="d-flex justify-content-center links">
              Remember your password? <a href="/login" className="ml-2">Login</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
