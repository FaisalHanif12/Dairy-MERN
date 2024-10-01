import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LocalNotifications } from '@capacitor/local-notifications';
import Home from './Home'; 
import ConsumersSales from './ConsumersDales'; 
import RelativesKhata from './RelativesKhata'; 
import ConsumerKhata from './ConsumerKhata'; 
import Expenditure from './Expenditure'; 
import Employee from './Employee'; 
import Sales from './Sales';

function App() {

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
      // Cancel any previous notifications to avoid duplicates (optional)
      await LocalNotifications.cancelAll();

      // Schedule notifications for 11 AM and 5 PM daily
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
          },
        ],
      });

      console.log('Notifications scheduled for 11 AM and 5 PM');
    } catch (error) {
      console.error('Error scheduling notifications:', error);
    }
  };

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
