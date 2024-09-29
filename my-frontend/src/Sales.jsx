import React, { useState, useEffect } from 'react';
import './Sales.css';
import { useNavigate } from 'react-router-dom';

const Sales = () => {
  const navigate = useNavigate();
  const [salesSummary, setSalesSummary] = useState({});
  const [language, setLanguage] = useState('English');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSalesSummary();
  }, []);

  const fetchSalesSummary = async () => {
    try {
      const response = await fetch('http://localhost:3001/sales_summary');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      console.log('Fetched Sales Summary:', data); // Log the response
      setSalesSummary(data);
    } catch (error) {
      setError('Failed to fetch sales data');
      console.error('There was an issue fetching sales data:', error);
    }
  };
  

  const translations = {
    English: {
      title: "Sales Summary",
      error: "Error fetching data",
      totalSalesLabel: "Sales before Expenditure",
      netSalesLabel: "Sales after Expenditure",
      totalSales: "Total Sales",
      netSales: "Net Sales",
      totalMilkSold: "Total Sold Milk",
      profit: "Profit"
    },
    Urdu: {
      title: "خلاصہ فروخت",
      error: "ڈیٹا حاصل کرنے میں خرابی",
      totalSalesLabel: "اخراجات سے پہلے فروخت",
      netSalesLabel: "اخراجات کے بعد فروخت",
      totalSales: "کل فروخت",
      netSales: "خالص فروخت",
      totalMilkSold: "کل فروخت شدہ دودھ",
      profit: "منافع"
    }
  };

  return (
    <div className="sales-container">
      <button onClick={() => navigate('/')} className="back-arrow">
        &#8592;
      </button>
      <h1 className="sales-title">{translations[language].title}</h1>
      <button className="language-toggle" onClick={() => setLanguage(lang => lang === 'English' ? 'Urdu' : 'English')}>
        {language === 'English' ? 'اردو' : 'English'}
      </button>
      {error && <p className="error">{translations[language].error}</p>}
      <div className="sales-summary">
        <p className="sales-label">{translations[language].totalSalesLabel}</p>
        <p>{`${translations[language].totalSales}: ${salesSummary.total_sales || 0}`}</p>

        <p className="sales-label">{translations[language].netSalesLabel}</p>
        <p>{`${translations[language].netSales}: ${salesSummary.net_sales || 0}`}</p>

        <p className="sales-label">{translations[language].totalMilkSold}</p>
        <p>{`${translations[language].totalMilkSold}: ${salesSummary.total_sold_milk || 0}`}</p>

        <p className="sales-label">{translations[language].profit}</p>
        <p>{`${translations[language].profit}: ${salesSummary.profit || 0}`}</p>
      </div>
    </div>
  );
};

export default Sales;
