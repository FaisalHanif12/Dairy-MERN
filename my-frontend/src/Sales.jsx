import React, { useState, useEffect } from 'react';
import './Sales.css';
import { useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { saveAs } from 'file-saver'; // Import file-saver to handle file downloads

// Register Chart.js components
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

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
      const response = await fetch('https://api.maherdairy.com/sales_summary');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setSalesSummary(data);
    } catch (error) {
      setError('Failed to fetch sales data');
      console.error('There was an issue fetching sales data:', error);
    }
  };

  // Function to calculate the percentage
  const getPercentage = (value, total) => {
    return total !== 0 ? ((value / total) * 100).toFixed(2) : 0;
  };

  // Data for the bar chart
  const chartData = {
    labels: ['Sales', 'Expenditure', salesSummary.profit >= 0 ? 'Profit' : 'Loss'],
    datasets: [
      {
        label: 'Amount',
        data: [
          salesSummary.total_sales || 0,
          salesSummary.total_expenditure || 0,
          salesSummary.profit || 0,
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)', // Sales
          'rgba(255, 99, 132, 0.6)', // Expenditure
          salesSummary.profit >= 0 ? 'rgba(54, 162, 235, 0.6)' : 'rgba(255, 99, 132, 0.6)', // Profit (blue) or Loss (red)
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
          salesSummary.profit >= 0 ? 'rgba(54, 162, 235, 1)' : 'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            const label = tooltipItem.dataset.label || '';
            return `${label}: $${tooltipItem.raw} (${getPercentage(tooltipItem.raw, salesSummary.total_sales)}%)`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const translations = {
    English: {
      title: "Sales Summary",
      error: "Error fetching data",
      totalSalesLabel: "Total Sales",
      totalExpenditureLabel: "Total Expenditure",
      totalSales: "Total Sales",
      totalExpenditure: "Total Expenditure",
      downloadReport: "Download Report",
      totalMilkSold: "Total Sold Milk",
      profit: salesSummary.profit >= 0 ? "Total Profit" : "Total Loss",
    },
    Urdu: {
      title: "خلاصہ فروخت",
      error: "ڈیٹا حاصل کرنے میں خرابی",
      totalSalesLabel: "کل فروخت",
      downloadReport: "رپورٹ ڈاؤن لوڈ کریں",
      totalExpenditureLabel: "کل اخراجات",
      totalSales: "کل فروخت",
      totalExpenditure: "کل اخراجات",
      totalMilkSold: "کل فروخت شدہ دودھ",
      profit: salesSummary.profit >= 0 ? "کل منافع" : "کل نقصان",
    },
  };

  const generateReport = () => {
    const reportHeader = `${translations[language].title}\n\n`;
    const reportData = `
      ${translations[language].totalSales}: ${salesSummary.total_sales || 0}\n
      ${translations[language].totalExpenditure}: ${salesSummary.total_expenditure || 0}\n
      ${translations[language].totalMilkSold}: ${salesSummary.total_milk_sold || 0}\n
      ${translations[language].profit}: ${salesSummary.profit || 0}\n
    `;
    return reportHeader + reportData;
  };

  // Function to handle the report download
  const handleDownloadReport = () => {
    const report = generateReport();
    const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
    saveAs(blob, `SalesSummary_${language}.txt`);
  };

  return (
    <div className="sales-container">
      <button onClick={() => navigate('/')} className="back-arrowS">
        &#8592;
      </button>
      <h1 className="sales-title">{translations[language].title}</h1>
      <button className="language-toggle" onClick={() => setLanguage(lang => lang === 'English' ? 'Urdu' : 'English')}>
        {language === 'English' ? 'اردو' : 'English'}
      </button>
      {error && <p className="error">{translations[language].error}</p>}
      <div className="sales-summary">
        <p className="sales-label">{translations[language].totalMilkSold}</p>
        <p>{`${translations[language].totalMilkSold}: ${salesSummary.total_milk_sold || 0}`}</p>

        <p className="sales-label">{translations[language].totalSalesLabel}</p>
        <p>{`${translations[language].totalSales}: ${salesSummary.total_sales || 0}`}</p>

        <p className="sales-label">{translations[language].totalExpenditureLabel}</p>
        <p>{`${translations[language].totalExpenditure}: ${salesSummary.total_expenditure || 0}`}</p>

        <p className="sales-label">{translations[language].profit}</p>
        <p>{`${translations[language].profit}: ${salesSummary.profit || 0}`}</p>
      </div>
      

      <button onClick={handleDownloadReport} className="common-button">
        {translations[language].downloadReport}
      </button>


      {/* Chart Section */}
      <div className="chart-container">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default Sales;
