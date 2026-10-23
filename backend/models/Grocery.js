const mongoose = require("mongoose");

const grocerySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Grocery name is required."],
      trim: true,
      maxlength: [100, "Grocery name cannot be longer than 100 characters."],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required."],
      min: [1, "Quantity must be at least 1."],
    },
    purchased: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Grocery", grocerySchema);
