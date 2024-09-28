const mongoose = require('mongoose');

const wasooliSchema = new mongoose.Schema({
    consumerKhataId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ConsumerKhata',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    Wasooli: {
        type: Number,
        required: true
    }
});

// Correctly export the model
const Wasoolii = mongoose.model('Wasoolii', wasooliSchema);
module.exports = Wasoolii;
