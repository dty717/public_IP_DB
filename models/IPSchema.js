
const mongoose = require('mongoose');

// Define the IP schema
const IPSchema = new mongoose.Schema({
    country:
    {
        type: String,
        required: true
    },
    startIP:
    {
        type: Number,
        required: true
    },
    endIP:
    {
        type: Number,
        required: true
    },
    total:
    {
        type: Number,
        required: true
    },
    ipString:
    {
        type: String,
        required: false
    },
});

mongoose.model('IPSchema', IPSchema);
