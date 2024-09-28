import React, { useState } from "react";
import "./Home.css"; // Importing stylesheet for Home component
import { useNavigate } from "react-router-dom";

const Home = () => {
  const currentYear = new Date().getFullYear(); // Gets the current year for the copyright in the footer
  const navigate = useNavigate();

  // State to toggle between English and Urdu
  const [isUrdu, setIsUrdu] = useState(false);

  // Function to handle language toggle
  const toggleLanguage = () => {
    setIsUrdu(!isUrdu); // Toggle between English and Urdu
  };

  // Function to handle card click navigation
  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="home-container">
      {/* Language Toggle Button */}
      {/* New Bar at the top */}
      <div className="nav-bar">
        <h2 className="nav-title">
          {isUrdu ? "مہر ڈیری فارم" : "Maher Dairy Farm"}
        </h2>
      </div>

      <button className="toggle-button" onClick={toggleLanguage}>
        {isUrdu ? "English" : "اردو"}
      </button>

      <div className="card-container">
        {/* Each card is clickable and navigates to a different path */}
        <div className="card" onClick={() => handleNavigation("/services")}>
          <h3 className="card-title">
            {isUrdu ? "صارف فروخت" : "Consumer Sales"}
          </h3>
        </div>
        <div className="card" onClick={() => handleNavigation("/about")}>
          <h3 className="card-title">
          {isUrdu ? "رشتہ دار فروخت" : "Relatives Sales"}
          </h3>
        </div>
        <div className="card" onClick={() => handleNavigation("/contact")}>
          <h3 className="card-title">
            {isUrdu ? "صارف کھاتہ" : "Consumer Khata"}
          </h3>
        </div>
        <div className="card" onClick={() => handleNavigation("/expenditure")}>
          <h3 className="card-title">{isUrdu ? "اخراجات" : "Expenditure"}</h3>
        </div>
        <div className="card" onClick={() => handleNavigation("/employee")}>
          <h3 className="card-title">
            {isUrdu ? "ملازم کھاتہ" : "Employee Khata"}
          </h3>
        </div>
        <div className="card" onClick={() => handleNavigation("/sales")}>
          <h3 className="card-title">
            {isUrdu ? "کل فروخت" : "Overall Sales"}
          </h3>
        </div>
      </div>

      <footer className="footer">
        <div className="ownerInfo">
          <h3 className="ownerTitle">
            {isUrdu ? "فارم مالکان" : "Farm Owners"}
          </h3>
          <p className="ownerName">{isUrdu ? "ماہر رضوان" : "Maher Rizwan"}</p>
          <p className="ownerContact">
            {isUrdu ? "رابطہ: +966533528462" : "Contact: +966533528462"}
          </p>
          <p className="ownerName">{isUrdu ? "ماہر ہارون" : "Maher Haroon"}</p>
          <p className="ownerContact">
            {isUrdu ? "رابطہ: 03107865430" : "Contact: 03107865430"}
          </p>
          <p className="ownerName">{isUrdu ? "ماہر انس" : "Maher Ans"}</p>
          <p className="ownerContact">
            {isUrdu ? "رابطہ: 03184594874" : "Contact: 03184594874"}
          </p>
        </div>

        <p className="footerText">
          &copy; {currentYear}{" "}
          {isUrdu
            ? "مہر ڈیری فارم۔ تمام حقوق محفوظ ہیں۔"
            : "Maher Dairy Farm. All rights reserved."}
        </p>
      </footer>
    </div>
  );
};

export default Home;
