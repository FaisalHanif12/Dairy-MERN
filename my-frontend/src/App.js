import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './Home'; // Make sure the path to your Home component is correct
import ConsumersSales from './ConsumersDales'; // Adjust the path as needed
import RelativesKhata from './RelativesKhata'; // Adjust the path as needed
import ConsumerKhata from './ConsumerKhata'; // Adjust the path as needed
import Expenditure from './Expenditure'; // Adjust the path as needed
import Employee from './Employee'; // Adjust the path as needed
import Sales from './Sales'; // Adjust the path as needed

function App() {

  return (
    <Router>
       <Routes>
        <Route
          path="/"
          element={
           
              <Home />
           }
        />
        <Route
          path="/services"
          element={
          
              <ConsumersSales />
           
          }
        />
        <Route
          path="/about"
          element={
                         <RelativesKhata />
                      }
        />
        <Route
          path="/contact"
          element={
            
              <ConsumerKhata />
           
          }
        />
        <Route
          path="/expenditure"
          element={
                         <Expenditure />
                      }
        />

        <Route
          path="/employee"
          element={
                         <Employee />
                      }
        />

        <Route
          path="/sales"
          element={
                         <Sales />
                      }
        />


      </Routes>


    </Router>
  );
}

export default App;
