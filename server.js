require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/langstons-ant', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Ant Schema
const antSchema = new mongoose.Schema({
    name: { type: String, required: true },
    creator: { type: String, required: true },
    gridSize: { type: Number, required: true },
    rules: { type: [String], required: true },
    colors: { type: [String], required: true },
    createdAt: { type: Date, default: Date.now }
});

const Ant = mongoose.model('Ant', antSchema);

// API Routes
app.get('/api/ants', async (req, res) => {
    try {
        const ants = await Ant.find().sort({ createdAt: -1 });
        res.json(ants);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/ants', async (req, res) => {
    try {
        const ant = new Ant(req.body);
        const savedAnt = await ant.save();
        res.status(201).json(savedAnt);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static('public'));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
    });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 