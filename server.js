require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors({
    origin: '*', // For development - you should restrict this in production
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json());
app.use(express.static('public'));

// MongoDB connection with error handling
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/langstons-ant', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((error) => {
    console.error('MongoDB connection error:', error);
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
        console.log('Retrieved ants:', ants.length);
        res.json(ants);
    } catch (error) {
        console.error('Error fetching ants:', error);
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/ants', async (req, res) => {
    try {
        console.log('Received ant data:', req.body);
        const ant = new Ant(req.body);
        const savedAnt = await ant.save();
        console.log('Saved ant:', savedAnt);
        res.status(201).json(savedAnt);
    } catch (error) {
        console.error('Error saving ant:', error);
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

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 