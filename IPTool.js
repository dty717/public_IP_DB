const publicIpRanges = [
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

function longToIp(long) {
    return [
        (long >>> 24) & 255,
        (long >>> 16) & 255,
        (long >>> 8) & 255,
        long & 255
    ].join('.');
}

function generateIpRanges(startIp, endIp) {
    const startLong = ipToLong(startIp);
    const endLong = ipToLong(endIp);
    const ranges = [];

    for (let i = startLong; i <= endLong; i += 1024) {
        ranges.push(`${longToIp(i)}/22`);  // Adding /22 subnet mask
    }

    return ranges;
}
const generatePublicIpRangesWithMask = () => {
    // Generate and print IP addresses with subnet mask
    let allIpAddresses = [];

    publicIpRanges.forEach(({ start, end }) => {
        const ranges = generateIpRanges(start, end);
        allIpAddresses = allIpAddresses.concat(ranges);
    });

    // Print all IP addresses with subnet mask, each on a new line
    return allIpAddresses;
};



function ipToBinary(ip) {
    return ip.split('.').map(num => {
        return ('00000000' + (+num).toString(2)).slice(-8); // Convert to binary and pad with zeros
    }).join('');
}

function commonPrefixLength(startIp, endIp) {
    const startBinary = ipToBinary(startIp);
    const endBinary = ipToBinary(endIp);

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

function getTotalIPs(startIp, endIp) {
    const startDecimal = ipToLong(startIp);
    const endDecimal = ipToLong(endIp);
    return endDecimal - startDecimal + 1; // Total number of IPs in the range
}

function convertToCIDR(startIp, endIp) {
    const totalIPs = getTotalIPs(startIp, endIp);
    const commonLength = commonPrefixLength(startIp, endIp);

    // Check if the total IPs fit within the CIDR block
    if (commonLength <= 24 && totalIPs == (1 << (32 - commonLength))) {
        return `${startIp}/${commonLength}`;
    }

    // Return the range in "startIp-endIp" format if it doesn't fit a CIDR block
    return `${startIp}-${endIp}`;
}

module.exports = { generatePublicIpRangesWithMask, ipToLong ,convertToCIDR };
