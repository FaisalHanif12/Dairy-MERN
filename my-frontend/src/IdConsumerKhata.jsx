import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import './IdiviRelativeKhata.css';
import { useNavigate } from "react-router-dom";
const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];

const IdConsumerKhata = () => {
  const navigate = useNavigate();
  const [names, setNames] = useState([]);
  const [salesData, setSalesData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(null);
  const [visibleMonthDetails, setVisibleMonthDetails] = useState({});

  useEffect(() => {
    const fetchNames = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('https://api.maherdairy.com/unique-names');
        if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
        const data = await response.json();
        setNames(data);
      } catch (error) {
        setError(`Fetching failed: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchNames();
  }, []);

  const fetchSalesData = async (name) => {
    setLoading(true);
    try {
      const response = await fetch(`https://api.maherdairy.com/consumerssale/${encodeURIComponent(name)}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      const groupedData = data.reduce((acc, item) => {
        const date = new Date(item.Date);
        const monthYear = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
        if (!acc[monthYear]) {
          acc[monthYear] = [];
        }
        acc[monthYear].push(item);
        return acc;
      }, {});
      setSalesData(prev => ({ ...prev, [name]: groupedData }));
    } catch (error) {
      console.error("Failed to fetch sales data:", error);
      setError(`Failed to fetch sales data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleDropdown = (index, name) => {
    if (activeIndex === index) {
      setActiveIndex(null);
    } else {
      setActiveIndex(index);
      if (!salesData[name]) {
        fetchSalesData(name);
      }
    }
  };

  const toggleMonthVisibility = (name, monthYear) => {
    setVisibleMonthDetails(prev => ({
      ...prev,
      [`${name}-${monthYear}`]: !prev[`${name}-${monthYear}`]
    }));
  };

  const downloadPdf = (name, monthYear, entries) => {
  const doc = new jsPDF();
  doc.setFontSize(12); // Set font size for better control
  doc.text(`${name}'s Report for ${monthYear}`, 10, 10);
  let y = 20; // Initial vertical offset

  entries.forEach((entry, index) => {
    if (y > 280) { // Check if the current vertical offset exceeds the page height
      doc.addPage(); // Add a new page
      y = 10; // Reset the vertical offset
    }
    const dateStr = `Date: ${new Date(entry.Date).toDateString()}`;
    const quantityStr = `Quantity: ${entry.Quantity}`;
    const unitPriceStr = `Unit Price: ${entry.UnitPrice}`;
    const totalStr = `Total: ${entry.Quantity * entry.UnitPrice}`;

    doc.text(dateStr, 10, y);
    y += 6;
    doc.text(quantityStr, 10, y);
    y += 6;
    doc.text(unitPriceStr, 10, y);
    y += 6;
    doc.text(totalStr, 10, y);
    y += 6;

    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(10, y + 2, 200, y + 2); // Draw a line
    y += 8; // Increase the vertical offset after the line
  });

  // Calculate the month total using the correct property `UnitPrice`
  const monthTotal = entries.reduce((total, entry) => total + (entry.Quantity * entry.UnitPrice), 0);
  if (y > 280) { // Check and add a new page for the total if needed
    doc.addPage();
    y = 10;
  }
  doc.text(`Total for ${monthYear}: ${monthTotal}`, 10, y); // Display the total
  doc.save(`Report_${name}_${monthYear}.pdf`); // Save the PDF
};


  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="expenditure-container">
       <button onClick={() => navigate("/")} className="back-arrow">
        &#8592;
      </button>
      <h1>Consumers Details</h1>
      {names.map((name, index) => (
        <div key={index}>
          <button className="button" onClick={() => toggleDropdown(index, name)}>
            {name}
            <span className={`dropdown-indicator ${index === activeIndex ? 'open' : ''}`}>&#9660;</span>
          </button>
          {index === activeIndex && salesData[name] && (
            <div className="details">
              {Object.keys(salesData[name]).map(monthYear => {
                const entries = salesData[name][monthYear];
                const monthTotal = entries.reduce((total, entry) => total + (entry.Quantity * entry.UnitPrice), 0);
                return (
                  <div key={monthYear}>
                    <button onClick={() => toggleMonthVisibility(name, monthYear)} className="month-button">
                      {monthYear}: {entries.length} entries
                    </button>
                    {visibleMonthDetails[`${name}-${monthYear}`] && (
                      <div className="month-details">
                        {entries.map((entry, index) => (
                          <div key={index} className="entry-card">
                            <p>Date: {new Date(entry.Date).toDateString()}</p>
                            <p>Quantity: {entry.Quantity}</p>
                            <p>Unit Price: {entry.UnitPrice}</p>
                            <p>Total: {entry.Quantity * entry.UnitPrice}</p>
                          </div>
                        ))}
                        <p className="month-total">Total for {monthYear}: {monthTotal}</p>
                        <button onClick={() => downloadPdf(name, monthYear, entries)} className="download-pdf-button">Download PDF</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default IdConsumerKhata;
