const mongoose = require('mongoose');

const expenditureSchema = new mongoose.Schema({
    Date: {
        type: Date,
        required: true,
        trim: true
    },
    source: {
        type: String,
        required: true,
        trim: true
    },
    amount: {
        type: Number,
        required: true,
        validate(value) {
            if (value <= 0) throw new Error("Amount must be greater than zero.");
        }
    }
});

module.exports = mongoose.model('Expenditure', expenditureSchema);
