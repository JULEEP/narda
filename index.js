const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const dotenv = require('dotenv');
const app = express();

const route = require("./routes/route");
const frontendadminroute = require("./routes/adminroutes");
const adminroute = require("./routes/admin");

dotenv.config();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/views", express.static(path.join(__dirname, "views")));

// Routes
app.use("/", route);
app.use("/v1/naradha/admin/", adminroute);
app.use("/", frontendadminroute);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
  })
  .catch((err) => {
    console.error('Mongo Error:', err);
  });


process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

app.listen(8003, () => {
  console.log("App is running on port 8003 🚀");
});
