
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
    
    var lastIPData = await IPSchema.findOne({ endIP: -1 })
    var lastIPDecimal = ipToLong('1.0.0.0')
    var lastCountry = ""
    if (lastIPData) {
        lastIPDecimal = lastIPData.endIPDecimal + 1;
        lastCountry = lastIPData.country
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
    var newIPData = {
        startIPDecimal: 0,
        endIPDecimal: 0xffff_ffff,
    }
    var needInitUpdate = true
    for (const entry of IPList) {
        var lastEntryIP = getLastIPFromCIDR(entry);
        console.log({entry})
        const ips = await getCountriesForIPs(longToIP(lastIPDecimal), lastEntryIP);
        for (let ipIndex = 0; ipIndex < ips.length; ipIndex++) {
            const { ip, country } = ips[ipIndex];
            if(needInitUpdate){
                if (country != lastCountry){
                    needInitUpdate = false;
                    if (newIPData.startIPDecimal != 0){
                        // update last ip data
                        newIPData.startIPDecimal = 0;
                        continue;
                    }
                }else{
                    if (newIPData.startIPDecimal != 0) {
                        newIPData.startIPDecimal = lastIPDecimal
                    }
                    newIPData.endIPDecimal = ip;
                }
                continue;
            }
            console.log(ip)
            break;
            // {
            //     if(newIPData.finished){

            //     }else{
    
            //     }
            // }
        }
        console.log(ips);
    }
};

processIPs();
