/*
Reserved_IP_addresses from https://en.wikipedia.org/wiki/Reserved_IP_addresses
Address block	     Address range	                Amount 	      Scope	            Description
0.0.0.0/8	         0.0.0.0–0.255.255.255	        16777216	  Software	        Current (local, "this") network[1]
10.0.0.0/8	         10.0.0.0–10.255.255.255	    16777216	  Private network	Used for local communications within a private network[3]
100.64.0.0/10	     100.64.0.0–100.127.255.255	    4194304	      Private network	Shared address space[4] for communications between a service provider and its subscribers when using a carrier-grade NAT
127.0.0.0/8	         127.0.0.0–127.255.255.255	    16777216	  Host	            Used for loopback addresses to the local host[1]
169.254.0.0/16	     169.254.0.0–169.254.255.255	65536	      Subnet	        Used for link-local addresses[5] between two hosts on a single link when no IP address is otherwise specified, such as would have normally been retrieved from a DHCP server
172.16.0.0/12	     172.16.0.0–172.31.255.255	    1048576	      Private network	Used for local communications within a private network[3]
192.0.0.0/24	     192.0.0.0–192.0.0.255	        256	          Private network	IETF Protocol Assignments, DS-Lite (/29)[1]
192.0.2.0/24	     192.0.2.0–192.0.2.255	        256	          Documentation	    Assigned as TEST-NET-1, documentation and examples[6]
192.88.99.0/24	     192.88.99.0–192.88.99.255	    256	          Internet	        Reserved.[7] Formerly used for IPv6 to IPv4 relay[8] (included IPv6 address block 2002::/16).
192.168.0.0/16	     192.168.0.0–192.168.255.255	65536	      Private network	Used for local communications within a private network[3]
198.18.0.0/15	     198.18.0.0–198.19.255.255	    131072	      Private network	Used for benchmark testing of inter-network communications between two separate subnets[9]
198.51.100.0/24	     198.51.100.0–198.51.100.255	256	          Documentation	    Assigned as TEST-NET-2, documentation and examples[6]
203.0.113.0/24	     203.0.113.0–203.0.113.255	    256	          Documentation	    Assigned as TEST-NET-3, documentation and examples[6]
224.0.0.0/4	         224.0.0.0–239.255.255.255	    268435456	  Internet	        In use for multicast[10] (former Class D network)
233.252.0.0/24	     233.252.0.0–233.252.0.255	    256	          Documentation 	Assigned as MCAST-TEST-NET, documentation and examples (Note that this is part of the above multicast space.)[10][11]
240.0.0.0/4	         240.0.0.0–255.255.255.254	    268435455	  Internet	        Reserved for future use[12] (former Class E network)
255.255.255.255/32	 255.255.255.255	            1	          Subnet        	Reserved for the "limited broadcast" destination address[1]
*/
/*? need to be valid
not match range 
192.0.1.0/24         192.0.1.0-192.0.1.255

*/
// test 198.51.99.255

/*
1.0.0.0         - 9.255.255.255
11.0.0.0        - 100.63.255.255
100.128.0.0     - 126.255.255.255
128.0.0.0       - 169.253.255.255
169.250.0.0     - 172.15.255.255
172.32.0.0      - 191.255.255.255
192.0.3.0       - 192.88.98.255
192.88.100.0    - 192.167.255.255
192.169.0.0     - 198.17.255.255
198.20.0.0      - 198.51.99.255
198.51.101.0    - 203.0.112.255
203.0.114.0     - 223.255.255.255
*/

const publicIPRanges = [
    { startIP: "1.0.0.0", endIP: "9.255.255.255" },
    { startIP: "11.0.0.0", endIP: "100.63.255.255" },
    { startIP: "100.128.0.0", endIP: "126.255.255.255" },
    { startIP: "128.0.0.0", endIP: "169.253.255.255" },
    { startIP: "169.250.0.0", endIP: "172.15.255.255" },
    { startIP: "172.32.0.0", endIP: "191.255.255.255" },
    { startIP: "192.0.3.0", endIP: "192.88.98.255" },
    { startIP: "192.88.100.0", endIP: "192.167.255.255" },
    { startIP: "192.169.0.0", endIP: "198.17.255.255" },
    { startIP: "198.20.0.0", endIP: "198.51.99.255" },
    { startIP: "198.51.101.0", endIP: "203.0.112.255" },
    { startIP: "203.0.114.0", endIP: "223.255.255.255" }
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
            } else if (currentDecimal > rangeEndDecimal + 1) {

            } else {
                currentDecimal = rangeEndDecimal + 1
                currentStartRange = range.tailIPRange;
            }
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
