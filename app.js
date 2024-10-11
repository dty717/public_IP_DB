
const mongoose = require('mongoose');
const { getCountriesForIPs } = require('./ip_country');
const { ipToLong, generatePublicIPRangesWithMask,convertToCIDR, getLastIPFromCIDR, longToIP } = require('./IPTool');
const { mongoUri } = require('./config'); // Import the config file
require('./models/IPSchema');


if (!mongoUri) {
    throw new Error(
        `MongoURI was not supplied.  Make sure you watch the video on setting up Mongo DB!`
    );
}
mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useCreateIndex: true
});
mongoose.connection.on('connected', () => {
    console.log('Connected to mongo instance');
});
mongoose.connection.on('error', err => {
    console.error('Error connecting to mongo', err);
});

const IPSchema = mongoose.model('IPSchema');

const processIPs = async () => {
    // await 
    var lastIPData = await IPSchema.findOne({ endIP: -1 })
    var lastIPDecimal = ipToLong('1.0.0.0')
    if (lastIPData) {
        lastIPDecimal = ipToLong(lastIPDecimal.endIP + 1)
    }
    var IPList = generatePublicIPRangesWithMask();

    // Loop through the array and remove the first element if it's greater than 1
    for (let i = 0; i < IPList.length; i++) {
        if (ipToLong(IPList[0]) > lastIPDecimal) { // Check if the first element is greater than 1
            IPList.shift(); // Remove the first element
        } else {
            break; // Exit the loop if the first element is not greater than 1
        }
    }

    console.log('Final Array:', IPList); // Output the remaining elements
    
    // startIP    endIP
    //               IP
    //        s'             e'      
    console.log(lastIPDecimal)
    for (const entry of IPList) {
        var lastEntryIP = getLastIPFromCIDR(entry);
        console.log({entry})
        const ips = await getCountriesForIPs(lastIPDecimal, lastEntryIP);
        console.log(ips);
    }
};

processIPs();
