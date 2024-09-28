const mongoose = require('mongoose');

const KharchaySchema = new mongoose.Schema({
    employeeKhataId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EmployeeKhata',
        required: true
    },
    date: {
        type: Date, // Ensure the `date` field is of Date type
        required: true
    },
    source: {
        type: String,
        required: true
    },
    Wasooli: {
        type: Number,
        required: true
    }
});

const Kharchay = mongoose.model('Kharchay', KharchaySchema);
module.exports = Kharchay;
