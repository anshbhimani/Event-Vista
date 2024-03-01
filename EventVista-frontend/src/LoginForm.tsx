import React, { useState } from "react";
import {
  MDBBtn,
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCardBody,
  MDBCardImage,
  MDBInput,
  MDBIcon,
} from "mdb-react-ui-kit";
import { useLocation } from 'wouter'
import './App.css'

const LoginEndPoint = "http://127.0.0.1:5000/api/login";

export function LoginForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [, navigate] = useLocation();

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
      // Submit the form here
      console.log("Form submitted:", formData);

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

        // Reset form data after successful submission
        setFormData({
          email: "",
          password: "",
        });

        navigate('/dashboard')

        console.log("Login Successful");
      } catch (error) {
        console.error("Error logging in:", error);
        setError("Failed to login");
      }
    }
  };

  return (
    <div className="login-container">
      <MDBContainer className="login-form-container">
        <MDBCardBody>
          <MDBRow>
            <MDBCol
              md="6"
              className="order-2 order-md-1 d-flex justify-content-center align-items-center mb-4 mb-md-0"
            >
              <MDBCardImage
                src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-registration/draw1.webp" height="500"
              />
            </MDBCol>
            <MDBCol
              md="6"
              className="order-1 order-md-2 d-flex flex-column justify-content-center align-items-center"
            >
              <h1>
                Login
              </h1>
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="d-flex flex-row align-items-center mb-4">
                <MDBInput
                    label="Your Email"
                    id="form2"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  <MDBIcon fas icon="envelope me-3" size="lg" />
                </div>
                <div className="d-flex flex-row align-items-center mb-4">
                  <MDBIcon fas icon="lock me-3" size="lg" />
                  <MDBInput
                    label="Password"
                    id="form3"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
                <MDBBtn type="submit" className="mb-4" size="lg">
                  Login
                </MDBBtn>
              </form>
            </MDBCol>
          </MDBRow>
        </MDBCardBody>
      </MDBContainer>
    </div>
  );
}
