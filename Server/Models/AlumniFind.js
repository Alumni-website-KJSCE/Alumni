import mongoose from 'mongoose';

const AlumniSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    industry: {
        type: String,
    },
    Location: {
        type: String,
    },
    Year: {
        type: String, // Changed to String to match the provided structure
    }
});

const Alumni = mongoose.model('Alumni', AlumniSchema);
export default Alumni;