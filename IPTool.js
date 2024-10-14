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
var ipRangeRegex = /(\d+\.\d+\.\d+\.\d+)\s*-\s*(\d+\.\d+\.\d+\.\d+)/
function getIPFromCIDR(cidr) {
    const ipRangeMatch = cidr.match(ipRangeRegex);
    if (ipRangeMatch) {
        return {
            startIP: ipRangeMatch[1],
            endIP: ipRangeMatch[2]
        };
    }
    const [baseIP, subnetMask] = cidr.split('/');
    const baseLong = ipToLong(baseIP);
    const totalHosts = Math.pow(2, 32 - subnetMask); // Total number of IPs in this subnet
    const lastIPDecimal = baseLong + totalHosts - 1; // Add total IPs minus 1 to get the last IP
    return {
        startIP: baseIP,
        endIP: longToIP(lastIPDecimal)
    }; // Convert decimal back to IP format
}

function generateIPRanges(startIP, endIP, blockNum = 2 ** 10) {
    var startLong = ipToLong(startIP);
    var endLong = ipToLong(endIP);
    if (startLong > endLong) {
        var temp = startLong;
        startLong = endLong;
        endLong = temp;
        temp = startIP;
        startIP = endIP;
        endIP = startIP;
    }
    const ranges = [];
    if (endLong - startLong < blockNum) {
        ranges.push(`${startIP}-${endIP}`);
        return ranges;
    }
    const newStartLong = Math.ceil(startLong / blockNum) * blockNum;
    const newEndLong = Math.floor(endLong / blockNum) * blockNum;

    if (newStartLong != startLong) {
        ranges.push(`${startIP}-${longToIP(newStartLong - 1)}`);  // Adding /22 subnet mask
    }
    for (let i = newStartLong; i < newEndLong; i += blockNum) {
        ranges.push(`${longToIP(i)}/${32 - (blockNum.toString(2).length - 1)}`);  // Adding /22 subnet mask
    }
    if (newEndLong != endLong) {
        ranges.push(`${longToIP(newEndLong)}-${endIP}`);  // Adding /22 subnet mask
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
        const rangeStartDecimal = ipToLong(range.startIP);

        if (combinedRanges.length === 0) {
            // Add the first range
            combinedRanges.push({
                startIP: range.startIP,
                endIP: range.endIP,
                headIPRange: range,
                tailIPRange: range
            });
        } else {
            const lastRange = combinedRanges[combinedRanges.length - 1];

            // Check if ranges are contiguous (last end IP + 1 matches current start IP)
            if (ipToLong(lastRange.endIP) + 1 === rangeStartDecimal) {
                // Merge the ranges by updating the end IP and attributes
                lastRange.tailIPRange = range;
                lastRange.endIP = range.endIP;
            } else {
                // Add the new range if not contiguous
                combinedRanges.push({
                    startIP: range.startIP,
                    endIP: range.endIP,
                    headIPRange: range,
                    tailIPRange: range
                });
            }
        }
    }
    return combinedRanges;
}

// Function to check if a new range overlaps with any existing ranges
function isOverlapping(newRange, existingRange) {
    if (
        ipToLong(newRange.startIP) <= ipToLong(existingRange.endIP) &&
        ipToLong(newRange.endIP) >= ipToLong(existingRange.startIP)
    ) {
        return true; // Overlap found
    }
    return false; // No overlap if it reaches here
}

// Other parts of your script remain unchanged


function getNonOverlappingRanges(startIP, endIP, combinedRanges) {
    const startDecimal = ipToLong(startIP);
    const endDecimal = ipToLong(endIP);

    const nonOverlappingRanges = [];
    const combinedRangesLen = combinedRanges.length;
    if (!combinedRangesLen) {
        nonOverlappingRanges.push(
            {
                startIP: startIP,
                endIP: endIP,
            }
        )
        return nonOverlappingRanges;
    }
    let currentDecimal = startDecimal;
    let currentStartRange;
    for (let index = 0; index < combinedRangesLen && currentDecimal <= endDecimal; index++) {
        const range = combinedRanges[index];
        const rangeStartDecimal = ipToLong(range.startIP);
        const rangeEndDecimal = ipToLong(range.endIP);
        if (endDecimal < rangeStartDecimal - 1) {
            if (currentStartRange) {
                nonOverlappingRanges.push(
                    {
                        startIP: longToIP(currentDecimal),
                        endIP: endIP,
                        headIPRange: currentStartRange
                    }
                )
            } else {
                nonOverlappingRanges.push(
                    {
                        startIP: longToIP(currentDecimal),
                        endIP: endIP,
                    }
                )
            }
            return nonOverlappingRanges;
        } else {
            if (currentDecimal < rangeStartDecimal) {
                if (currentStartRange) {
                    nonOverlappingRanges.push(
                        {
                            startIP: longToIP(currentDecimal),
                            endIP: longToIP(rangeStartDecimal - 1),
                            headIPRange: currentStartRange,
                            tailIPRange: range.headIPRange
                        }
                    )
                } else {
                    nonOverlappingRanges.push(
                        {
                            startIP: longToIP(currentDecimal),
                            endIP: longToIP(rangeStartDecimal - 1),
                            tailIPRange: range.headIPRange
                        }
                    )
                }
            }
            currentDecimal = rangeEndDecimal + 1
            currentStartRange = range.tailIPRange;
        }
    }
    if (currentDecimal <= endDecimal) {
        if (currentStartRange) {
            nonOverlappingRanges.push(
                {
                    startIP: longToIP(currentDecimal),
                    endIP: endIP,
                    headIPRange: currentStartRange
                }
            )
        } else {
            nonOverlappingRanges.push(
                {
                    startIP: longToIP(currentDecimal),
                    endIP: endIP
                }
            )
        }
    }
    return nonOverlappingRanges;
}

module.exports = { generateIPRangesWithMask, convertToCIDR, getTotalIPs, ipToLong, longToIP, expandRange, getIPsFromCIDR, getIPFromCIDR, combineIPRanges, isOverlapping, publicIPRanges, getNonOverlappingRanges };
