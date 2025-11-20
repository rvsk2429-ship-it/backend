const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');

// CORS – allow frontend + n8n + public
app.use(cors({
  origin: "*",
  methods: ["GET","POST","PUT","DELETE"],
  credentials: false
}));

// JSON body parser
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log("MongoDB connected"))
.catch(err => console.log("MongoDB error:", err));

// TEST ROUTE (do not remove)
app.get('/test', (req, res) => {
  res.json({ status: 'backend-live' });
});

// PORT handling
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log('Server running on port ' + PORT));
