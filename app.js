
const mongoose = require('mongoose');
const { getCountriesForIPs } = require('./ip_country');
const { ipToLong, generateIPRangesWithMask, convertToCIDR, getIPFromCIDR, longToIP, getTotalIPs, isOverlapping, publicIPRanges, combineIPRanges, getNonOverlappingRanges } = require('./IPTool');
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
const getCountriesForIPsFake = async (startIP, endIP) => {
    switch (startIP) {
        case '1.0.0.0':
            return [
                { ip: '1.0.0.0', country: 'AU' },
                { ip: '1.0.0.1', country: 'AU' },
                { ip: '1.0.0.2', country: 'CN' },
                { ip: '1.0.0.3', country: 'CN' },
                { ip: '1.0.0.4', country: 'AU' },
                { ip: '1.0.0.5', country: 'AU' },
                { ip: '1.0.0.6', country: 'AU' },
                { ip: '1.0.0.7', country: 'AU' },
                { ip: '1.0.0.8', country: 'CN' },
                { ip: '1.0.0.9', country: 'CN' },
                { ip: '1.0.0.10', country: 'CN' },
                { ip: '1.0.0.11', country: 'CN' },
                { ip: '1.0.0.12', country: 'US' },
                { ip: '1.0.0.13', country: 'US' },
                { ip: '1.0.0.14', country: 'US' },
                { ip: '1.0.0.15', country: 'US' },
            ];
        case '1.0.0.16':
            return [
                { ip: '1.0.0.16', country: 'US' },
                { ip: '1.0.0.17', country: 'US' },
                { ip: '1.0.0.18', country: 'CN' },
                { ip: '1.0.0.19', country: 'CN' },
                { ip: '1.0.0.20', country: 'CN' },
                { ip: '1.0.0.21', country: 'CN' },
                { ip: '1.0.0.22', country: 'CN' },
                { ip: '1.0.0.23', country: 'CN' },
                { ip: '1.0.0.24', country: 'CN' },
                { ip: '1.0.0.25', country: 'AU' },
                { ip: '1.0.0.26', country: 'CN' },
                { ip: '1.0.0.27', country: 'AU' },
                { ip: '1.0.0.28', country: 'CN' },
                { ip: '1.0.0.29', country: 'CN' },
                { ip: '1.0.0.30', country: 'CN' },
                { ip: '1.0.0.31', country: 'CN' },
            ];
        case '1.0.0.32':
            return [
                { ip: '1.0.0.32', country: 'CN' },
                { ip: '1.0.0.33', country: 'CN' },
                { ip: '1.0.0.34', country: 'US' },
                { ip: '1.0.0.35', country: 'US' },
                { ip: '1.0.0.36', country: 'US' },
                { ip: '1.0.0.37', country: 'CN' },
                { ip: '1.0.0.38', country: 'CN' },
                { ip: '1.0.0.39', country: 'CN' },
                { ip: '1.0.0.40', country: 'CN' },
                { ip: '1.0.0.41', country: 'CN' },
                { ip: '1.0.0.42', country: 'CN' },
                { ip: '1.0.0.43', country: 'CN' },
                { ip: '1.0.0.44', country: 'CN' },
                { ip: '1.0.0.45', country: 'CN' },
                { ip: '1.0.0.46', country: 'CN' },
                { ip: '1.0.0.47', country: 'CN' },
            ];
        case '1.0.0.48':
            return [
                { ip: '1.0.0.48', country: 'CN' },
                { ip: '1.0.0.49', country: 'CN' },
                { ip: '1.0.0.50', country: 'CN' },
                { ip: '1.0.0.51', country: 'CN' },
                { ip: '1.0.0.52', country: 'CN' },
                { ip: '1.0.0.53', country: 'CN' },
                { ip: '1.0.0.54', country: 'CN' },
                { ip: '1.0.0.55', country: 'CN' },
                { ip: '1.0.0.56', country: 'CN' },
                { ip: '1.0.0.57', country: 'CN' },
                { ip: '1.0.0.58', country: 'CN' },
                { ip: '1.0.0.59', country: 'CN' },
                { ip: '1.0.0.60', country: 'CN' },
                { ip: '1.0.0.61', country: 'CN' },
                { ip: '1.0.0.62', country: 'CN' },
                { ip: '1.0.0.63', country: 'CN' },
            ];
        default:
            return [
                { ip: '1.0.0.1', country: 'AU' },
                { ip: '1.0.0.2', country: 'AU' },
                { ip: '1.0.0.3', country: 'AU' },
                { ip: '1.0.0.4', country: 'AU' }
            ];
    }
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
            const ips = await getCountriesForIPs(nonOverlappingRange.startIP, nonOverlappingRange.endIP);
            if (nonOverlappingRange.headIPRange) {
                lastIPDecimal = nonOverlappingRange.headIPRange.endIPDecimal + 1;
                lastStartIP = nonOverlappingRange.headIPRange.startIP;  // Restored the missing assignment.
                lastCountry = nonOverlappingRange.headIPRange.country;
                _id = nonOverlappingRange.headIPRange.id;
            }
            for (const { ip, country } of ips) {
                if (needUpdate) {
                    if (country !== lastCountry) {
                        needUpdate = false;
                        if (newIPData.startIPDecimal) {
                            if (ip == nonOverlappingRange.endIP && nonOverlappingRange.tailIPRange) {
                                // todo
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
                                lastStartIP = newIPData.startIP;
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
                            //todo
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
        }
        if (newIPData.startIPDecimal) {
            if (needUpdate) {
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
            needUpdate = true;
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
            { start: '1.14.137.0', end: '1.14.137.255' },
            // { start: '1.14.136.0', end: '1.255.255.255' },
            // { start: '16.0.0.0', end: '16.255.255.255' },
        ]
    );
}
