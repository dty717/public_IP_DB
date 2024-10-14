
const mongoose = require('mongoose');
const { getCountriesForIPs } = require('./ip_country');
const { ipToLong, generateIPRangesWithMask, convertToCIDR, getIPFromCIDR, longToIP, getTotalIPs, isOverlapping, publicIPRanges, combineIPRanges, getNonOverlappingRanges, getIPsFromCIDR, expandRange } = require('./IPTool');
const { mongoUri } = require('./config'); // Import the config file
require('./models/IPSchema');

const _startIP = process.argv.length === 4 ? process.argv[2] : null;
const _endIP = process.argv.length === 4 ? process.argv[3] : null;

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

const IPSchema = mongoose.model('IP');

// Main function to get country information for IPs
const getFakeCountriesForIPs = async (startIP, endIP) => {
    const ips = startIP.includes('/') ? getIPsFromCIDR(startIP) : (endIP ? expandRange(startIP, endIP) : expandRange(startIP, startIP));
    const results = [];
    var lastPercentage = 0

    const maxRetries = 3; // Number of times to retry
    let attempts = 0; // Current attempt count
    let success = false; // Success flag
    const retryDuring = 500;
    for (let index = 0; index < ips.length; index++) {
        const ip = ips[index];
        var percentage = parseInt(index / ips.length * 100);
        if (percentage > lastPercentage) {
            console.log(percentage + "%");
            lastPercentage = percentage
        }

        while (attempts < maxRetries && !success) {
            try {
                attempts++;
                // await new Promise(resolve => setTimeout(resolve, 1)); // 1-second delay
                const country = "CN"
                results.push({ ip, country });
                success = true; // Set success to true if no error occurs
            } catch (error) {
                console.error(`Attempt ${attempts} Failed to get country for ${ip}: ${error}`);

                if (attempts >= maxRetries) {
                    console.error('Max retries reached. Exiting.');
                    process.exit(1);
                    // throw new Error('Failed to get countries for the given IP range after multiple attempts.');
                }
                await new Promise(resolve => setTimeout(resolve, retryDuring)); // 1-second delay
            }
        }
        success = false; 
        attempts = 0;
    }
    return results;
};

const generateFakePublicIPRangesWithMask = () => {
    return [
        '1.0.0.0/28'
        , '1.0.0.16/28', '1.0.0.32/28', '1.0.0.48/28'
    ]
};

const processIPs = async (ipRanges) => {
    var IPList = generateIPRangesWithMask(ipRanges);
    var IPListLen = IPList.length;

    if (!IPListLen) {
        console.log("IPListLen error:", ipRanges);
        return;  // Stop further execution if IPList is empty.
    }

    var firstIPRange = getIPFromCIDR(IPList[0])
    var lastIPRange = getIPFromCIDR(IPList[IPListLen - 1]);

    var ipDatas = await IPSchema.find({
        endIPDecimal: { $gte: ipToLong(firstIPRange.startIP) - 1 },
        startIPDecimal: { $lte: ipToLong(lastIPRange.endIP) + 1 }
    });

    var combinedRanges = combineIPRanges(ipDatas);

    var lastIPDecimal = ipToLong(firstIPRange.startIP);
    var lastStartIP = firstIPRange.startIP;
    var lastCountry = "";
    var _id = "";

    console.log("Final Array:", IPList);

    var newIPData = {
        startIPDecimal: 0,
        startIP: "0.0.0.0",
        endIPDecimal: 0xffffffff,
        endIP: "255.255.255.255"
    };
    var needUpdate = true;

    for (const entry of IPList) {
        var { startIP: entryStartIP, endIP: entryEndIP } = getIPFromCIDR(entry)
        var nonOverlappingRanges = getNonOverlappingRanges(entryStartIP, entryEndIP, combinedRanges);
        for (const nonOverlappingRange of nonOverlappingRanges) {
            if (nonOverlappingRange.headIPRange) {
                lastIPDecimal = nonOverlappingRange.headIPRange.endIPDecimal + 1;
                lastStartIP = nonOverlappingRange.headIPRange.startIP;  // Restored the missing assignment.
                lastCountry = nonOverlappingRange.headIPRange.country;
                _id = nonOverlappingRange.headIPRange.id;
            }
            const ips = await getCountriesForIPs(nonOverlappingRange.startIP, nonOverlappingRange.endIP);
            for (const { ip, country } of ips) {
                if (needUpdate) {
                    if (country !== lastCountry) {
                        needUpdate = false;
                        if (newIPData.startIPDecimal) {
                            if (ip == nonOverlappingRange.endIP && nonOverlappingRange.tailIPRange) {
                                // todo
                                console.log("todo code D2024_10_14 line 130")
                                process.exit(1);
                            } else {
                                await IPSchema.updateOne(
                                    { _id },
                                    {
                                        $set: {
                                            endIP: newIPData.endIP,
                                            endIPDecimal: newIPData.endIPDecimal,
                                            total: getTotalIPs(lastStartIP, newIPData.endIP),
                                            CIDR: convertToCIDR(lastStartIP, newIPData.endIP)
                                        }
                                    }
                                );
                                lastIPDecimal = newIPData.endIPDecimal + 1;
                                // lastStartIP = newIPData.startIP;
                                newIPData.startIPDecimal = ipToLong(ip);
                                newIPData.startIP = ip;
                                newIPData.endIPDecimal = ipToLong(ip);
                                newIPData.endIP = ip;
                                lastCountry = country;
                            }
                            continue;
                        }
                    } else {
                        if (!newIPData.startIPDecimal) {
                            newIPData.startIPDecimal = ipToLong(lastStartIP);
                            newIPData.startIP = lastStartIP;
                        }
                        newIPData.endIPDecimal = ipToLong(ip);
                        newIPData.endIP = ip;
                        continue;
                    }
                }

                if (country !== lastCountry) {
                    if (!newIPData.startIPDecimal) {
                        newIPData.startIPDecimal = ipToLong(ip);
                        newIPData.startIP = ip;
                    } else {
                        if (ip == nonOverlappingRange.endIP && nonOverlappingRange.tailIPRange) {
                            // todo
                            console.log("todo code D2024_10_14 line172")
                            process.exit(1);
                        } else {
                            var ipData = new IPSchema({
                                ...newIPData,
                                country: lastCountry,
                                total: getTotalIPs(newIPData.startIP, newIPData.endIP),
                                CIDR: convertToCIDR(newIPData.startIP, newIPData.endIP)
                            });
                            await ipData.save();
                            _id = ipData.id;
                            lastIPDecimal = ipData.endIPDecimal + 1;
                            lastStartIP = ipData.startIP;
                            newIPData.startIPDecimal = ipToLong(ip);
                            newIPData.startIP = ip;
                        }
                    }
                    lastCountry = country;
                } else {
                    if (!newIPData.startIPDecimal) {
                        newIPData.startIPDecimal = ipToLong(ip);
                        newIPData.startIP = ip;
                    }
                }
                newIPData.endIPDecimal = ipToLong(ip);
                newIPData.endIP = ip;
            }
            if (newIPData.startIPDecimal) {
                if (needUpdate) {
                    if (nonOverlappingRange.tailIPRange && newIPData.endIPDecimal == nonOverlappingRange.tailIPRange.startIPDecimal - 1) {
                        var tailIPRange = nonOverlappingRange.tailIPRange;
                        await IPSchema.deleteOne({
                            _id: tailIPRange.id
                        })
                        await IPSchema.updateOne(
                            { _id },
                            {
                                $set: {
                                    endIP: tailIPRange.endIP,
                                    endIPDecimal: tailIPRange.endIPDecimal,
                                    total: getTotalIPs(lastStartIP, tailIPRange.endIP),
                                    CIDR: convertToCIDR(lastStartIP, tailIPRange.endIP)
                                }
                            }
                        );
                        tailIPRange._id = _id
                        tailIPRange.startIP = lastStartIP
                        tailIPRange.startIPDecimal = ipToLong(lastStartIP);
                        lastIPDecimal = tailIPRange.endIPDecimal + 1;
                        // lastStartIP = newIPData.startIP;
                        newIPData.startIPDecimal = 0;
                    }else{
                        await IPSchema.updateOne(
                            { _id },
                            {
                                $set: {
                                    endIP: newIPData.endIP,
                                    endIPDecimal: newIPData.endIPDecimal,
                                    total: getTotalIPs(lastStartIP, newIPData.endIP),
                                    CIDR: convertToCIDR(lastStartIP, newIPData.endIP)
                                }
                            }
                        );
                        lastIPDecimal = newIPData.endIPDecimal + 1;
                        lastStartIP = newIPData.startIP;
                        newIPData.startIPDecimal = 0;
                    }
    
                } else {
                    if (nonOverlappingRanges.length && nonOverlappingRange.tailIPRange
                        && newIPData.endIPDecimal == nonOverlappingRange.tailIPRange.startIPDecimal - 1) {
                        var tailIPRange = nonOverlappingRange.tailIPRange;
                        _id = tailIPRange.id
                        await IPSchema.updateOne(
                            { _id },
                            {
                                $set: {
                                    startIP: newIPData.startIP,
                                    startIPDecimal: newIPData.startIPDecimal,
                                    total: getTotalIPs(newIPData.startIP, tailIPRange.endIP),
                                    CIDR: convertToCIDR(newIPData.startIP, tailIPRange.endIP)
                                }
                            }
                        );
                        tailIPRange.startIP = newIPData.startIP
                        tailIPRange.startIPDecimal = newIPData.startIPDecimal
                        lastIPDecimal = tailIPRange.endIPDecimal + 1;
                        // lastStartIP = newIPData.startIP;
                        newIPData.startIPDecimal = 0;
                    } else {
                        var ipData = new IPSchema({
                            ...newIPData,
                            country: lastCountry,
                            total: getTotalIPs(newIPData.startIP, newIPData.endIP),
                            CIDR: convertToCIDR(newIPData.startIP, newIPData.endIP)
                        });
                        await ipData.save();
                        _id = ipData.id;
                        lastIPDecimal = ipData.endIPDecimal + 1;
                        lastStartIP = ipData.startIP;
                        newIPData.startIPDecimal = 0;
                    }
                    
                }
                needUpdate = true;
            }
        }
    }
};



if (_startIP && _endIP) {
    processIPs(
        [{ start: _startIP, end: _endIP },]
    );
} else {
    // processIPs(publicIPRanges);
    processIPs(
        [
            // { start: '1.14.142.1', end: '1.14.142.3' },
            // { start: '1.14.142.8', end: '1.14.142.12' },
            { start: '1.14.142.0', end: '1.14.142.20' },
            // { start: '16.0.0.0', end: '16.255.255.255' },
        ]
    );
}
