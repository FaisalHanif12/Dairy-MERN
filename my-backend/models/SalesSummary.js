const mongoose = require('mongoose');

const salesSummarySchema = new mongoose.Schema({
    summaryId: {
        type: Number,
        unique: true,
        required: true,
        default: 1 // You can default this to 1 if you only plan to have one summary record
    },
    total_sales: {
        type: Number,
        required: true,
        validate(value) {
            if (value < 0) throw new Error("Total sales cannot be negative.");
        }
    },
    net_sales: {
        type: Number,
        required: true,
        validate(value) {
            if (value < 0) throw new Error("Net sales cannot be negative.");
        }
    }
});

module.exports = mongoose.model('SalesSummary', salesSummarySchema);
