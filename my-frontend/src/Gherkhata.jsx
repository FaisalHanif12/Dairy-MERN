import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function GherKhata() {
  const location = useLocation();
  const navigate = useNavigate();
  const { Rname, totalSales: initialTotalSales } = location.state || {
    Rname: "Unknown",
    totalSales: 0,
  };

  const [wasoolis, setWasoolis] = useState({});
  const [showWasooliForm, setShowWasooliForm] = useState(false);
  const [showWasooli, setShowWasooli] = useState(false);
  const [wasooliDate, setWasooliDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [wasooliAmount, setWasooliAmount] = useState("");
  const [expandedMonths, setExpandedMonths] = useState({});
  const [editingWasooliId, setEditingWasooliId] = useState(null); // Track the ID of the Wasooli being edited
  const [totalSales, setTotalSales] = useState(initialTotalSales);

  useEffect(() => {
    fetchWasoolis();
  }, []);

  // Fetch all Wasoolis for the specific Rname
  const fetchWasoolis = async () => {
    try {
      const response = await fetch(
        `https://api.maherdairy.com/getwasoolis/${Rname}`
      );
      if (!response.ok) {
        throw new Error(`HTTP status ${response.status}`);
      }
      const data = await response.json();

      // Group Wasoolis by month and year
      const groupedWasoolis = data.reduce((acc, wasooli) => {
        const date = new Date(wasooli.date);
        const monthYear = date.toLocaleString("default", {
          month: "long",
          year: "numeric",
        });
        if (!acc[monthYear]) {
          acc[monthYear] = [];
        }
        acc[monthYear].push(wasooli);
        return acc;
      }, {});

      setWasoolis(groupedWasoolis);

      // Recalculate totalSales by subtracting the sum of all Wasoolis
      const totalWasoolis = data.reduce((sum, wasooli) => sum + wasooli.amount, 0);
      setTotalSales(initialTotalSales - totalWasoolis);
    } catch (error) {
      console.error("Error fetching Wasoolis:", error);
    }
  };

  const handleEdit = (wasooli) => {
    setEditingWasooliId(wasooli._id); // Set the ID of the Wasooli being edited
    setWasooliDate(new Date(wasooli.date).toISOString().slice(0, 10)); // Populate the date field
    setWasooliAmount(wasooli.amount); // Populate the amount field
    setShowWasooliForm(true); // Open the input form
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(
        `https://api.maherdairy.com/deletewasooli/${id}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to delete Wasooli: ${response.statusText}`);
      }
      console.log("Wasooli deleted successfully");
      await fetchWasoolis(); // Refresh the list and update totalSales
    } catch (error) {
      console.error("Error deleting Wasooli:", error);
    }
  };

  const handleSaveWasooli = async () => {
    try {
      const newAmount = parseInt(wasooliAmount, 10); // Convert input to a number

      const method = editingWasooliId ? "PUT" : "POST";
      const url = editingWasooliId
        ? `https://api.maherdairy.com/updatewasooli/${editingWasooliId}`
        : "https://api.maherdairy.com/add";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Rname,
          date: wasooliDate,
          amount: newAmount,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to ${editingWasooliId ? "update" : "save"} Wasooli`
        );
      }

      await fetchWasoolis(); // Refresh the Wasooli list and update totalSales

      // Reset form
      setShowWasooliForm(false);
      setWasooliAmount("");
      setWasooliDate(new Date().toISOString().slice(0, 10));
      setEditingWasooliId(null);
    } catch (error) {
      console.error(
        `Error ${editingWasooliId ? "updating" : "saving"} Wasooli:`,
        error
      );
    }
  };

  const toggleMonth = (monthYear) => {
    setExpandedMonths((prev) => ({ ...prev, [monthYear]: !prev[monthYear] }));
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "400px",
          padding: "25px",
          backgroundColor: "#fff",
          borderRadius: "15px",
          boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2)",
          textAlign: "center",
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            position: "absolute",
            left: "15px",
            background: "none",
            border: "none",
            color: "#333",
            fontSize: "24px",
            cursor: "pointer",
            marginTop: "-25px",
          }}
        >
          &#8592;
        </button>
        <h1
          style={{
            color: "#333",
            fontSize: "1.8rem",
            fontWeight: "600",
          }}
        >
          {Rname}'s Khata
        </h1>
        <p
          style={{
            fontSize: "1.2rem",
            color: "#666",
            margin: "10px 0 20px",
          }}
        >
          Total Baqaya:{" "}
          <span style={{ color: "#ff5722", fontWeight: "bold" }}>
            {totalSales}
          </span>
        </p>
        <button
          onClick={() => setShowWasooliForm(true)}
          style={{
            marginTop: "20px",
            padding: "3px 8px",
            backgroundColor: "#4caf50",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "1rem",
            transition: "background 0.3s",
            marginRight: "15px",
          }}
        >
          Add Wasooli
        </button>
        <button
          onClick={() => setShowWasooli(!showWasooli)}
          style={{
            marginTop: "20px",
            padding: "3px 8px",
            backgroundColor: "#2196f3",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "1rem",
            transition: "background 0.3s",
          }}
        >
          {showWasooli ? "Hide Wasooli" : "Show Wasooli"}
        </button>

        {showWasooliForm && (
          <div
            className="input-card"
            style={{
              marginTop: "20px",
              padding: "20px",
              backgroundColor: "#f5f5f5",
              borderRadius: "12px",
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
              position: "relative",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              alignItems: "center",
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowWasooliForm(false)} // Close the input card
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "none",
                border: "none",
                fontSize: "1.5rem",
                color: "#f44336",
                cursor: "pointer",
                fontWeight: "bold",
                transition: "color 0.3s ease",
              }}
              onMouseEnter={(e) => (e.target.style.color = "#d32f2f")}
              onMouseLeave={(e) => (e.target.style.color = "#f44336")}
            >
              &times;
            </button>

            <h3
              style={{
                fontSize: "1.5rem",
                fontWeight: "600",
                color: "#333",
              }}
            >
              Add Wasooli
            </h3>
            <div>
              <label
                style={{
                  fontWeight: "bold",
                  color: "#555",
                  display: "block",
                }}
              >
                Date:
              </label>
              <input
                type="date"
                value={wasooliDate}
                onChange={(e) => setWasooliDate(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  outline: "none",
                  marginTop: "5px",
                }}
              />
            </div>
            <div>
              <label
                style={{
                  fontWeight: "bold",
                  color: "#555",
                  display: "block",
                }}
              >
                Amount:
              </label>
              <input
                type="number"
                value={wasooliAmount}
                onChange={(e) => setWasooliAmount(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  outline: "none",
                  marginTop: "5px",
                }}
              />
            </div>
            <button
              onClick={handleSaveWasooli}
              style={{
                padding: "10px 20px",
                backgroundColor: "#4caf50",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "1rem",
                transition: "background-color 0.3s",
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#45a049")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#4caf50")}
            >
              Save Wasooli
            </button>
          </div>
        )}

        {showWasooli && (
          <div
            className="horizontal-card-container"
            style={{
              marginTop: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {Object.entries(wasoolis).map(([monthYear, entries]) => (
              <div key={monthYear}>
                <button
                  onClick={() => toggleMonth(monthYear)}
                  style={{
                    backgroundColor: "#f5f5f5",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    marginBottom: "10px",
                  }}
                >
                  {monthYear} {expandedMonths[monthYear] ? "▼" : "▶"}
                </button>
                {expandedMonths[monthYear] && (
                  <div>
                    {entries.map((wasooli) => (
                      <div
                        key={wasooli._id}
                        style={{
                          padding: "10px 15px",
                          backgroundColor: "#ffffff",
                          borderRadius: "10px",
                          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                          marginBottom: "10px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span style={{ fontWeight: "600", color: "#555" }}>
                            Date: {new Date(wasooli.date).toLocaleDateString()}
                          </span>
                          <span style={{ fontWeight: "700", color: "#4caf50" }}>
                            Amount: {wasooli.amount}
                          </span>
                        </div>
                        <div
                          style={{
                            marginTop: "10px",
                            display: "flex",
                            justifyContent: "center",
                            gap: "10px",
                          }}
                        >
                          <button
                            onClick={() => handleEdit(wasooli)}
                            style={{
                              padding: "5px 10px",
                              backgroundColor: "#ffc107",
                              color: "#fff",
                              border: "none",
                              borderRadius: "5px",
                              cursor: "pointer",
                              fontWeight: "bold",
                              fontSize: "0.9rem",
                            }}
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(wasooli._id)}
                            style={{
                              padding: "5px 10px",
                              backgroundColor: "#f44336",
                              color: "#fff",
                              border: "none",
                              borderRadius: "5px",
                              cursor: "pointer",
                              fontWeight: "bold",
                              fontSize: "0.9rem",
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default GherKhata;
