import React, { useEffect,useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core'; // Import Capacitor to detect platform
import Home from './Home'; 
import ConsumersSales from './ConsumersDales'; 
import RelativesKhata from './RelativesKhata'; 
import ConsumerKhata from './ConsumerKhata'; 
import Expenditure from './Expenditure'; 
import Employee from './Employee'; 
import Sales from './Sales';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(Capacitor.getPlatform() !== 'web');
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const correctUsername = process.env.REACT_APP_USERNAME;
  const correctPassword = process.env.REACT_APP_PASSWORD;

  useEffect(() => {
    const initializeNotifications = async () => {
      const { display } = await LocalNotifications.requestPermissions();
      if (display === 'granted') {
        await scheduleNotifications();
      } else {
        console.error('Permission for notifications was not granted');
      }
    };
    
    initializeNotifications();
  }, []);

  const scheduleNotifications = async () => {
    try {
      await LocalNotifications.cancelAll();

      await LocalNotifications.schedule({
        notifications: [
          {
            title: 'Reminder',
            body: 'Please add the relatives or consumers milk.',
            id: 1,
            schedule: {
              repeats: true,
              every: 'day',
              on: {
                hour: 11,
                minute: 0,
              },
            },
            attachments: [
              {
                id: 'milk-image',
                url: '/Images/cowemoji.jpeg',
              },
            ],
            ongoing: true,
          },
          {
            title: 'Reminder',
            body: 'Please add the relatives or consumers milk.',
            id: 2,
            schedule: {
              repeats: true,
              every: 'day',
              on: {
                hour: 17,
                minute: 0,
              },
            },
            attachments: [
              {
                id: 'milk-image',
                url: '/Images/cowemoji.jpeg',
              },
            ],
            ongoing: true,
          },
          {
            title: 'Reminder',
            body: 'Please collect the wasooli from consumers.',
            id: 3,
            schedule: {
              repeats: true,
              every: 'day',
              on: {
                hour: 19,
                minute: 0,
              },
            },
            attachments: [
              {
                id: 'collection-image',
                url: '/Images/cowemoji.jpeg',
              },
            ],
            ongoing: true,
          },
        ],
      });
      console.log('Notifications scheduled for 11 AM, 5 PM, and 7 PM');
    } catch (error) {
      console.error('Error scheduling notifications:', error);
    }
  };

  const handleLogin = () => {
    if (username === correctUsername && password === correctPassword) {
      setIsAuthenticated(true);
    } else {
      alert("Incorrect Username or Password");
    }
  };

  if (!isAuthenticated && Capacitor.getPlatform() === 'web') {
    return (
      <div className="login-container">
        <input type="text" placeholder="Username" onChange={e => setUsername(e.target.value)} />
        <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
        <button onClick={handleLogin}>Login</button>
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