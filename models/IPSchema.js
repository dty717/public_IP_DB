
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
        type: String,
        required: true
    },
    endIP:
    {
        type: String,
        required: true
    },
    startIPDecimal:
    {
        type: Number,
        required: true
    },
    endIPDecimal:
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
