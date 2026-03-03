const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Item = require('./models/Item');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;
// Log URI with hidden password
const sanitizedUri = MONGODB_URI.replace(/:([^:@]+)@/, ':****@');
console.log('Connecting to:', sanitizedUri);

mongoose.set('bufferCommands', false); // Fail immediately if not connected

mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000 // Fast fail
})
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => {
        console.error('MongoDB connection error:', err.message);
        if (err.message.includes('Authentication failed')) {
            console.error('CRITICAL: Incorrect username or password in .env');
        }
    });

// Routes
app.get('/', (req, res) => {
    res.json({ message: 'Task Master API is running' });
});

// DB Test Route
app.get('/api/db-test', async (req, res) => {
    try {
        const state = mongoose.connection.readyState;
        const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
        res.json({
            status: states[state],
            dbName: mongoose.connection.name,
            uri_configured: !!process.env.MONGODB_URI
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CREATE
app.post('/api/items', async (req, res) => {
    try {
        const newItem = new Item(req.body);
        const savedItem = await newItem.save();
        res.status(201).json(savedItem);
    } catch (err) {
        console.error('POST Error:', err.message);
        res.status(400).json({
            message: 'Validation or Save Error',
            error: err.message,
            receivedData: req.body
        });
    }
});

// READ ALL
app.get('/api/items', async (req, res) => {
    try {
        const items = await Item.find().sort({ createdAt: -1 });
        res.json(items);
    } catch (err) {
        console.error('GET Error:', err.message);
        res.status(500).json({
            message: 'Failed to fetch items',
            error: err.message,
            stack: process.env.NODE_ENV === 'production' ? null : err.stack
        });
    }
});

// UPDATE
app.put('/api/items/:id', async (req, res) => {
    try {
        const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedItem);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE
app.delete('/api/items/:id', async (req, res) => {
    try {
        await Item.findByIdAndDelete(req.params.id);
        res.json({ message: 'Item deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
