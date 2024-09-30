import React, { useState, useEffect } from "react";
import "./Employee.css";
import { useNavigate } from "react-router-dom";
import { saveAs } from 'file-saver'; // Import file-saver to handle file downloads

const Employee = () => {
  const navigate = useNavigate();
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Pad single digit months with a leading 0
    const day = String(today.getDate()).padStart(2, "0"); // Pad single digit days with a leading 0
    return `${year}-${month}-${day}`; // Format must be YYYY-MM-DD
  };

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [consumerData, setConsumerData] = useState({
    date: getTodayDate(),
    consumerName: "",
    baqaya: "",
  });
  const [errorMessages, setErrorMessages] = useState({
    date: "",
    consumerName: "",
    baqaya: "",
  });
  const [isDataSaved, setIsDataSaved] = useState(false);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [isAddBaqayaVisible, setIsAddBaqayaVisible] = useState(false);
  const [baqayaToAdd, setBaqayaToAdd] = useState("");
  const [baqayaError, setBaqayaError] = useState("");
  const [consumers, setConsumers] = useState([]);
  const [selectedConsumerId, setSelectedConsumerId] = useState(null);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [currentManaging, setCurrentManaging] = useState(null);
  const [monthVisibility, setMonthVisibility] = useState({});
  const [language, setLanguage] = useState("English");
  const [monthYearButtonsVisibility, setMonthYearButtonsVisibility] = useState(
    {}
  );
  const [isWasooliVisible, setIsWasooliVisible] = useState(false);
  const [uniqueNames, setUniqueNames] = useState([]);
  const [wasooliData, setWasooliData] = useState({
    date: getTodayDate(),
    source: "",
    wasooli: "",
  });
  // Update this state to also include the wasooliId
  const [deleteConfirmationData, setDeleteConfirmationData] = useState({
    consumerId: null,
    wasooliId: null, // Add this line
    index: null,
  });
  const [editingTransaction, setEditingTransaction] = useState(null);

  const [wasooliErrorMessages, setWasooliErrorMessages] = useState({
    date: "",
    source: "",
    wasooli: "",
  });

  useEffect(() => {
    fetchUniqueNames();
  }, []);

  const fetchUniqueNames = async () => {
    try {
      const response = await fetch("http://localhost:3001/unique-namesk");
      const data = await response.json();
      setUniqueNames(data);
    } catch (error) {
      console.error("Error fetching unique names:", error);
    }
  };

  const translations = {
    English: {
      date: "Date",
      consumerName: "Employee Name",
      baqaya: "Employee Baqaya",
      employeekhata: "Employee Khata",
      pleaseEnterDate: "Please enter a date",
      pleaseEnterConsumerName: "Please enter employee name",
      pleaseEnterBaqaya: "Please enter employee baqaya amount",
      save: "Save",
      Khata: "Khata",
      addEmployee: "Add Employee",
      manage: "Manage",
      addBaqaya: "Add Baqaya",
      update: "Update",
      toggleVisibility: "Toggle Visibility",
      hideAll: "Hide All",
      showAll: "Show All",
      sourceOfKharcha: "Source",
      kharcha: "Kharcha",
      saveKharcha: "Save Kharcha",
      close: "Close",
      addMoreEmployeeBaqaya: "Add more Employee Baqaya",
      confirmAddConsumer: "Are you sure you want to add a new consumer?",
      yes: "Yes",
      no: "No",
      deleteWasooliConfirm: "Are you sure you want to delete this kharcha?",
      close: "Close",
      Show: "Show",
      Hide: "Hide",
      delete: "Delete",
      datee: "Please enter a date",
      consumerNamee: "Please enter employee name",
      baqayaa: "Please enter baqaya amount",
      baqayaNumberr: "Baqaya must be a number",
      wasooliAmountt: "Please fill up the khatcha amount",
      baqayaerror: "Please fill up the baqaya amount",
      downloadReport: "Download Report", // Added for report generation
      totalBaqaya: "Total Baqaya", // Added for total baqaya
    },
    Urdu: {
      date: "تاریخ",
      consumerName: "ملازم کا نام",
      baqaya: "ملازم کا باقیہ",
      consumerKhata: "صارف خاتہ ",
      employeekhata: "خاتہ ملازم ",
      pleaseEnterDate: "براہ کرم تاریخ درج کریں",
      pleaseEnterConsumerName: "براہ کرم ملازم کا نام درج کریں",
      pleaseEnterBaqaya: "براہ کرم ملازم کا باقیہ معلومات درج کریں",
      save: "محفوظ کریں",
      delete: "حذف کریں",
      addEmployee: "ملازم شامل کریں",
      manage: "انتظام کریں",
      addBaqaya: "باقیہ شامل کریں",
      update: "اپ ڈیٹ",
      toggleVisibility: "دکھائیں یا چھپائیں",
      hideAll: "سب چھپائیں",
      showAll: "سب دکھائیں",
      sourceOfKharcha: "خرچے کا ذریعہ",
      kharcha: "خرچہ",
      saveKharcha: "خرچہ محفوظ کریں",
      close: "بند کریں",
      addMoreEmployeeBaqaya: "مزید ملازم کا باقیہ شامل کریں",
      delete: "حذف کریں",
      Khata: "خاتہ",
      confirmAddConsumer: "کیا آپ واقعی نیا صارف شامل کرنا چاہتے ہیں؟",
      yes: "جی ہاں",
      no: "نہیں",
      Khata: "خاتہ",
      Show: "دکھائیں",
      Hide: "چھپائیں",
      deleteWasooliConfirm: "کیا آپ واقعی اس وصولی کو حذف کرنا چاہتے ہیں؟",
      close: "بند کریں",
      datee: "براہ کرم تاریخ درج کریں",
      consumerNamee: "براہ کرم صارف کا نام درج کریں",
      baqayaa: "براہ کرم باقیہ مقدار درج کریں",
      baqayaNumberr: "باقیہ کو نمبر ہونا چاہئے",
      wasooliAmountt: "براہ کرم وصولی کی رقم بھریں",
      wasooliDatee: "تاریخ ضروری ہے",
      baqayaerror: "برائے مہربانی باقیہ رقم بھریں",
      downloadReport: "رپورٹ ", // Added for report generation
      totalBaqaya: "کل باقیہ", // Added for total baqaya
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

  const fetchData = async () => {
    try {
      const response = await fetch("http://localhost:3001/employeekhata");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const consumersData = await response.json();

      // Check the fetched data
      console.log("Fetched consumers data:", consumersData);

      const updatedConsumersData = await Promise.all(
        consumersData.map(async (consumer) => {
          const wasooliResponse = await fetch(
            `http://localhost:3001/kharchay/${consumer._id}`
          );
          if (!wasooliResponse.ok) {
            console.log(
              `Failed to fetch wasooli data for consumer ID: ${consumer.idEmployeekhata}`
            );
            return consumer; // Return the consumer without wasooli data if fetch fails
          }
          const wasooliData = await wasooliResponse.json();
          return { ...consumer, wasooliTransactions: wasooliData };
        })
      );

      // Check the updated consumers data
      console.log("Updated consumers data:", updatedConsumersData);

      // Update state with the processed and fetched data
      setConsumers(updatedConsumersData);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const generateReport = (consumer) => {
    const reportHeader = `${translations[language].employeekhata} - ${consumer.name}\n\n`;
    const reportData = consumer.wasooliTransactions.map((transaction) => {
      const date = new Date(transaction.date).toLocaleDateString();
      const wasooli = transaction.Wasooli;
      const source = transaction.source;

      return `${translations[language].date}: ${date}, ${translations[language].sourceOfKharcha}: ${source}, ${translations[language].kharcha}: ${wasooli}`;
    }).join("\n");

    const totalBaqaya = consumer.baqaya || 0;
    const reportFooter = `\n\n${translations[language].totalBaqaya}: ${totalBaqaya}`;

    return reportHeader + reportData + reportFooter;
  };

  // Function to handle report download
  const handleDownloadReport = (consumer) => {
    const report = generateReport(consumer);
    const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
    saveAs(blob, `EmployeeReport_${consumer.name}_${language}.txt`);
  };

  useEffect(() => {
    console.log(consumers); // Log the state to see if it includes the dates correctly
  }, [consumers]);

  const toggleMonthYearButtonsVisibility = (consumerId) => {
    setMonthYearButtonsVisibility((prevState) => {
      const newState = {
        ...prevState,
        [consumerId]: !prevState[consumerId],
      };

      return newState;
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    // If the input is for baqaya, ensure it's handled as a number
    if (name === "baqaya") {
      newValue = value !== "" ? parseInt(value, 10) : 0;
      if (isNaN(newValue)) {
        setErrorMessages((prevErrors) => ({
          ...prevErrors,
          baqaya: "Baqaya must be a number",
        }));
        return; // Don't set the consumer data if the input is not a number
      }
    }

    setConsumerData((prevData) => ({
      ...prevData,
      [name]: newValue,
    }));

    // Clear any error messages for this input
    setErrorMessages((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
  };

  const handleSaveClick = async () => {
    const { date, consumerName, baqaya, idEmployeekhata } = consumerData;

    // Format the date as 'YYYY-MM-DD'
    const formattedDate = new Date(date).toISOString().split("T")[0];

    if (
      !formattedDate ||
      !consumerName.trim() ||
      isNaN(parseInt(baqaya)) ||
      parseInt(baqaya) < 0
    ) {
      let errors = {
        ...(formattedDate ? null : { date: "Please enter a valid date" }),
        ...(consumerName.trim()
          ? null
          : { consumerName: "Please enter consumer name" }),
        ...(!isNaN(parseInt(baqaya)) && parseInt(baqaya) >= 0
          ? null
          : { baqaya: "Please enter a valid non-negative baqaya amount" }),
      };
      setErrorMessages(errors);
      return;
    }

    const endpoint = idEmployeekhata
      ? `http://localhost:3001/employeekhata/${idEmployeekhata}`
      : "http://localhost:3001/employeekhata";
    const method = idEmployeekhata ? "PUT" : "POST";
    const body = JSON.stringify({
      date: formattedDate, // Ensure lowercase 'date'
      name: consumerName.trim(), // Use lowercase 'name'
      baqaya: parseInt(baqaya), // Convert baqaya to integer and use lowercase
    });

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body,
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      console.log("Update successful", await response.json());
      await fetchData(); // Refresh data
      resetForm(); // Clear form fields
    } catch (error) {
      console.error("Error during fetch:", error);
    }
  };

  const resetForm = () => {
    setConsumerData({
      date: "",
      consumerName: "",
      baqaya: "",
    });
    setIsFormVisible(false);
    setErrorMessages({});
  };

  const handleCancelClick = () => {
    setIsFormVisible(false);
    setIsUpdateMode(false);
  };

  const handleUpdateClick = (id) => {
    const consumerToUpdate = consumers.find((consumer) => consumer._id === id); // Use _id from MongoDB

    if (consumerToUpdate) {
      setConsumerData({
        date: consumerToUpdate.date
          ? new Date(consumerToUpdate.date).toISOString().split("T")[0]
          : "",
        consumerName: consumerToUpdate.name || "",
        baqaya: consumerToUpdate.baqaya || "",
        idEmployeekhata: consumerToUpdate._id, // Use _id for MongoDB update
      });
      setIsUpdateMode(true);
      setIsFormVisible(true);
    } else {
      console.error("No consumer found with ID:", id);
    }
  };

  const handleAddBaqayaClick = () => {
    setIsAddBaqayaVisible(true);
  };

  const handleBaqayaInputChange = (e) => {
    const { value } = e.target;
    setBaqayaToAdd(value);
    setBaqayaError("");
  };

  const handleSaveBaqayaClick = async () => {
    if (!baqayaToAdd) {
      setBaqayaError("Please fill the Baqaya field");
      return;
    }

    const newBaqayaAmount = parseInt(baqayaToAdd);
    if (isNaN(newBaqayaAmount)) {
      setBaqayaError("Invalid Baqaya amount");
      return;
    }

    // Find the consumer to update
    const consumerToUpdate = consumers.find(
      (consumer) => consumer._id === selectedConsumerId
    );
    if (!consumerToUpdate) {
      console.error("Consumer not found");
      return;
    }

    // Ensure consumerToUpdate.baqaya is a number
    const currentBaqaya = parseInt(consumerToUpdate.baqaya) || 0;

    // Calculate updated baqaya
    const updatedBaqaya = currentBaqaya + newBaqayaAmount;

    // Corrected URL in the fetch request
    try {
      const response = await fetch(
        `http://localhost:3001/employeekhata/${selectedConsumerId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: consumerToUpdate.date, // Ensure date is included and correctly formatted
            name: consumerToUpdate.name,
            baqaya: updatedBaqaya, // Updated baqaya
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Update local state and UI
      const updatedConsumers = consumers.map((consumer) =>
        consumer._id === selectedConsumerId
          ? { ...consumer, baqaya: updatedBaqaya.toString() }
          : consumer
      );

      setConsumers(updatedConsumers);
      setIsDataSaved(true);
      setBaqayaToAdd("");
      setIsAddBaqayaVisible(false);
      setBaqayaError("");
      fetchData(); // Refresh data after the update
    } catch (error) {
      console.error("Error updating baqaya:", error);
      setBaqayaError("Failed to update baqaya");
    }
  };

  const handleUpdateWasooliClick = (consumerId, transactionId) => {
    if (!consumerId || !transactionId) {
      console.error("Missing consumer ID or transaction ID");
      return;
    }

    const consumer = consumers.find((consumer) => consumer._id === consumerId);
    if (!consumer) {
      console.error("Consumer not found for ID:", consumerId);
      setIsAlertVisible(true);
      setAlertMessage("Error: Consumer not found");
      return;
    }

    const selectedWasooliCard = consumer.wasooliTransactions.find(
      (txn) => txn._id.toString() === transactionId.toString()
    );
    if (!selectedWasooliCard) {
      console.error("Wasooli transaction not found for ID:", transactionId);
      return;
    }

    // Ensure the date is properly formatted to 'YYYY-MM-DD'
    const formattedDate = new Date(selectedWasooliCard.date)
      .toISOString()
      .slice(0, 10);

    // Update state with Wasooli data and store transaction ID for update
    setWasooliData({
      date: formattedDate, // Ensure date is in 'YYYY-MM-DD' format
      source: selectedWasooliCard.source || "", // Fallback if undefined
      wasooli: selectedWasooliCard.Wasooli
        ? selectedWasooliCard.Wasooli.toString()
        : "", // Fallback if undefined
    });

    setEditingTransaction({
      consumerId: consumerId,
      transactionId: transactionId,
    });

    setSelectedConsumerId(consumerId);
    setCurrentManaging(consumerId);
    setIsWasooliVisible(true);
  };

  const handleManageClick = (consumerId) => {
    const today = new Date().toISOString().split("T")[0]; // Get today's date in 'YYYY-MM-DD' format

    setSelectedConsumerId(consumerId);
    setIsWasooliVisible(true);
    setCurrentManaging(consumerId);

    // Reset Wasooli form data and prefill the date field with today's date
    setWasooliData({ date: today, source: "", Wasooli: "" });
  };

  const handleWasooliInputChange = (e) => {
    const { name, value } = e.target;
    setWasooliData({ ...wasooliData, [name]: value });
    setWasooliErrorMessages({ ...wasooliErrorMessages, [name]: "" });
  };

  const handleConfirmDeletion = async () => {
    const { consumerId, wasooliId, index } = deleteConfirmationData;

    if (!wasooliId) {
      console.error("Wasooli ID is missing.");
      return;
    }

    try {
      // Delete the Wasooli transaction
      const deleteResponse = await fetch(
        `http://localhost:3001/kharchay/${wasooliId}`,
        { method: "DELETE" }
      );

      if (!deleteResponse.ok) {
        const errorData = await deleteResponse.json();
        throw new Error(
          errorData.message || "Failed to delete Wasooli transaction."
        );
      }

      console.log("Wasooli transaction deleted successfully.");

      // Re-fetch updated consumer data to refresh local state
      await fetchData();

      console.log("Consumer data refreshed after Wasooli deletion.");

      // Reset the delete confirmation data and close the modal
      setDeleteConfirmationData({
        consumerId: null,
        wasooliId: null,
        index: null,
      });
      setIsConfirmModalVisible(false);
    } catch (error) {
      console.error("Error during Wasooli deletion:", error);
    }
  };

  const handleCancelDeletion = () => {
    setIsConfirmModalVisible(false); // Hide the modal
  };

  const handleDeleteWasooliClick = (consumerId, wasooliId, index) => {
    // Log the parameters to ensure they are being passed correctly
    console.log(
      `Preparing to delete Wasooli with ID: ${wasooliId}, for Consumer ID: ${consumerId}, at Index: ${index}`
    );

    // Set the deleteConfirmationData with the correct values
    setDeleteConfirmationData({ consumerId, wasooliId, index });
    setIsConfirmModalVisible(true);
  };

  const AlertModal = ({ isOpen, message, onClose }) => {
    if (!isOpen) return null;

    return (
      <div className="alert-modal-overlay">
        <div className="alert-modal">
          <p>{message}</p>
          <button onClick={onClose}>OK</button>
        </div>
      </div>
    );
  };

  const ConfirmationModal = ({ onConfirm, onCancel }) => (
    <div className="confirmation-modal-overlay">
      <div className="confirmation-modal">
        <p>Are you sure you want to delete this kharcha?</p>
        <button className="yes-button" onClick={onConfirm}>
          Yes
        </button>
        <button className="no-button" onClick={onCancel}>
          No
        </button>
      </div>
    </div>
  );

  const handleSaveWasooliClick = async () => {
    try {
      if (!wasooliData.date) {
        throw new Error("Date is required");
      }

      if (!wasooliData.source) {
        throw new Error("source is required");
      }

      const wasooliAmount = parseInt(wasooliData.wasooli);
      if (isNaN(wasooliAmount) || wasooliAmount <= 0) {
        throw new Error("Invalid Kharcha amount");
      }
      let payload = {
        date: wasooliData.date,
        source: wasooliData.source,
        Wasooli: wasooliAmount,
      };

      let endpoint = "http://localhost:3001/kharchay";
      let method = "POST";

      // If we're editing an existing transaction, adjust the endpoint and method.
      // Otherwise, ensure the consumer ID is included in the payload for new transactions.
      if (editingTransaction && editingTransaction.transactionId) {
        endpoint += `/${editingTransaction.transactionId}`;
        method = "PUT";
      } else {
        // For new transactions, include the consumerId in the payload
        if (!selectedConsumerId) {
          throw new Error("Consumer ID is missing for new Wasooli transaction");
        }
        payload = { ...payload, consumerId: selectedConsumerId };
      }

      const response = await fetch(endpoint, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to save Wasooli transaction"
        );
      }

      console.log("Wasooli transaction saved:", await response.json());

      setIsWasooliVisible(false);
      setWasooliData({ date: "", source: "", wasooli: "" });
      setEditingTransaction(null);
      await fetchData();
    } catch (error) {
      console.error("Error saving Wasooli transaction:", error);
      setIsAlertVisible(true);
      setAlertMessage(error.toString());
    }
  };
  const groupTransactionsByDate = (transactions) => {
    const grouped = {};
    transactions.forEach((transaction) => {
      const yearMonth = new Date(transaction.date)
        .toISOString()
        .substring(0, 7); // e.g., "2024-01"
      if (!grouped[yearMonth]) {
        grouped[yearMonth] = {
          transactions: [],
          isVisible: false,
        };
      }
      grouped[yearMonth].transactions.push(transaction);
    });
    return grouped;
  };

  const toggleMonthVisibility = (consumerId, monthYear) => {
    setMonthVisibility((prevVisibility) => ({
      ...prevVisibility,
      [consumerId]: {
        ...prevVisibility[consumerId],
        [monthYear]: !(prevVisibility[consumerId]?.[monthYear] ?? false),
      },
    }));
  };

  const renderWasooliTransactions = (consumer) => {
    // Group Wasooli transactions by month and year
    const transactionsByMonth = consumer.wasooliTransactions.reduce(
      (acc, transaction) => {
        const monthYear = new Date(transaction.date).toLocaleString("default", {
          month: "long",
          year: "numeric",
        });
        if (!acc[monthYear]) {
          acc[monthYear] = [];
        }
        acc[monthYear].push(transaction);
        return acc;
      },
      {}
    );

    return Object.entries(transactionsByMonth).map(
      ([monthYear, transactions]) => {
        const isButtonVisible = monthYearButtonsVisibility[consumer._id];
        const isDataVisible =
          monthVisibility[consumer._id]?.[monthYear] ?? false;

        return (
          <div key={monthYear}>
            {isButtonVisible && (
              <button
                className="toggle-visibility-button"
                onClick={() => toggleMonthVisibility(consumer._id, monthYear)}
              >
                {isDataVisible
                  ? translations[language].Hide
                  : translations[language].Show}{" "}
                {monthYear}
              </button>
            )}
            {isDataVisible &&
              transactions.map((transaction, index) => (
                <div className="wasooli-card-horizontal" key={index}>
                  <span>
                    {" "}
                    {translations[language].date} :{" "}
                    {new Date(transaction.date).toLocaleDateString()}
                  </span>
                  <span>
                    {" "}
                    {translations[language].sourceOfKharcha}{" "}
                    {transaction.source}
                  </span>
                  <span>
                    {" "}
                    {translations[language].kharcha} {transaction.Wasooli}
                  </span>
                  <button
                    className="updatee-button"
                    onClick={() =>
                      handleUpdateWasooliClick(consumer._id, transaction._id)
                    }
                  >
                    {translations[language].update}
                  </button>
                  <button
                    className="deletee-button"
                    onClick={() =>
                      handleDeleteWasooliClick(consumer._id, transaction._id)
                    }
                  >
                    {translations[language].delete}
                  </button>
                </div>
              ))}
          </div>
        );
      }
    );
  };

  return (
    <div className="consumer-khata-container">
      <button onClick={() => navigate("/")} className="back-arrow1">
        &#8592;
      </button>
      <h1 className="header"> {translations[language].employeekhata}</h1>
      <button
        onClick={() =>
          setLanguage((lang) => (lang === "English" ? "Urdu" : "English"))
        }
        className="language-toggle"
      >
        {language === "English" ? "اردو" : "English"}
      </button>
      {isConfirmModalVisible && (
        <ConfirmationModal
          onConfirm={handleConfirmDeletion}
          onCancel={handleCancelDeletion}
        />
      )}
      <AlertModal
        isOpen={isAlertVisible}
        message={alertMessage}
        onClose={() => setIsAlertVisible(false)}
      />
      {consumers.map((consumer) => (
        <div className="consumer-card" key={consumer._id}>
          <h2 className="consumer-name">
            {consumer.name} {translations[language].Khata}
          </h2>
          <p>
            {translations[language].date} :{" "}
            {consumer.date
              ? new Date(consumer.date).toLocaleDateString()
              : "N/A"}
          </p>

          <p>
            {translations[language].consumerName} : {consumer.name}
          </p>
          <p>
            {" "}
            {translations[language].baqaya} : {consumer.baqaya}
          </p>
          <div className="action-buttons">
            <button
              className="manage-buttonn"
              onClick={() => handleManageClick(consumer._id)}
            >
              {translations[language].manage}
            </button>
            <button
              className="add-baqaya-buttonn"
              onClick={() => {
                setIsAddBaqayaVisible(true);
                setSelectedConsumerId(consumer._id); // Ensure this is set when opening the Baqaya add form
              }}
            >
              {translations[language].addBaqaya}
            </button>
            <button
              className="update-buttonn"
              onClick={() => handleUpdateClick(consumer._id)}
            >
              {translations[language].update}
            </button>

            <button
              className="common-button"
              onClick={() => toggleMonthYearButtonsVisibility(consumer._id)}
            >
              {monthYearButtonsVisibility[consumer._id]
                ? translations[language].hideAll
                : translations[language].showAll}
            </button>

            <button
            className="common-button"
            onClick={() => handleDownloadReport(consumer)}
          >
            {translations[language].downloadReport}
          </button>


          </div>
          {renderWasooliTransactions(consumer)}

          {currentManaging === consumer._id && isWasooliVisible && (
            <div className="form-container wasooli-card">
              <h2> {translations[language].kharcha}</h2>
              <button
                className="close-button"
                onClick={() => setIsWasooliVisible(false)}
              >
                &#10005;
              </button>
              <span className="error-message">{wasooliErrorMessages.date}</span>
              <input
                type="date"
                name="date"
                placeholder={translations[language].date}
                value={wasooliData.date || ""}
                onChange={handleWasooliInputChange}
              />
              <span className="error-message">
                {wasooliErrorMessages.source}
              </span>
              <input
                type="text"
                name="source"
                list="consumerNames"
                placeholder={translations[language].sourceOfKharcha}
                value={wasooliData.source || ""}
                onChange={handleWasooliInputChange}
              />

              <datalist id="consumerNames">
                {uniqueNames.length > 0 ? (
                  uniqueNames.map((name, index) => (
                    <option key={index} value={name} />
                  ))
                ) : (
                  <option value="No names available" />
                )}
              </datalist>

              <span className="error-message">
                {wasooliErrorMessages.wasooli}
              </span>
              <input
                type="number"
                name="wasooli"
                placeholder={translations[language].kharcha}
                value={wasooliData.wasooli}
                onChange={handleWasooliInputChange}
              />

              <button
                className="save-button"
                onClick={(e) => {
                  e.preventDefault();
                  handleSaveWasooliClick();
                }}
              >
                {translations[language].saveKharcha}
              </button>
            </div>
          )}

          {selectedConsumerId === consumer._id && isAddBaqayaVisible && (
            <div className="add-baqaya-card">
              <button
                className="close-button"
                onClick={() => setIsAddBaqayaVisible(false)}
              >
                &#10005;
              </button>
              <span className="error-message">{baqayaError}</span>
              <input
                type="number"
                placeholder={translations[language].addMoreEmployeeBaqaya}
                value={baqayaToAdd}
                onChange={handleBaqayaInputChange}
              />

              <button
                className="save-baqaya-button"
                onClick={handleSaveBaqayaClick}
              >
                {translations[language].save}
              </button>
            </div>
          )}
        </div>
      ))}

      {isFormVisible && (
        <div className="form-container">
          <button className="close-button" onClick={handleCancelClick}>
            &#10005;
          </button>
          <span className="error-message">{errorMessages.date}</span>
          <input
            type="date"
            name="date"
            placeholder="Enter Date"
            value={consumerData.date || ""}
            onChange={handleInputChange}
          />

          <span className="error-message">{errorMessages.consumerName}</span>
          <input
            type="text"
            name="consumerName"
            placeholder="Employee Name"
            value={consumerData.consumerName}
            onChange={handleInputChange}
          />

          <span className="error-message">{errorMessages.baqaya}</span>
          <input
            type="text"
            name="baqaya"
            placeholder="Employee Baqaya"
            value={consumerData.baqaya}
            onChange={handleInputChange}
          />

          <button className="save-button" onClick={handleSaveClick}>
            {translations[language].save}
          </button>
        </div>
      )}
      <button className="add-button" onClick={() => setIsFormVisible(true)}>
        {translations[language].addEmployee}
      </button>
    </div>
  );
};

export default Employee;
