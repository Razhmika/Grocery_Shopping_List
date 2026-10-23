require("dotenv").config();

const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const groceryRoutes = require("./routes/groceries");

const app = express();
const port = process.env.PORT || 5000;
const usesMemoryStorage = !process.env.MONGO_URI;

app.use(cors());
app.use(express.json());
app.get("/api/health", (request, response) => {
  const connected = usesMemoryStorage || mongoose.connection.readyState === 1;

  return response.status(connected ? 200 : 503).json({
    status: usesMemoryStorage ? "ok_memory_mode" : connected ? "ok" : "database_unavailable",
    message: usesMemoryStorage
      ? "The API is ready in temporary memory mode. Items will be lost when the server restarts."
      : connected
        ? "The API and database are ready."
        : "The API is running, but MongoDB is not connected. Check backend/.env and your MongoDB Atlas settings.",
  });
});
app.use("/api/groceries", groceryRoutes);

app.use((error, request, response, next) => {
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return response.status(400).json({ message: "Request body must be valid JSON." });
  }
  console.error(error);
  return response.status(500).json({ message: "An unexpected server error occurred." });
});

async function startServer() {
  app.listen(port, () => {
    console.log(`Grocery API is running at http://localhost:${port}`);
  });

  if (!process.env.MONGO_URI) {
    console.warn("MONGO_URI is missing. Using temporary in-memory storage; grocery items will not persist after restart.");
    return;
  }

  mongoose
    .connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 })
    .then(() => {
      console.log("Connected to MongoDB.");
    })
    .catch((error) => {
      console.error("Could not connect to MongoDB:", error.message);
      console.error("Check the connection string and confirm your IP is allowed in MongoDB Atlas.");
    });
}

startServer().catch((error) => {
  console.error("Could not start the server:", error.message);
  process.exit(1);
});
