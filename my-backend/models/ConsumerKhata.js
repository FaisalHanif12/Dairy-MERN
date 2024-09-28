const mongoose = require('mongoose');

const consumerKhataSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    baqaya: {
        type: Number,
        required: true,
        validate(value) {
            if (value < 0) throw new Error("Baqaya cannot be negative.");
        }
    }
});

module.exports = mongoose.model('ConsumerKhata', consumerKhataSchema);
