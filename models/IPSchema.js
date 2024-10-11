
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
        required: true,
    },
    endIP:
    {
        type: String,
        required: true,
    },
    startIPDecimal:
    {
        type: Number,
        required: true,
        unique:true
    },
    endIPDecimal:
    {
        type: Number,
        required: true,
        unique:true
    },
    total:
    {
        type: Number,
        required: true
    },
    CIDR:
    {
        type: String,
        required: false
    },
});

mongoose.model('IP', IPSchema);
