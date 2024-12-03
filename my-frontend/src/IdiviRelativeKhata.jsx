import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import './IdiviRelativeKhata.css';
import { useNavigate } from "react-router-dom";

const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];

const IdiviRelativeKhata = () => {
  const navigate = useNavigate();
  const [names, setNames] = useState([]);
  const [salesData, setSalesData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(null);
  const [visibleMonthDetails, setVisibleMonthDetails] = useState({});
  const [visibleMonths, setVisibleMonths] = useState({});
  const [totalSales, setTotalSales] = useState({}); // Track total sales for each relative

  useEffect(() => {
    const fetchNames = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('https://api.maherdairy.com/unique-namesr');
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
      const response = await fetch(`https://api.maherdairy.com/relatives/${encodeURIComponent(name)}`);
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
      
      const total = data.reduce((sum, entry) => sum + (entry.Quantity * entry.RUnitPrice), 0);
      setTotalSales(prev => ({ ...prev, [name]: total })); // Store the total sales for the specific relative
         
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

  const toggleAllMonthsVisibility = (name) => {
    setVisibleMonths(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const downloadPdf = (name, monthYear, entries) => {
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text(`${name}'s Report for ${monthYear}`, 10, 10);
    let y = 20;

    entries.forEach((entry, index) => {
      if (y > 280) {
        doc.addPage();
        y = 10;
      }
      const dateStr = `Date: ${new Date(entry.Date).toDateString()}`;
      const quantityStr = `Quantity: ${entry.Quantity}`;
      const unitPriceStr = `Unit Price: ${entry.RUnitPrice}`;
      const totalStr = `Total: ${entry.Quantity * entry.RUnitPrice}`;

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
      doc.line(10, y + 2, 200, y + 2);
      y += 8;
    });

    const monthTotal = entries.reduce((total, entry) => total + (entry.Quantity * entry.RUnitPrice), 0);
    if (y > 280) {
      doc.addPage();
      y = 10;
    }
    doc.text(`Total for ${monthYear}: ${monthTotal}`, 10, y);
    doc.save(`Report_${name}_${monthYear}.pdf`);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="expenditure-container">
      <button onClick={() => navigate("/")} className="back-arrow">
        &#8592;
      </button>
      <h1>Relatives' Details</h1>
      {names.map((name, index) => (
        <div key={index}>
          <button className="button" onClick={() => toggleDropdown(index, name)}>
            {name}
            <span className={`dropdown-indicator ${index === activeIndex ? 'open' : ''}`}>&#9660;</span>
          </button>
          {index === activeIndex && salesData[name] && (
            <div className="details">
              <button 
                onClick={() => navigate("/gherkhata", { state: { Rname: name, totalSales: totalSales[name] || 0 } })}
                className="view-button"
              >
                Total Baqaya/Wasooli
              </button>
              <button onClick={() => toggleAllMonthsVisibility(name)} className="view-button">
                {visibleMonths[name] ? "Hide daily Transaction" : "View daily Transaction"}
              </button>
              {visibleMonths[name] && (
                <div className="months-container">
                  {Object.keys(salesData[name]).map(monthYear => {
                    const entries = salesData[name][monthYear];
                    const monthTotal = entries.reduce((total, entry) => total + (entry.Quantity * entry.RUnitPrice), 0);
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
                                <p>Unit Price: {entry.RUnitPrice}</p>
                                <p>Total: {entry.Quantity * entry.RUnitPrice}</p>
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
          )}
        </div>
      ))}
    </div>
  );
};

export default IdiviRelativeKhata;
