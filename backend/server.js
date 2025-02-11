require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const User = require("./models/User");
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const audioRoutes = require('./routes/audio');
require('./middleware/deleteOldFiles.js');



// Initialize app
const app = express();
app.use(express.json());
app.use(cors());

//Routes
app.use('/api/auth',authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/audio', audioRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {})
.then(() => console.log("MongoDB Connected"))
.catch((err) => console.error("MongoDB Connection Error:", err));

// Start Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
