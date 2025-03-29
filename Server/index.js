import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import Alumnisignin1 from './Models/Alumnisignin.js';
import Alumni from './Models/AlumniFind.js';

dotenv.config(); // Load environment variables

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI) // Use environment variable for MongoDB URI
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("Failed to connect to MongoDB:", err));

// Login route
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await Alumnisignin1.findOne({ email, password });
        if (user) {
            res.json(user.password === password ? "Login Success" : "Invalid Credentials");
        } else {
            res.json("Please Sign in");
        }
    } catch (err) {
        res.status(500).json(err);
    }
});

// Signup route
app.post('/signin', async (req, res) => {
    try {
        const newUser = await Alumnisignin1.create(req.body);
        res.json(newUser);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Get all alumni with optional filters
app.get('/alumni', async (req, res) => {
    try {
        const { name, industry, location, year } = req.query; // Updated to match "Year"
        const filter = {};
        if (name) filter.name = { $regex: name, $options: 'i' };
        if (industry) filter.industry = industry;
        if (location) filter.Location = location;
        if (year) filter.Year = year;

        const alumni = await Alumni.find(filter);
        res.json(alumni);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Add a new alumni
app.post('/alumni', async (req, res) => {
    try {
        const newAlumni = await Alumni.create(req.body);
        res.json(newAlumni);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Update an alumni by ID
app.put('/alumni/:id', async (req, res) => {
    try {
        const updatedAlumni = await Alumni.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedAlumni);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Delete an alumni by ID
app.delete('/alumni/:id', async (req, res) => {
    try {
        await Alumni.findByIdAndDelete(req.params.id);
        res.json({ message: "Alumni deleted successfully" });
    } catch (err) {
        res.status(500).json(err);
    }
});

app.listen(3001, () => {
    console.log("Server is running on port 3001");
});
