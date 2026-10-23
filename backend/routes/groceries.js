const express = require("express");
const mongoose = require("mongoose");
const Grocery = require("../models/Grocery");

const router = express.Router();
const memoryGroceries = [];

router.use((request, response, next) => {
  if (!process.env.MONGO_URI || mongoose.connection.readyState === 1) {
    return next();
  }

  if (mongoose.connection.readyState !== 1) {
    return response.status(503).json({
      message: "MongoDB is not connected. Add a valid MONGO_URI to backend/.env and check your Atlas network access.",
    });
  }
});

router.get("/", async (request, response) => {
  if (!process.env.MONGO_URI) {
    return response.status(200).json(memoryGroceries);
  }

  try {
    const groceries = await Grocery.find().sort({ createdAt: -1 });
    return response.status(200).json(groceries);
  } catch (error) {
    console.error("Could not fetch groceries:", error.message);
    return response.status(500).json({ message: "Could not retrieve grocery items." });
  }
});

router.post("/", async (request, response) => {
  const { name, quantity } = request.body || {};

  if (typeof name !== "string" || !name.trim()) {
    return response.status(400).json({ message: "A grocery name is required." });
  }
  if (quantity === undefined || quantity === null) {
    return response.status(400).json({ message: "A quantity is required." });
  }
  if (typeof quantity !== "number" || !Number.isFinite(quantity) || quantity < 1) {
    return response.status(400).json({ message: "Quantity must be a number of at least 1." });
  }

  if (!process.env.MONGO_URI) {
    const grocery = {
      _id: new mongoose.Types.ObjectId().toString(),
      name: name.trim(),
      quantity,
      purchased: false,
      createdAt: new Date().toISOString(),
    };
    memoryGroceries.unshift(grocery);
    return response.status(201).json(grocery);
  }

  try {
    const grocery = await Grocery.create({ name: name.trim(), quantity });
    return response.status(201).json(grocery);
  } catch (error) {
    if (error.name === "ValidationError") {
      return response.status(400).json({ message: error.message });
    }
    console.error("Could not create grocery:", error.message);
    return response.status(500).json({ message: "Could not add the grocery item." });
  }
});

router.patch("/:id", async (request, response) => {
  const { id } = request.params;
  const updates = request.body || {};

  if (!mongoose.isObjectIdOrHexString(id)) {
    return response.status(400).json({ message: "The grocery item ID is invalid." });
  }
  if (Object.keys(updates).length === 0) {
    return response.status(400).json({ message: "Provide a name, quantity, or purchased status to update." });
  }
  if (Object.hasOwn(updates, "name") && (typeof updates.name !== "string" || !updates.name.trim())) {
    return response.status(400).json({ message: "Grocery name cannot be empty." });
  }
  if (Object.hasOwn(updates, "name") && updates.name.trim().length > 100) {
    return response.status(400).json({ message: "Grocery name cannot be longer than 100 characters." });
  }
  if (
    Object.hasOwn(updates, "quantity") &&
    (typeof updates.quantity !== "number" || !Number.isFinite(updates.quantity) || updates.quantity < 1)
  ) {
    return response.status(400).json({ message: "Quantity must be a number of at least 1." });
  }
  if (Object.hasOwn(updates, "purchased") && typeof updates.purchased !== "boolean") {
    return response.status(400).json({ message: "Purchased must be true or false." });
  }
  if (Object.keys(updates).some((key) => !["name", "quantity", "purchased"].includes(key))) {
    return response.status(400).json({ message: "Only name, quantity, and purchased status can be updated." });
  }

  const updateFields = { ...updates };
  if (Object.hasOwn(updateFields, "name")) {
    updateFields.name = updateFields.name.trim();
  }

  if (!process.env.MONGO_URI) {
    const grocery = memoryGroceries.find((item) => item._id === id);
    if (!grocery) {
      return response.status(404).json({ message: "Grocery item not found." });
    }
    Object.assign(grocery, updateFields);
    return response.status(200).json(grocery);
  }

  try {
    const grocery = await Grocery.findByIdAndUpdate(
      id,
      updateFields,
      { new: true, runValidators: true },
    );
    if (!grocery) {
      return response.status(404).json({ message: "Grocery item not found." });
    }
    return response.status(200).json(grocery);
  } catch (error) {
    console.error("Could not update grocery:", error.message);
    return response.status(500).json({ message: "Could not update the grocery item." });
  }
});

router.delete("/:id", async (request, response) => {
  const { id } = request.params;

  if (!mongoose.isObjectIdOrHexString(id)) {
    return response.status(400).json({ message: "The grocery item ID is invalid." });
  }

  if (!process.env.MONGO_URI) {
    const itemIndex = memoryGroceries.findIndex((item) => item._id === id);
    if (itemIndex === -1) {
      return response.status(404).json({ message: "Grocery item not found." });
    }
    memoryGroceries.splice(itemIndex, 1);
    return response.status(200).json({ message: "Grocery item deleted.", id });
  }

  try {
    const grocery = await Grocery.findByIdAndDelete(id);
    if (!grocery) {
      return response.status(404).json({ message: "Grocery item not found." });
    }
    return response.status(200).json({ message: "Grocery item deleted.", id });
  } catch (error) {
    console.error("Could not delete grocery:", error.message);
    return response.status(500).json({ message: "Could not delete the grocery item." });
  }
});

module.exports = router;
