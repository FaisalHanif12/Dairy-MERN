const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3001; // Change to 3002 or any available port

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('Connected to MongoDB Atlas');
})
.catch((err) => {
    console.error('Error connecting to MongoDB:', err);
});

// Middleware to parse JSON bodies
app.use(express.json());

const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001' , 'https://maher-dairy.vercel.app' , 
  'https://dairy-mern-1.onrender.com'];
const corsOptionsDelegate = function (req, callback) {
  let corsOptions;
  let isDomainAllowed = allowedOrigins.includes(req.header('Origin'));
  if (isDomainAllowed) {
    corsOptions = { origin: true };
  } else {
    corsOptions = { origin: false };
  }
  callback(null, corsOptions);
};

app.use(cors(corsOptionsDelegate));


const ConsumerSale = require('./models/ConsumerSale');
const RelativeSale = require('./models/RelativeSale');  // Make sure this line is correct
const Expenditure = require('./models/Expenditure');
const ConsumerKhata = require('./models/ConsumerKhata');
const EmployeeKhata = require('./models/EmployeeKhata');
const SalesSummary = require('./models/SalesSummary');
const Wasoolii = require('./models/Wasooli'); // Adjust the path based on where this file is located.
const Kharchay = require('./models/Kharchay'); // Adjust the path based on where this file is located.

async function updateSalesSummary() {
    try {
        // Calculate total sales from consumers
        const totalSalesConsumers = await ConsumerSale.aggregate([
            { $group: { _id: null, total: { $sum: "$Total" }, totalMilk: { $sum: "$Quantity" } } }
        ]);

        // Calculate total sales from relatives
        const totalSalesRelatives = await RelativeSale.aggregate([
            { $group: { _id: null, total: { $sum: "$RTotal" }, totalMilk: { $sum: "$Quantity" } } }
        ]);

        // Calculate total expenditures from Expenditure collection
        const totalExpendituresFromExpenditure = await Expenditure.aggregate([
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        // Calculate total Wasooli from Kharchay collection
        const totalExpendituresFromKharchays = await Kharchay.aggregate([
            { $group: { _id: null, total: { $sum: "$Wasooli" } } }
        ]);

     
        // Check if both aggregation results return values
        const totalExpenditureFromExpenditure = totalExpendituresFromExpenditure.length > 0 ? totalExpendituresFromExpenditure[0].total : 0;
        const totalExpenditureFromKharchays = totalExpendituresFromKharchays.length > 0 ? totalExpendituresFromKharchays[0].total : 0;

        // Calculate the total expenditure by summing up values from both collections
        const totalExpenditure = totalExpenditureFromExpenditure + totalExpenditureFromKharchays;

      
        // Calculate total sales and profit
        const totalSales = (totalSalesConsumers[0]?.total || 0) + (totalSalesRelatives[0]?.total || 0);
        const profit = totalSales - totalExpenditure;

        // Upsert the sales summary with total_expenditure and profit
        await SalesSummary.findOneAndUpdate(
            { summaryId: 1 },  // Ensure we're updating the correct summary record
            {
                total_sales: totalSales,
                total_expenditure: totalExpenditure,  // Combined total expenditure
                total_milk_sold: (totalSalesConsumers[0]?.totalMilk || 0) + (totalSalesRelatives[0]?.totalMilk || 0),
                profit: profit
            },
            { upsert: true, new: true }
        );

        } catch (err) {
        console.error('Failed to update sales summary:', err);
    }
}



app.get('/sales_summary', async (req, res) => {
    try {
        // Find the sales summary by the summaryId (assuming it's 1)
        const salesSummary = await SalesSummary.findOne({ summaryId: 1 });

        if (!salesSummary) {
            return res.status(404).json({ message: 'Sales summary not found' });
        }

        // Return the total sales, total expenditure, total milk sold, and profit
        res.json({
            total_sales: salesSummary.total_sales,
            total_expenditure: salesSummary.total_expenditure,  // Replace net_sales with total_expenditure
            total_milk_sold: salesSummary.total_milk_sold,  // Include total milk sold
            profit: salesSummary.profit  // Include profit
        });
    } catch (err) {
        console.error('Failed to fetch sales summary:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});



app.get('/unique-names', async (req, res) => {
    try {
        // Fetch distinct consumer names from MongoDB
        const uniqueNames = await ConsumerSale.distinct('Name');
        res.setHeader('Content-Type', 'application/json');
        res.json(uniqueNames);
    } catch (err) {
        console.error('Error fetching unique names:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/unique-namesr', async (req, res) => {
    try {
        const uniqueNames = await RelativeSale.distinct('Rname');
        res.setHeader('Content-Type', 'application/json');
        res.json(uniqueNames);
    } catch (err) {
        console.error('Error fetching unique names:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.get('/unique-namese', async (req, res) => {
    try {
        const uniqueNames = await Expenditure.distinct('source');
        res.setHeader('Content-Type', 'application/json');
        res.json(uniqueNames);
    } catch (err) {
        console.error('Error fetching unique names:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.get('/unique-namesk', async (req, res) => {
    try {
        const uniqueNames = await Kharchay.distinct('source');
        res.setHeader('Content-Type', 'application/json');
        res.json(uniqueNames);
    } catch (err) {
        console.error('Error fetching unique names:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});



app.get("/consumerssale", async (req, res) => {
    try {
        // Fetch all consumer sales from MongoDB
        const consumerSales = await ConsumerSale.find();

        if (!consumerSales || consumerSales.length === 0) {
            return res.status(200).json([]); // Respond with an empty array if no records are found
        }

        // Set content-type to JSON and send the data
        res.setHeader('Content-Type', 'application/json');
        return res.json(consumerSales);
    } catch (err) {
        console.error("Error fetching consumer sales: ", err);
        res.status(500).json({ error: 'Internal server error' });
    }
});



app.get("/relatives", async (req, res) => {
    try {
        const relativeSales = await RelativeSale.find();

        if (!relativeSales || relativeSales.length === 0) {
            return res.status(404).json({ message: 'No relative sales found' });
        }

        res.setHeader('Content-Type', 'application/json');
        return res.json(relativeSales);
    } catch (err) {
        console.error("Error fetching relative sales: ", err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.get("/expenditure", async (req, res) => {
    try {
        // Fetch all expenditures from MongoDB
        const expenditures = await Expenditure.find();

        // Return an empty array if no expenditures are found
        if (!expenditures || expenditures.length === 0) {
            return res.json([]);  // Return an empty array instead of 404
        }

        // Set content-type to JSON and send the data
        res.setHeader('Content-Type', 'application/json');
        return res.json(expenditures);
    } catch (err) {
        console.error("Error fetching expenditure data:", err);
        res.status(500).json({ error: 'Internal server error' });
    }
});



app.post("/consumerssale", async (req, res) => {
    if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({ error: "Invalid request body" });
    }

    const { Date, Name, Quantity, UnitPrice } = req.body;

    console.log('Parsed values:', { Date, Name, Quantity, UnitPrice });

    if (!Date || !Name || !Quantity || !UnitPrice) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const parsedQuantity = parseFloat(Quantity);
    const parsedUnitPrice = parseFloat(UnitPrice);

    if (isNaN(parsedQuantity) || isNaN(parsedUnitPrice) ) {
        return res.status(400).json({ error: "Invalid Quantity or UnitPrice" });
    }

    const Total = parsedQuantity * parsedUnitPrice;

    try {
        // Create a new consumer sale record in MongoDB
        const newSale = new ConsumerSale({
            Date,
            Name,
            Quantity: parsedQuantity,
            UnitPrice: parsedUnitPrice,
            Total
        });

        // Save the record
        await newSale.save();
        await updateSalesSummary(); // Call updateSalesSummary if needed

        res.status(201).json({ message: 'Sale added successfully', id: newSale._id });
    } catch (err) {
        console.error('Error saving consumer sale:', err);
        res.status(500).json({ error: err.message });
    }
});


app.post("/expenditure", async (req, res) => {
    const { Date, source } = req.body;
    let amount = parseFloat(req.body.amount);

    if (isNaN(amount) || !Date.trim() || !source.trim()) {
        return res.status(400).json({ error: "Invalid input provided." });
    }

    try {
        // Create a new expenditure document in MongoDB
        const newExpenditure = new Expenditure({
            Date,
            source,
            amount
        });

        // Save the expenditure to the database
        await newExpenditure.save();
        await updateSalesSummary(); // Update the sales summary if needed

        res.status(201).json({ message: 'Expense added successfully', id: newExpenditure._id });
    } catch (err) {
        console.error('Error saving expenditure:', err);
        res.status(500).json({ error: err.message });
    }
});


app.post("/relatives", async (req, res) => {
    const { Date, Rname, Quantity, RUnitPrice } = req.body;

    const parsedQuantity = parseFloat(Quantity);
    const parsedRUnitPrice = parseFloat(RUnitPrice);

    if (isNaN(parsedQuantity) || isNaN(parsedRUnitPrice) || parsedQuantity <= 0 || parsedRUnitPrice <= 0) {
        return res.status(400).json({ error: "Invalid Quantity or Unit Price." });
    }

    const RTotal = parsedQuantity * parsedRUnitPrice;

    try {
        const newRelativeSale = new RelativeSale({
            Date,
            Rname,
            Quantity: parsedQuantity,
            RUnitPrice: parsedRUnitPrice,
            RTotal
        });

        await newRelativeSale.save();
        await updateSalesSummary(); // If necessary

        res.status(201).json({ message: 'Sale added successfully', id: newRelativeSale._id });
    } catch (err) {
        console.error('Error saving relative sale:', err);
        res.status(500).json({ error: err.message });
    }
});


app.put("/consumerssale/:id", async (req, res) => {
    const { Date, Name, Quantity, UnitPrice } = req.body;

    // Validate Quantity and UnitPrice
    const parsedQuantity = parseFloat(Quantity);
    const parsedUnitPrice = parseFloat(UnitPrice);
    const Total = parsedQuantity * parsedUnitPrice;

    if (isNaN(parsedQuantity) || isNaN(parsedUnitPrice) || parsedQuantity <= 0 || parsedUnitPrice <= 0) {
        return res.status(400).json({ error: "Invalid Quantity or Unit Price." });
    }

    try {
        // Update the consumer sale in MongoDB
        const result = await ConsumerSale.findByIdAndUpdate(
            req.params.id,
            {
                Date,
                Name,
                Quantity: parsedQuantity,
                UnitPrice: parsedUnitPrice,
                Total
            },
            { new: true } // Return the updated document
        );

        if (!result) {
            return res.status(404).json({ message: 'No record found with that ID to update' });
        }

        await updateSalesSummary();  // Update the sales summary after modifying a consumer sale

        res.json({ message: 'Sale updated successfully', updatedRecord: result });
    } catch (err) {
        console.error('Error updating consumer sale:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Update a relative sale
app.put("/relatives/:id", async (req, res) => {
    const { Date, Rname, Quantity, RUnitPrice } = req.body;

    const parsedQuantity = parseFloat(Quantity);
    const parsedRUnitPrice = parseFloat(RUnitPrice);
    const RTotal = parsedQuantity * parsedRUnitPrice;

    if (isNaN(parsedQuantity) || isNaN(parsedRUnitPrice) || parsedQuantity <= 0 || parsedRUnitPrice <= 0) {
        return res.status(400).json({ error: "Invalid Quantity or Unit Price." });
    }

    try {
        const result = await RelativeSale.findByIdAndUpdate(
            req.params.id,
            {
                Date,
                Rname,
                Quantity: parsedQuantity,
                RUnitPrice: parsedRUnitPrice,
                RTotal
            },
            { new: true }
        );

        if (!result) {
            return res.status(404).json({ message: 'No record found with that ID to update' });
        }

        await updateSalesSummary();

        res.json({ message: 'Sale updated successfully', updatedRecord: result });
    } catch (err) {
        console.error('Error updating relative sale:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.put("/expenditure/:id", async (req, res) => {
    const { Date, source, amount } = req.body;

    // Validate amount
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0 || !Date.trim() || !source.trim()) {
        return res.status(400).json({ error: "Invalid input: Ensure date, source, and amount are valid." });
    }

    try {
        // Update the expenditure in MongoDB
        const result = await Expenditure.findByIdAndUpdate(
            req.params.id,
            { Date, source, amount: parsedAmount },
            { new: true } // Return the updated document
        );

        if (!result) {
            return res.status(404).json({ message: 'No record found with that ID to update' });
        }

        await updateSalesSummary();  // Update the sales summary after modifying an expenditure

        res.json({ message: 'Expenditure updated successfully', updatedRecord: result });
    } catch (err) {
        console.error('Error updating expenditure:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.delete("/consumerssale/:id", async (req, res) => {
    const { id } = req.params;
    console.log("Received ID for deletion (from backend):", id);  // Ensure the ID is correctly received

    if (!mongoose.Types.ObjectId.isValid(id)) {
        console.error("Invalid ID format:", id);
        return res.status(400).json({ message: 'Invalid ID format' });
    }

    // Validate if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        console.error("Invalid ID format:", id); // Log invalid ID
        return res.status(400).json({ message: 'Invalid ID format' });
    }

    try {
        // Attempt to delete the ConsumerSale record by its ID
        const result = await ConsumerSale.findByIdAndDelete(id);

        if (!result) {
            console.error("No record found with that ID to delete:", id); // Log if no record is found
            return res.status(404).json({ message: 'No record found with that ID to delete' });
        }

        await updateSalesSummary();  // Update the sales summary after deleting a sale

        console.log("Sale deleted successfully:", result); // Log the result of the deletion
        res.json({ message: 'Sale deleted successfully', deletedRecord: result });
    } catch (err) {
        console.error('Error deleting sale:', err); // Log detailed error
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.delete("/relatives/:id", async (req, res) => {
    try {
        const result = await RelativeSale.findByIdAndDelete(req.params.id);

        if (!result) {
            return res.status(404).json({ message: 'No record found with that ID to delete' });
        }

        await updateSalesSummary();

        res.json({ message: 'Sale deleted successfully', deletedRecord: result });
    } catch (err) {
        console.error('Error deleting relative sale:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete("/expenditure/:id", async (req, res) => {
    try {
        // Delete the Expenditure record from MongoDB
        const result = await Expenditure.findByIdAndDelete(req.params.id);

        if (!result) {
            return res.status(404).json({ message: 'No record found with that ID to delete' });
        }

        await updateSalesSummary();  // Update the sales summary after deleting an expenditure

        res.json({ message: 'Expense deleted successfully', deletedRecord: result });
    } catch (err) {
        console.error('Error deleting expenditure:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Fetch all consumer khata data
app.get('/consumerkhata', async (req, res) => {
    try {
        // Fetch all ConsumerKhata records from MongoDB
        const results = await ConsumerKhata.find();

        res.setHeader('Content-Type', 'application/json'); // Explicitly set Content-Type
        res.json(results);  // Return fetched data
    } catch (error) {
        console.error("Error fetching consumerkhata data:", error);
        res.status(500).setHeader('Content-Type', 'application/json'); // Set Content-Type for error response
        res.json({ error: error.message });
    }
});

app.get('/employeekhata', async (req, res) => {
    try {
        // Fetch all EmployeeKhata records from MongoDB
        const results = await EmployeeKhata.find();

        res.setHeader('Content-Type', 'application/json'); // Explicitly set Content-Type
        res.json(results);  // Return fetched data
    } catch (error) {
        console.error("Error fetching employeekhata data:", error);
        res.status(500).setHeader('Content-Type', 'application/json'); // Set Content-Type for error response
        res.json({ error: error.message });
    }
});


// POST route to add a new consumer khata record using Mongoose
app.post('/consumerkhata', async (req, res) => {
    const { date, name, baqaya } = req.body;

    // Input validation
    if (!date || !name || baqaya === undefined) {
        return res.status(400).json({ message: 'Missing required fields: date, name, or baqaya' });
    }

    try {
        // Create a new ConsumerKhata document
        const newConsumerKhata = new ConsumerKhata({
            date: new Date(date), // Convert date to a Date object
            name,
            baqaya: parseFloat(baqaya) // Ensure baqaya is stored as a number
        });

        // Save the document to MongoDB
        const savedKhata = await newConsumerKhata.save();

        res.status(201).json({ message: 'Data added successfully', id: savedKhata._id });
    } catch (error) {
        console.error("Error saving consumer khata:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.post('/employeekhata', async (req, res) => {
    const { date, name, baqaya } = req.body;

    // Input validation
    if (!date || !name || baqaya === undefined || baqaya === null) {
        return res.status(400).json({ error: "Missing required fields: date, name, or baqaya" });
    }

    try {
        // Ensure the date is correctly formatted
        const formattedDate = new Date(date);
        if (isNaN(formattedDate.getTime())) {
            return res.status(400).json({ error: "Invalid date format" });
        }

        // Create a new EmployeeKhata document
        const newEmployeeKhata = new EmployeeKhata({
            date: formattedDate,
            name: name.trim(),  // Ensure name is trimmed
            baqaya: parseInt(baqaya)  // Convert baqaya to an integer
        });

        // Save to MongoDB
        const savedKhata = await newEmployeeKhata.save();

        res.status(201).json({ message: 'Data added successfully', id: savedKhata._id });
    } catch (error) {
        console.error("Error saving employeekhata data:", error);
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
});




app.put('/consumerkhata/:id', async (req, res) => {
    const { id } = req.params;  // The consumer khata ID
    const { date, name, baqaya } = req.body; // Removed consumerKhataId from the body

    // Validate input
    if (!date || !name || baqaya === undefined) {
        return res.status(400).json({ message: 'Missing required fields: date, name, or baqaya' });
    }

    // Ensure ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid ID format' });
    }

    try {
        // Update Consumer Khata document
        const updatedKhata = await ConsumerKhata.findByIdAndUpdate(
            id,
            { date: new Date(date), name, baqaya: parseFloat(baqaya) },
            { new: true, runValidators: true }
        );

        if (!updatedKhata) {
            return res.status(404).json({ message: 'No ConsumerKhata record found with that ID' });
        }

        res.json({ message: 'Data updated successfully', updatedKhata });
    } catch (error) {
        console.error('Error updating ConsumerKhata:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});



app.put('/employeekhata/:id', async (req, res) => {
    const { id } = req.params;
    const { date, name, baqaya } = req.body;

    // Input validation
    if (!date || typeof date !== 'string' || !date.trim() ||
        !name || typeof name !== 'string' || !name.trim() ||
        baqaya === undefined || isNaN(Number(baqaya)) || Number(baqaya) < 0) {
        return res.status(400).json({
            message: 'Invalid or missing fields. Ensure date, name are non-empty strings and baqaya is a non-negative number.',
            received: { date, name, baqaya }
        });
    }

    try {
        // Update the employeekhata by ID
        const updatedKhata = await EmployeeKhata.findByIdAndUpdate(
            id,
            { date: new Date(date), name, baqaya }, // Make sure 'date' is lowercase
            { new: true }
        );

        if (!updatedKhata) {
            return res.status(404).json({ message: 'No record found with the provided ID.' });
        }

        res.json({ message: 'Employee data updated successfully.', updatedFields: { date, name, baqaya } });
    } catch (error) {
        console.error('Error updating employee khata:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.post('/wasooli', async (req, res) => {
    const { date, Wasooli: wasooliAmount, consumerId } = req.body;

    if (!date || !wasooliAmount || !consumerId) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const consumer = await ConsumerKhata.findById(consumerId);
        if (!consumer) {
            return res.status(404).json({ error: "Consumer not found" });
        }

        // Create a new Wasooli entry
        const newWasooli = new Wasoolii({
            consumerKhataId: consumerId,
            date: new Date(date),
            Wasooli: parseFloat(wasooliAmount),
        });
        await newWasooli.save();

        // Update consumer's baqaya
        consumer.baqaya -= parseFloat(wasooliAmount);
        await consumer.save();

        res.status(201).json({ message: "Wasooli transaction added successfully." });
    } catch (error) {
        console.error("Error creating Wasooli:", error);
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
});


// Server-side: Express route to handle POST request for new Kharchay transactions
app.post('/kharchay', async (req, res) => {
    const { date, source, Wasooli, consumerId } = req.body;

    // Input validation
    if (!date || Wasooli === undefined || isNaN(parseInt(Wasooli)) || parseInt(Wasooli) < 0 || !consumerId) {
        return res.status(400).send({ error: "Missing, invalid, or negative Wasooli amount, or missing consumer ID" });
    }

    try {
        // Check if employee exists in the EmployeeKhata model
        const employee = await EmployeeKhata.findById(consumerId);
        if (!employee) {
            return res.status(404).send({ message: "Employee not found" });
        }

        // Create a new Kharchay transaction
        const newKharchay = new Kharchay({
            employeeKhataId: consumerId,
            date: new Date(date),
            source,
            Wasooli: parseFloat(Wasooli)
        });
        await newKharchay.save();

        // Update the employee's baqaya
        employee.baqaya -= parseFloat(Wasooli);
        await employee.save();

        res.status(201).send({ message: "Kharchay transaction added and baqaya updated successfully." });
    } catch (error) {
        console.error("Error handling Kharchay transaction:", error);
        res.status(500).send({ error: "Internal server error", details: error.message });
    }
});


app.get('/wasooli/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Ensure that the provided ID is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid Consumer ID format' });
        }

        // Fetch Wasooli transactions by consumerKhataId using Mongoose
        const wasooliTransactions = await Wasoolii.find({ consumerKhataId: id });

        // Explicitly set Content-Type and handle empty arrays or successful responses
        res.setHeader('Content-Type', 'application/json');
        return res.json(wasooliTransactions);  // Return the fetched transactions (can be empty)
    } catch (error) {
        console.error('Error fetching Wasooli data:', error);

        // Respond with appropriate status and message, and set Content-Type for error response
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});


app.get('/kharchay/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Fetch Kharchay transactions by employeeKhataId using Mongoose
        const kharchayTransactions = await Kharchay.find({ employeeKhataId: id });

        res.setHeader('Content-Type', 'application/json'); // Explicitly set Content-Type
        // Return an empty array if no transactions are found
        res.json(kharchayTransactions.length > 0 ? kharchayTransactions : []);
    } catch (error) {
        console.error('Error fetching Kharchay data:', error);
        res.status(500).setHeader('Content-Type', 'application/json'); // Set Content-Type for error response
        res.send({ error: 'Internal server error', details: error.message });
    }
});


app.delete('/wasooli/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Find the Wasooli transaction by ID
        const wasooli = await Wasoolii.findById(id);
        if (!wasooli) {
            return res.status(404).send({ message: 'Wasooli transaction not found.' });
        }

        const wasooliAmount = wasooli.Wasooli;
        const consumerId = wasooli.consumerKhataId; // Ensure this is the correct field

        // Find the consumer and update baqaya
        const consumer = await ConsumerKhata.findById(consumerId);
        if (!consumer) {
            return res.status(404).send({ message: 'Consumer Khata not found.' });
        }

        // Ensure baqaya is a number
        if (typeof consumer.baqaya !== 'number') {
            return res.status(400).send({ message: 'Consumer baqaya is not a valid number.' });
        }
        
        // Update consumer's baqaya by adding back the deleted Wasooli amount
        consumer.baqaya += wasooliAmount; // Add Wasooli amount back to baqaya
        console.log(consumer.baqaya)
        // Save the updated consumer
        await consumer.save();

        // Now delete the Wasooli transaction
        await Wasoolii.findByIdAndDelete(id);

        res.json({ message: 'Wasooli transaction deleted and Baqaya updated.', deletedAmount: wasooliAmount });
    } catch (error) {
        console.error('Error during transaction:', error);
        res.status(500).send({ error: 'Internal server error', details: error.message });
    }
});


app.delete('/kharchay/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Find the Kharchay transaction by ID
        const kharchay = await Kharchay.findById(id);
        if (!kharchay) {
            return res.status(404).send({ message: 'Kharchay transaction not found.' });
        }

        const wasooliAmount = kharchay.Wasooli; // Get the Wasooli amount from Kharchay
        const employeeId = kharchay.employeeKhataId; // Get the EmployeeKhata ID

        // Find the employee khata record
        const employeeKhata = await EmployeeKhata.findById(employeeId);
        if (!employeeKhata) {
            return res.status(404).send({ message: 'Employee Khata not found.' });
        }

        // Ensure baqaya is a number
        if (typeof employeeKhata.baqaya !== 'number') {
            return res.status(400).send({ message: 'Employee baqaya is not a valid number.' });
        }

        // Update employee's baqaya by adding back the deleted Wasooli amount
        employeeKhata.baqaya += wasooliAmount; // Add back the Wasooli amount to baqaya

        // Save the updated employee khata record
        await employeeKhata.save();

        // Now delete the Kharchay transaction
        await Kharchay.findByIdAndDelete(id);

        res.json({ message: 'Kharchay transaction deleted and Baqaya updated.', deletedAmount: wasooliAmount });
    } catch (error) {
        console.error('Error during transaction:', error);
        res.status(500).send({ error: 'Internal server error', details: error.message });
    }
});


app.put('/wasooli/:id', async (req, res) => {
    const { id } = req.params;
    const { date, Wasooli: wasooliAmount, consumerId } = req.body;

    // Validation for missing or invalid data
    if (!date || isNaN(wasooliAmount) || wasooliAmount <= 0 || !consumerId) {
        return res.status(400).json({ message: "Invalid or missing data" });
    }

    try {
        const wasooliTransaction = await Wasoolii.findById(id);
        if (!wasooliTransaction) {
            return res.status(404).json({ message: 'Original Wasooli transaction not found.' });
        }

        const originalWasooliAmount = wasooliTransaction.Wasooli;
        const consumer = await ConsumerKhata.findById(consumerId);
        if (!consumer) {
            return res.status(404).json({ message: 'Consumer not found.' });
        }

        // Revert the old Wasooli amount to baqaya
        await ConsumerKhata.findByIdAndUpdate(consumerId, { $inc: { baqaya: originalWasooliAmount } });

        // Update the Wasooli transaction
        wasooliTransaction.date = new Date(date);
        wasooliTransaction.Wasooli = parseFloat(wasooliAmount);
        await wasooliTransaction.save();

        // Subtract the new Wasooli amount from baqaya
        await ConsumerKhata.findByIdAndUpdate(consumerId, { $inc: { baqaya: -parseFloat(wasooliAmount) } });

        res.json({ message: 'Wasooli transaction updated successfully.' });
    } catch (error) {
        console.error('Error updating Wasooli transaction:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});


app.put('/kharchay/:id', async (req, res) => {
    const { id } = req.params;
    const { date, source, Wasooli: wasooliAmount } = req.body;

    // Validation for missing or invalid data
    if (!date || isNaN(wasooliAmount) || wasooliAmount <= 0) {
        return res.status(400).json({ message: "Invalid or missing data" });
    }

    try {
        // Find the original Kharchay transaction by ID
        const kharchay = await Kharchay.findById(id);
        if (!kharchay) {
            return res.status(404).json({ message: 'Original Kharchay transaction not found.' });
        }

        const originalWasooliAmount = kharchay.Wasooli;
        const employeeId = kharchay.employeeKhataId;  // Ensure this field matches your model

        // Find the employee khata record
        const employeeKhata = await EmployeeKhata.findById(employeeId);
        if (!employeeKhata) {
            return res.status(404).json({ message: 'Employee Khata not found.' });
        }

        // Update employee's baqaya by adding back the original Wasooli amount
        await EmployeeKhata.findByIdAndUpdate(employeeId, { $inc: { baqaya: originalWasooliAmount } });

        // Update the Kharchay transaction
        kharchay.date = new Date(date);  // Ensure the date is stored correctly
        kharchay.source = source;
        kharchay.Wasooli = parseFloat(wasooliAmount);
        await kharchay.save();

        // Subtract the new Wasooli amount from baqaya
        await EmployeeKhata.findByIdAndUpdate(employeeId, { $inc: { baqaya: -parseFloat(wasooliAmount) } });

        res.json({ message: 'Kharchay transaction updated successfully.' });
    } catch (error) {
        console.error('Error updating Kharchay transaction:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});


// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
