const mongoose = require('mongoose');

const salesSummarySchema = new mongoose.Schema({
    summaryId: {
        type: Number,
        unique: true,
        required: true,
        default: 1
    },
    total_sales: {
        type: Number,
        required: true,
        validate(value) {
            if (value < 0) throw new Error("Total sales cannot be negative.");
        }
    },
    total_expenditure: {  // Add this field for total expenditure
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) throw new Error("Total expenditure cannot be negative.");
        }
    },
    net_sales: {
        type: Number,
        required: true,
        validate(value) {
            if (value < 0) throw new Error("Net sales cannot be negative.");
        }
    },
    total_milk_sold: {  // Add this field for total milk sold
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) throw new Error("Total milk sold cannot be negative.");
        }
    },
    profit: {  // Add this field for profit
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) throw new Error("Profit cannot be negative.");
        }
    }
});

module.exports = mongoose.model('SalesSummary', salesSummarySchema);
