import { useState } from 'react';
import './Login.css'; // Import your CSS file
import { navigate } from 'wouter/use-browser-location';

export function LoginSignup() {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState("");

  const SendEndPoint = "http://127.0.0.1:5000/api/send_data";
  const LoginEndPoint = "http://127.0.0.1:5000/api/login";

  const handleLogin = async () => {
    try {
      const response = await fetch(LoginEndPoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to login");
      }

      const userData = await response.json(); // Assuming server returns user data including role
      console.log('Response Data : ', userData);
      
      const organizer_id = userData['Organizer_ID'];
      const role = userData['role'];
      const organizer_name = userData['Organizer_Name'];

      // Store user role and organizer ID in local storage
      localStorage.setItem('userRole', role);
      localStorage.setItem('organizerId', organizer_id);
      localStorage.setItem('organizerName', organizer_name);
      console.log('Organizer ID stored in local storage:', organizer_id); 
      console.log('Organizer Name : ', organizer_name);

      setLoginEmail('');
      setLoginPassword('');

      // Redirect user based on role
      if (role === "Organizer") {
        navigate('/organizer-dashboard');
      } else if (role === "Attendant") {
        navigate('/attendee-dashboard');
      } else if (role === "Admin"){
        navigate('/admin-dashboard');
      } else {
        navigate('/');
      }

      console.log("Login Successful");
    } catch (error) {
      console.error("Error logging in:", error);
      setError("Failed to login");
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    // Password validation criteria
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/;
    const isPasswordValid = passwordRegex.test(signupPassword);

    if (!signupName || !signupEmail || !signupPassword || !repeatPassword || !role) {
      setError("All fields are required");
      return;
    } else if (signupPassword !== repeatPassword) {
      setError("Password and Repeat Password do not match");
      return;
    } else if (!isPasswordValid) {
      setError("Password must contain at least 8 characters, including one uppercase letter, one lowercase letter, one number, and one special character");
      return;
    }
    
    try {
      const response = await fetch(SendEndPoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: signupName,
          email: signupEmail,
          password: signupPassword,
          repeatPassword: repeatPassword,
          role: role,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to register");
      }

      setSignupName('');
      setSignupEmail('');
      setSignupPassword('');
      setRepeatPassword('');
      setRole('');

      console.log("Registration Successful");
    } catch (error) {
      console.error("Error registering:", error);
      setError("Failed to register");
    }
  };

  return (
    <div className="section">
      <div className="container">
        <div className="row full-height justify-content-center">
          <div className="col-12 text-center align-self-center py-5">
            <div className="login">
              <input className="checkbox" type="checkbox" id="reg-log"/>
              <label htmlFor="reg-log"></label>
              <div className="card-3d-wrap mx-auto">
                <div className="card-3d-wrapper">
                  <div className="card-front">
                    <div className="center-wrap">
                        <center>
                          <h2>Event Vista</h2>
                        </center>
                      <div className="section text-center">
                        <h4 className="mb-4 pb-3">Log In</h4>
                        <div className="form-group">
                          <input value={loginEmail} onChange={e => setLoginEmail(e.target.value)} type="email" className="form-style" placeholder="Your Email" autoComplete="none"/>
                          <i className="input-icon fa fa-at"></i>
                        </div>
                        <div className="form-group mt-2">
                          <input value={loginPassword} onChange={e => setLoginPassword(e.target.value)} type="password" className="form-style" placeholder="Your Password" autoComplete="none"/>
                          <i className="input-icon fa fa-lock"></i>
                        </div>
                        <button onClick={handleLogin} className="btn mt-4">Login</button>
                        <p className="mb-0 mt-4 text-center">
                          <a href="#0" className="link">Forgot your password?</a>
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="card-back">
                  <div className="center-wrap">
                      <center>
                        <h2>Event Vista</h2>
                      </center>
                      <div className="section text-center">
                        <h4 className="mb-4 pb-3">Sign Up</h4>
                        <div className="form-group">
                          <input value={signupName} onChange={e => setSignupName(e.target.value)} type="text" className="form-style" placeholder="Your Full Name" autoComplete="none"/>
                          <i className="input-icon fa fa-user"></i>
                        </div>
                        <div className="form-group mt-2">
                          <input value={signupEmail} onChange={e => setSignupEmail(e.target.value)} type="email" className="form-style" placeholder="Your Email" autoComplete="none"/>
                          <i className="input-icon fa fa-at"></i>
                        </div>
                        <div className="form-group mt-2">
                          <input value={signupPassword} onChange={e => setSignupPassword(e.target.value)} type="password" className="form-style" placeholder="Your Password" autoComplete="none"/>
                          <i className="input-icon fa fa-lock"></i>
                        </div>
                        <div className="form-group mt-2">
                          <input value={repeatPassword} onChange={e => setRepeatPassword(e.target.value)} type="password" className="form-style" placeholder="Repeat Password" autoComplete="none"/>
                          <i className="input-icon fa fa-lock"></i>
                        </div>
                        <div className="form-group mt-2">
                          <select value={role} onChange={e => setRole(e.target.value)} className="form-style">
                            <option value="">Select Role</option>
                            <option value="Organizer">Organizer</option>
                            <option value="Attendant">Attendant</option>
                          </select>
                        </div>
                        <button onClick={handleSignup} className="btn mt-4">Signup</button>
                        {error && <p className="error-message">{error}</p>} {/* Display error message */}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};