const publicIPRanges = [
    { start: '1.0.0.0', end: '9.255.255.255' },
    { start: '11.0.0.0', end: '126.255.255.255' },
    { start: '129.0.0.0', end: '169.253.255.255' },
    { start: '169.255.0.0', end: '172.15.255.255' },
    { start: '172.32.0.0', end: '191.0.1.255' },
    { start: '192.0.3.0', end: '192.88.98.255' },
    { start: '192.88.100.0', end: '192.167.255.255' },
    { start: '192.169.0.0', end: '198.17.255.255' },
    { start: '198.20.0.0', end: '223.255.255.255' },
];

function ipToLong(ip) {
    return ip.split('.').reduce((acc, octet) => {
        return (acc << 8) + parseInt(octet, 10);
    }, 0) >>> 0;
}

function longToIP(long) {
    return [
        (long >>> 24) & 255,
        (long >>> 16) & 255,
        (long >>> 8) & 255,
        long & 255
    ].join('.');
}


// Function to expand an IP range and return all IPs
const expandRange = (startIP, endIP) => {
    const ips = [];
    let start = ipToLong(startIP);
    let end = ipToLong(endIP);
    for (let ip = start; ip <= end; ip++) {
        ips.push(longToIP(ip));
    }
    return ips;
};

// Function to get all IPs in a CIDR block
const getIPsFromCIDR = (cidr) => {
    const [baseIP, subnetMask] = cidr.split('/');
    const numIPs = 2 ** (32 - subnetMask);
    const baseLong = ipToLong(baseIP);
    return Array.from({ length: numIPs }, (_, i) => longToIP(baseLong + i));
};

function getIPFromCIDR(cidr) {
    const [baseIP, subnetMask] = cidr.split('/');
    const baseLong = ipToLong(baseIP);
    const totalHosts = Math.pow(2, 32 - subnetMask); // Total number of IPs in this subnet
    const lastIPDecimal = baseLong + totalHosts - 1; // Add total IPs minus 1 to get the last IP
    return {
        startIP: baseIP,
        endIP: longToIP(lastIPDecimal)
    }; // Convert decimal back to IP format
}

function generateIPRanges(startIP, endIP, blockNum = 1024) {
    const startLong = ipToLong(startIP);
    const endLong = ipToLong(endIP);
    const ranges = [];

    for (let i = startLong; i <= endLong; i += blockNum) {
        ranges.push(`${longToIP(i)}/${32 - (blockNum.toString(2).length - 1)}`);  // Adding /22 subnet mask
    }

    return ranges;
}
const generateIPRangesWithMask = (IPRanges) => {
    // Generate and print IP addresses with subnet mask
    let allIPAddresses = [];

    IPRanges.forEach(({ start, end }) => {
        const ranges = generateIPRanges(start, end);
        allIPAddresses = allIPAddresses.concat(ranges);
    });

    // Print all IP addresses with subnet mask, each on a new line
    return allIPAddresses;
};



function ipToBinary(ip) {
    return ip.split('.').map(num => {
        return ('00000000' + (+num).toString(2)).slice(-8); // Convert to binary and pad with zeros
    }).join('');
}

function commonPrefixLength(startIP, endIP) {
    const startBinary = ipToBinary(startIP);
    const endBinary = ipToBinary(endIP);

    let commonLength = 0;
    for (let i = 0; i < startBinary.length; i++) {
        if (startBinary[i] === endBinary[i]) {
            commonLength++;
        } else {
            break; // Stop at the first differing bit
        }
    }
    return commonLength;
}

function getTotalIPs(startIP, endIP) {
    const startDecimal = ipToLong(startIP);
    const endDecimal = ipToLong(endIP);
    return Math.abs(endDecimal - startDecimal + 1); // Total number of IPs in the range
}

function convertToCIDR(startIP, endIP) {
    const totalIPs = getTotalIPs(startIP, endIP);
    const commonLength = commonPrefixLength(startIP, endIP);

    // Check if the total IPs fit within the CIDR block
    if (commonLength <= 32 && totalIPs == (1 << (32 - commonLength))) {
        return `${startIP}/${commonLength}`;
    }

    // Return the range in "startIP-endIP" format if it doesn't fit a CIDR block
    return `${startIP}-${endIP}`;
}

// Function to combine IP ranges if they are contiguous
function combineIPRanges(ipRanges) {
    // Sort the ranges by start IP
    ipRanges.sort((a, b) => ipToLong(a.startIP) - ipToLong(b.startIP));

    const combinedRanges = [];

    for (const range of ipRanges) {
        if (combinedRanges.length === 0) {
            combinedRanges.push({
                startIP: range.startIP,
                endIP: range.endIP
            }); // Store only start and end IP
        } else {
            const lastRange = combinedRanges[combinedRanges.length - 1];
            if (ipToLong(lastRange.endIP) + 1 === ipToLong(range.startIP)) {
                // Merge ranges
                lastRange.endIP = range.endIP; // Update the end IP of the last range
            } else {
                combinedRanges.push({
                    startIP: range.startIP,
                    endIP: range.endIP
                }); // Store only start and end IP
            }
        }
    }

    return combinedRanges;
}

// Function to check if a new range overlaps with any existing ranges
function isOverlapping(newRange, existingRanges) {
    for (const range of existingRanges) {
        // Check if there is an overlap
        if (
            ipToLong(newRange.startIP) <= ipToLong(range.endIP) &&
            ipToLong(newRange.endIP) >= ipToLong(range.startIP)
        ) {
            return true; // Overlap found
        }
    }
    return false; // No overlap if it reaches here
}

// Other parts of your script remain unchanged


module.exports = { generateIPRangesWithMask, convertToCIDR, getTotalIPs, ipToLong, longToIP, expandRange, getIPsFromCIDR, getIPFromCIDR, combineIPRanges, isOverlapping, publicIPRanges };
