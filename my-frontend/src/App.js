import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { initializeApp } from "firebase/app";
import { getMessaging, onMessage, getToken as getMessagingToken } from "firebase/messaging";

import Home from './Home';
import ConsumersSales from './ConsumersDales';
import RelativesKhata from './RelativesKhata';
import ConsumerKhata from './ConsumerKhata';
import Expenditure from './Expenditure';
import Employee from './Employee';
import Sales from './Sales';
import logo from './cow2.jpg';


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('isAuthenticated') === 'true');
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  
  useEffect(() => {
    // On component mount, check if user is authenticated from localStorage
    const auth = localStorage.getItem('isAuthenticated');
    setIsAuthenticated(auth === 'true');
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('https://api.maherdairy.com/users', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to login');
      }
      localStorage.setItem('isAuthenticated', 'true');  // Save authentication state in localStorage
      setIsAuthenticated(true);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');  // Remove authentication state from localStorage
    setIsAuthenticated(false);  // Update state to reflect logout
  };

  if (!isAuthenticated) {
    return (
      <div className="login-container">
        <h1>Maher Dairy</h1>
        <div className="logo-container">
          <img src={logo} alt="Maher Dairy Logo" />
        </div>
        <div className="login-form">
          <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
          <button onClick={handleLogin} disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
          {error && <p className="error">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<ConsumersSales />} />
        <Route path="/about" element={<RelativesKhata />} />
        <Route path="/contact" element={<ConsumerKhata />} />
        <Route path="/expenditure" element={<Expenditure />} />
        <Route path="/employee" element={<Employee />} />
        <Route path="/sales" element={<Sales />} />
      </Routes>
    </Router>
  );
}

export default App;
