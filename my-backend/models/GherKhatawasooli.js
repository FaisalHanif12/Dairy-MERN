const mongoose = require("mongoose");

const WasooliSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
  },
  Rname: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("GherKhatawasooli", WasooliSchema);
