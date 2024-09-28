const mongoose = require('mongoose');

const consumerSaleSchema = new mongoose.Schema({
    Date: {
        type: Date,
        required: true,
        trim: true
    },
    Name: {
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
    UnitPrice: {
        type: Number,
        required: true,
        validate(value) {
            if (value <= 0) throw new Error("Unit Price must be greater than zero.");
        }
    },
    Total: {
        type: Number,
        required: true,
    }
});

module.exports = mongoose.model('ConsumerSale', consumerSaleSchema);
