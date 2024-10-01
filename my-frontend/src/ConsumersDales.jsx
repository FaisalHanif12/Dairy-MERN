import React, { useState, useEffect } from "react";
import "./ConsumersDales.css";
import { useNavigate } from "react-router-dom";
import { saveAs } from "file-saver"; // Import file-saver to handle file downloads

const ConsumersDales = () => {
  const navigate = useNavigate();
  const [source, setSource] = useState("");
  const [quantity, setQuantity] = useState("");
  const [amount, setAmount] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [editIndex, setEditIndex] = useState(-1);
  const [showAlert, setShowAlert] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [groupVisibility, setGroupVisibility] = useState({});
  const [globalVisibility, setGlobalVisibility] = useState(false);
  const [showMonthlySales, setShowMonthlySales] = useState(false);
  const [language, setLanguage] = useState("English"); // Default to English
  const [showModal, setShowModal] = useState(false); // You already have this for controlling the visibility of the modal
  const [modalMessage, setModalMessage] = useState(""); // Add this line to manage the modal message
  const [consumerNames, setConsumerNames] = useState([]);

  const translations = {
    English: {
      title: "Consumer Sales",
      date: "Date",
      name: "Name",
      quantity: "Quantity",
      pricePerKilo: "Price per kilo",
      save: "Save",
      monthlyConsumerSale: "Monthly Consumer Sale",
      overallConsumerSale: "Overall Consumers Sale",
      download: "Download Report",
      showAll: "Show",
      hideAll: "Hide ",
      show: "Show ",
      hide: "Hide ",
      show1: "Show All",
      hide1: "Hide All",
      delete: "Delete",
      update: "Update",
      deletePrompt: "Are you sure you want to delete this?",
      yes: "Yes",
      no: "No",
      consumerName: "Consumer Name",
      total: "Total",
      ConsumerName: "Enter Consumer name ",
      Quantity: "Enter Milk Quantity",
      price: "Enter price per kilo ",
      KiloMilk: "Kilo Milk",
      kaa: "of",
      added: "has been added",
      In: "In",
      record: "Record has been updated",
    },
    Urdu: {
      title: "صارفین کی فروخت",
      date: "تاریخ",
      name: "نام",
      quantity: "مقدار",
      pricePerKilo: "فی کلو قیمت",
      save: "محفوظ کریں",
      monthlyConsumerSale: "ماہانہ صارفین کی فروخت",
      overallConsumerSale: "کل صارفین کی فروخت",
      download: "رپورٹ ڈاؤن لوڈ کریں",
      showAll: " دیکھیں",
      hideAll: " چھپائیں",
      show: " دیکھیں",
      hide: " چھپائیں",
      show1: "سب دیکھیں",
      hide1: "سب چھپائیں",
      delete: "حذف کریں",
      update: "اپ ڈیٹ",
      deletePrompt: "کیا آپ واقعی اس  کو حذف کرنا چاہتے ہیں؟",
      yes: "ہاں",
      no: "نہیں",
      consumerName: "صارف کا نام",
      total: "کل",
      ConsumerName: "صارف کا نام درج کریں ",
      Quantity: "دودھ کی مقدار درج کریں ",
      price: "فی کلو قیمت درج کریں ",
      KiloMilk: "کلو دودھ",
      kaa: "کا",
      added: " شامل ہوگیا ہے",
      In: "میں",
      record: "ریکارڈ اپ ڈیٹ ہو گیا ہے",
    },
  };

  const monthTranslations = {
    January: "جنوری",
    February: "فروری",
    March: "مارچ",
    April: "اپریل",
    May: "مئی",
    June: "جون",
    July: "جولائی",
    August: "اگست",
    September: "ستمبر",
    October: "اکتوبر",
    November: "نومبر",
    December: "دسمبر",
  };

  const fetchConsumerNames = async () => {
    try {
      const response = await fetch("https://dairy-mern-1.onrender.com//consumerkhata"); // Update with correct API endpoint
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const consumersData = await response.json();
      // Extract names from the response data and update the state
      const names = consumersData.map((consumer) => consumer.name);
      setConsumerNames(names);
    } catch (error) {
      console.error("There was an error fetching the consumer names:", error);
    }
  };

  useEffect(() => {
    // Fetch consumer names on component mount
    fetchConsumerNames();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch("https://dairy-mern-1.onrender.com//consumerssale", {
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(
          "Expected JSON response, but received unexpected content type"
        );
      }

      const data = await response.json();

      // Handle empty data
      if (data.length === 0) {
        console.log("No data available"); // Log a message or handle it in the UI
        setExpenses([]); // Set an empty state for expenses
        return;
      }

      const processedData = data.map((expense) => ({
        ...expense,
        Quantity: parseFloat(expense.Quantity),
        UnitPrice: parseFloat(expense.UnitPrice),
        Total: expense.Total ? parseFloat(expense.Total).toFixed(2) : undefined,
      }));

      setExpenses(processedData);
    } catch (error) {
      console.error("There was an error fetching the sales data:", error);
    }
  };

  useEffect(() => {
    // Now you can call fetchData inside useEffect
    fetchData();
  }, []); // The empty dependency array ensures this runs only on mount

  // ... rest of your component

  const generateReport = () => {
    const reportData = expenses
      .map((expense) => {
        const date = new Date(expense.Date).toLocaleDateString();
        const name = expense.Name;
        const quantity = expense.Quantity;
        const unitPrice = expense.UnitPrice;
        const total = expense.Total;

        return language === "English"
          ? `Date: ${date}, Name: ${name}, Quantity: ${quantity}, Price per kilo: ${unitPrice}, Total: ${total}`
          : `تاریخ: ${date}, نام: ${name}, مقدار: ${quantity}, فی کلو قیمت: ${unitPrice}, کل: ${total}`;
      })
      .join("\n");

    const reportHeader =
      language === "English"
        ? `${translations[language].title}\n\n`
        : `${translations[language].title}\n\n`;

    return reportHeader + reportData;
  };

  // Handle download report
  const handleDownloadReport = () => {
    const report = generateReport();
    const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
    saveAs(blob, `ConsumerSalesReport_${language}.txt`);
  };

  const [date, setDate] = useState(() => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
    const year = today.getFullYear();

    return `${year}-${month}-${day}`;
  });
  const toggleMonthlySalesVisibility = () => {
    setShowMonthlySales((prevShow) => !prevShow); // Toggle the visibility state
  };

  const toggleGroupVisibility = (monthYear) => {
    setGlobalVisibility((prevGlobalState) => {
      if (!prevGlobalState) {
        // If global visibility is off, ensure it stays off and don't toggle individual groups
        console.warn(
          "Global visibility is off. Can't toggle individual group visibility."
        );
        return prevGlobalState;
      }

      // If global visibility is on, toggle the specific month/year group
      setGroupVisibility((prevGroupVisibility) => ({
        ...prevGroupVisibility,
        [monthYear]: !prevGroupVisibility[monthYear],
      }));

      return prevGlobalState; // Return the unchanged global state
    });
  };
  const CustomModal = ({ message, onClose }) => {
    return (
      <div className="custom-modal-overlay">
        <div className="custom-modal">
          <div className="custom-modal-content">
            <p>{message}</p>
            <button onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    );
  };

  // Group expenses by month and year
  const groupedExpenses = expenses.reduce((acc, expense) => {
    // Ensure the date string is in the correct format (YYYY-MM-DD)
    const expenseDate = expense.Date; // Adjust if the API gives a different property name for the date
    const date = new Date(expenseDate);

    if (isNaN(date.getTime())) {
      console.error("Invalid date for expense:", expense);
      return acc; // Skip this expense if the date is invalid
    }

    const monthYear = `${date.toLocaleString("default", {
      month: "long",
      year: "numeric",
    })}`;
    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }
    acc[monthYear].push(expense);

    return acc;
  }, {});

  const updateBaqaya = async (consumerName, totalAmount) => {
    try {
      // Fetch the consumer's data from ConsumerKhata using the consumer's name
      const response = await fetch(
        `https://dairy-mern-1.onrender.com//consumerkhata?name=${encodeURIComponent(
          consumerName
        )}`
      );

      if (!response.ok) {
        throw new Error(`Error fetching consumer data for ${consumerName}`);
      }

      const consumerData = await response.json();

      // Find a matching consumer based on the name
      const matchingConsumer = consumerData.find(
        (consumer) => consumer.name.toLowerCase() === consumerName.toLowerCase()
      );

      if (!matchingConsumer) {
        console.error(`No consumer found with the name ${consumerName}`);
        return; // No match, so no update
      }

      // Update the Baqaya of the matching consumer
      const updatedBaqaya =
        (parseFloat(matchingConsumer.baqaya) || 0) + totalAmount;

      // Now update the baqaya for this consumer
      const updateResponse = await fetch(
        `https://dairy-mern-1.onrender.com//consumerkhata/${matchingConsumer._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...matchingConsumer, baqaya: updatedBaqaya }),
        }
      );

      if (!updateResponse.ok) {
        throw new Error(`Error updating Baqaya for ${consumerName}`);
      }

      console.log(`Baqaya updated successfully for ${consumerName}`);
    } catch (error) {
      console.error("Error updating Baqaya:", error);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
  
    // Ensure required fields are filled
    if (!source || !quantity || !amount) {
      console.error("Missing required fields.");
      return;
    }
  
    const expensePayload = {
      Date: date,
      Name: source,
      Quantity: parseFloat(quantity),
      UnitPrice: parseFloat(amount),
    };
  
    // Calculate total price
    const total = parseFloat(quantity) * parseFloat(amount);
  
    try {
      let response;
  
      if (editIndex >= 0) {
        // This means we're updating an existing sale
        const previousExpense = expenses[editIndex]; // Get the existing data before the update
        const previousTotal = parseFloat(previousExpense.Quantity) * parseFloat(previousExpense.UnitPrice); // Calculate previous total
  
        // PUT request to update an existing expense
        const expenseId = previousExpense._id || previousExpense.idConsumersSale; // Get the correct ID
        response = await fetch(`https://dairy-mern-1.onrender.com//consumerssale/${expenseId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(expensePayload),
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        // If the consumer's name has changed, adjust baqaya for both old and new consumers
        if (previousExpense.Name !== source) {
          console.log("Consumer name changed, updating both consumers.");
  
          // Step 1: Adjust baqaya for the previous consumer
          await updateBaqaya(previousExpense.Name, -previousTotal);
  
          // Step 2: Adjust baqaya for the new consumer
          await updateBaqaya(source, total);
        } else {
          // If only the quantity or price changed, update baqaya accordingly
          console.log("Consumer name unchanged, adjusting baqaya for the same consumer.");
          await updateBaqaya(source, total - previousTotal); // Adjust the difference between the old and new total
        }
  
        // Show alert for successful update
        const alertMessage = `Sale for ${previousExpense.Name} has been updated.`;
        setModalMessage(alertMessage);  // Show modal with update message
        setShowModal(true);  // Display modal
  
        console.log("Sale updated successfully");
      } else {
        // This means we're adding a new sale (POST request)
        response = await fetch("https://dairy-mern-1.onrender.com//consumerssale", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(expensePayload),
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        const alertMessage = `${quantity} ${translations[language].KiloMilk} ${translations[language].added}`;
        setModalMessage(alertMessage);
        setShowModal(true);
  
        // Call the function to update Baqaya for the new sale
        await updateBaqaya(source, total);
      }
  
      // Refresh data after saving
      await fetchData();
  
      // Reset form fields and clear editIndex to signify we're no longer editing
      setSource("");
      setQuantity("");
      setAmount("");
      setEditIndex(-1);
    } catch (error) {
      console.error("There was an error saving or updating the sale:", error);
    }
  };

  
  const handleDelete = (index) => {
    setShowAlert(true);
    setDeleteIndex(index);
  };

  const handleAlertConfirm = async (isConfirmed) => {
    if (isConfirmed && deleteIndex != null) {
      const expense = expenses[deleteIndex];
      if (expense && expense._id) {
        try {
          // Step 1: Fetch the consumer's data from ConsumerKhata using the consumer's name (expense.Name)
          const consumerResponse = await fetch(
            `https://dairy-mern-1.onrender.com/consumerkhata?name=${encodeURIComponent(expense.Name)}`
          );
          
          if (!consumerResponse.ok) {
            throw new Error(`Error fetching consumer data for ${expense.Name}`);
          }
  
          const consumerData = await consumerResponse.json();
  
          // Step 2: Ensure we are matching the correct consumer based on the name and other properties
          const consumer = consumerData.find(
            (c) => c.name === expense.Name // Match consumer exactly by name
          );
  
          if (!consumer) {
            console.error(`No exact consumer match found for ${expense.Name}`);
            return;
          }
  
          // Step 3: Calculate the sale amount and update the baqaya
          const saleAmount = parseFloat(expense.Quantity) * parseFloat(expense.UnitPrice);
          const updatedBaqaya = (parseFloat(consumer.baqaya) || 0) - saleAmount;
  
          console.log(`Updating baqaya for ${consumer.name}, sale amount: ${saleAmount}, new baqaya: ${updatedBaqaya}`);
  
          // Step 4: Update the consumer's baqaya
          const updateResponse = await fetch(
            `http://localhost:3001/consumerkhata/${consumer._id}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ ...consumer, baqaya: updatedBaqaya }),
            }
          );
  
          if (!updateResponse.ok) {
            throw new Error(`Error updating baqaya for ${expense.Name}`);
          }
  
          console.log(`Baqaya updated successfully for ${expense.Name}`);
  
          // Step 5: Delete the sale from the consumerssale collection
          const deleteResponse = await fetch(
            `http://localhost:3001/consumerssale/${expense._id}`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
  
          if (!deleteResponse.ok) {
            throw new Error(`HTTP error! status: ${deleteResponse.status}`);
          }
  
          const result = await deleteResponse.json();
          console.log(result.message); // Log the message from the backend
  
          // Step 6: Refresh the expenses list after deleting an expense
          await fetchData();
        } catch (error) {
          console.error("There was an error deleting the sale or updating baqaya:", error);
        }
      } else {
        console.error("Attempted to delete an expense without a valid ID");
      }
    }
  
    // Reset the state regardless of whether the delete was successful or not
    setDeleteIndex(null);
    setShowAlert(false);
  };
  

  const getMonthlyExpenses = () => {
    const monthlyExpenses = expenses.reduce((acc, expense) => {
      // Check if the date is valid
      const date = new Date(expense.Date);
      if (isNaN(date.getTime())) {
        console.error("Invalid date for expense:", expense);
        return acc; // Skip this expense if the date is invalid
      }

      const monthYear = `${date.toLocaleString("default", {
        month: "long",
      })} ${date.getFullYear()}`;
      const expenseQuantity = parseFloat(expense.Quantity);
      const expenseUnitPrice = parseFloat(expense.UnitPrice);
      const monthlyTotal =
        !isNaN(expenseQuantity) && !isNaN(expenseUnitPrice)
          ? expenseQuantity * expenseUnitPrice
          : 0;

      if (!acc[monthYear]) {
        acc[monthYear] = 0;
      }

      acc[monthYear] += monthlyTotal;

      return acc;
    }, {});

    return monthlyExpenses;
  };

  const getOverallExpenses = () => {
    return expenses.reduce((acc, expense) => {
      const expenseQuantity = parseFloat(expense.Quantity);
      const expenseUnitPrice = parseFloat(expense.UnitPrice);
      const total =
        expenseQuantity && expenseUnitPrice
          ? expenseQuantity * expenseUnitPrice
          : 0;
      return acc + total;
    }, 0);
  };

  const handleUpdate = (index) => {
    const expense = expenses[index];
    // Adjust these property names to match your actual expense object structure
    setDate(new Date(expense.Date).toISOString().split("T")[0]);
    setSource(expense.Name); // Assuming the consumer name property is named "Name"
    setQuantity(expense.Quantity.toString()); // Assuming the quantity property is named "Quantity"
    setAmount(expense.UnitPrice.toString()); // Assuming the unit price property is named "UnitPrice"
    setEditIndex(index);
  };
  const toggleGlobalVisibility = () => {
    setGlobalVisibility((prevState) => {
      const newState = !prevState;
      // Update all group visibilities based on the new global state
      const newGroupVisibility = Object.keys(groupVisibility).reduce(
        (acc, key) => {
          acc[key] = newState; // Show or hide all based on the new global state
          return acc;
        },
        {}
      );

      setGroupVisibility(newGroupVisibility);
      return newState;
    });
  };

  return (
    <div className="expenditure-container">
      <button onClick={() => navigate("/")} className="back-arrow">
        &#8592;
      </button>
      <h1 className="expenditure-title">{translations[language].title}</h1>
      <button
        onClick={() =>
          setLanguage((lang) => (lang === "English" ? "Urdu" : "English"))
        }
        className="language-toggle"
      >
        {language === "English" ? "اردو" : "English"}
      </button>
      <form className="expenditure-form" onSubmit={handleSave}>
        <label htmlFor="date" className="expenditure-label">
          {translations[language].date}:
        </label>
        <input
          type="date"
          id="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="expenditure-input date-input"
          required
        />

        <label htmlFor="source" className="expenditure-label">
          {translations[language].name}:
        </label>
        <select
          id="source"
          value={source}
          onChange={(e) => setSource(e.target.value)} // This updates the source when the user selects an option
          className="expenditure-input"
          required // Makes sure the user selects an option
        >
          <option value="" disabled>
            Select Consumer Name
          </option>{" "}
          {/* Default option */}
          {consumerNames.map((name, index) => (
            <option key={index} value={name}>
              {name}
            </option>
          ))}
        </select>

        <label htmlFor="quantity" className="expenditure-label">
          {translations[language].quantity}:
        </label>
        <input
          type="number"
          id="quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="expenditure-input"
          placeholder={translations[language].Quantity}
          required
        />

        <label htmlFor="amount" className="expenditure-label">
          {translations[language].pricePerKilo}:
        </label>
        <input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="expenditure-input"
          placeholder={translations[language].price}
          required
        />

        <button type="submit" className="save-button">
          {translations[language].save}
        </button>
      </form>
      {showModal && (
        <CustomModal
          message={modalMessage}
          onClose={() => setShowModal(false)}
        />
      )}
      <div className="expenses-report">
        <h4>{translations[language].monthlyConsumerSale}:</h4>

        <button
          onClick={toggleMonthlySalesVisibility}
          className="toggle-all-button"
        >
          {showMonthlySales
            ? translations[language].hideAll
            : translations[language].showAll}
        </button>

        {showMonthlySales &&
          Object.entries(getMonthlyExpenses()).map(([monthYear, total]) => {
            // Split month and year
            const [month, year] = monthYear.split(" ");

            // Translate the month name if available, otherwise, use the original name
            const translatedMonth =
              language === "Urdu" ? monthTranslations[month] || month : month;

            // Combine translated month and year
            const translatedMonthYear = `${translatedMonth} ${year}`;

            return (
              <div key={monthYear} style={{ color: "green" }}>
                {translations[language].monthlySales} {translatedMonthYear} :{" "}
                {total}
              </div>
            );
          })}

        <h4>
          {translations[language].overallConsumerSale}:<br />
          <span style={{ color: "green" }}>{getOverallExpenses()}</span>
        </h4>
      </div>
      <button onClick={toggleGlobalVisibility} className="global-toggle-button">
        {globalVisibility
          ? translations[language].hide1
          : translations[language].show1}
      </button>

      <button onClick={handleDownloadReport} className="download-button">
        {translations[language].download}
      </button>

      {globalVisibility &&
        Object.entries(groupedExpenses).map(([monthYear, expensesList]) =>
          // Your existing map function
          (() => {
            // Move the statements outside of JSX
            const monthYearArray = monthYear.split(" ");
            const month = monthYearArray[0];
            const year = monthYearArray[1];

            // Translate the month name if the current language is Urdu
            const translatedMonthName =
              language === "Urdu" ? monthTranslations[month] || month : month;

            // Reconstruct the monthYear string with the possibly translated month name
            const displayMonthYear = `${translatedMonthName} ${year}`;

            return (
              <div key={monthYear}>
                <h3 style={{ marginTop: 15 }}>
                  {displayMonthYear}
                  <button
                    onClick={() => toggleGroupVisibility(monthYear)}
                    className="toggle-button"
                  >
                    {groupVisibility[monthYear]
                      ? translations[language].hide
                      : translations[language].show}
                  </button>
                </h3>
                {groupVisibility[monthYear] && (
                  <div className="expenses-display">
                    {expensesList.map((expense, index) => {
                      const actualIndex = expenses.findIndex(
                        (e) => e === expense
                      );
                      const total =
                        !isNaN(expense.Quantity) && !isNaN(expense.UnitPrice)
                          ? (expense.Quantity * expense.UnitPrice).toFixed(2)
                          : "N/A";
                      return (
                        <div key={index} className="expense-card">
                          <div>
                            {translations[language].date}:{" "}
                            {new Date(expense.Date).toLocaleDateString()}
                          </div>
                          <div>
                            {translations[language].consumerName}:{" "}
                            {expense.Name}
                          </div>
                          <div>
                            {translations[language].quantity}:{" "}
                            {Number.isFinite(expense.Quantity)
                              ? expense.Quantity
                              : "N/A"}
                          </div>
                          <div>
                            {translations[language].pricePerKilo}:{" "}
                            {Number.isFinite(expense.UnitPrice)
                              ? expense.UnitPrice
                              : "N/A"}
                          </div>
                          <div>
                            {translations[language].total}: {expense.Total}
                          </div>

                          <button
                            onClick={() => handleDelete(actualIndex)}
                            className="delete-button1"
                          >
                            {translations[language].delete}
                          </button>
                          <button
                            onClick={() => handleUpdate(actualIndex)}
                            className="update-button"
                          >
                            {translations[language].update}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()
        )}

      {showAlert && (
        <div className="alert-dialog">
          <p>{translations[language].deletePrompt}</p>
          <button
            onClick={() => handleAlertConfirm(true)}
            className="confirm-yes"
          >
            {translations[language].yes}
          </button>
          <button
            onClick={() => handleAlertConfirm(false)}
            className="confirm-no"
          >
            {translations[language].no}
          </button>
        </div>
      )}
    </div>
  );
};

export default ConsumersDales;
