const mongoose = require('mongoose');

const relativeSaleSchema = new mongoose.Schema({
    Date: {
        type: Date,
        required: true,
        trim: true
    },
    Rname: {
        type: String,
        required: true,
        trim: true
    },
    Quantity: {
        type: Number,
        required: true,
        validate(value) {
            if (value <= 0) throw new Error("Quantity must be greater than zero.");
        }
    },
    RUnitPrice: {
        type: Number,
        required: true,
        validate(value) {
            if (value <= 0) throw new Error("Unit Price must be greater than zero.");
        }
    },
    RTotal: {
        type: Number,
        required: true,
    }
});

module.exports = mongoose.model('RelativeSale', relativeSaleSchema);
