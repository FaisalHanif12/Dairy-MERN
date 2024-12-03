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
  
});

module.exports = mongoose.model('ConsumerKhata', consumerKhataSchema);
