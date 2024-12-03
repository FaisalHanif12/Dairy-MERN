const mongoose = require('mongoose');

const employeeKhataSchema = new mongoose.Schema({
    date: {  // Use lowercase 'date'
        type: Date,
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    baqaya: {
        type: Number,
        required: true,
    },
});

module.exports = mongoose.model('EmployeeKhata', employeeKhataSchema);
