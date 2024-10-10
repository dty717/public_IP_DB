const { exec } = require('child_process');

// Function to fetch country information for a given IP address
const getCountry = (ip) => {
    return new Promise((resolve, reject) => {
        exec(`whois ${ip}`, (error, stdout) => {
            if (error) {
                return reject(`Error: ${error.message}`);
            }
            const countryMatch = stdout.match(/[Cc]ountry:\s*(\w+)/);
            resolve(countryMatch ? countryMatch[1] : 'Unknown');
        });
    });
};

// Function to convert IP to long
const ipToLong = (ip) => {
    return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
};

// Function to convert long to IP
const longToIp = (long) => {
    return [
        (long >>> 24) >>> 0,
        (long >> 16 & 255) >>> 0,
        (long >> 8 & 255) >>> 0,
        (long & 255) >>> 0
    ].join('.');
};

// Function to expand an IP range and return all IPs
const expandRange = (startIP, endIP) => {
    const ips = [];
    let start = ipToLong(startIP);
    let end = ipToLong(endIP);
    for (let ip = start; ip <= end; ip++) {
        ips.push(longToIp(ip));
    }
    return ips;
};

// Function to get all IPs in a CIDR block
const getIPsFromCIDR = (cidr) => {
    const [baseIP, subnetMask] = cidr.split('/');
    const numIPs = 2 ** (32 - subnetMask);
    const baseLong = ipToLong(baseIP);
    return Array.from({ length: numIPs }, (_, i) => longToIp(baseLong + i));
};

// Main function to get country information for IPs
const getCountriesForIPs = async (startIP, endIP) => {
    const ips = startIP.includes('/') ? getIPsFromCIDR(startIP) : (endIP ? expandRange(startIP, endIP) : expandRange(startIP, startIP));
    const results = [];

    for (const ip of ips) {
        try {
            const country = await getCountry(ip);
            results.push({ ip, country });
        } catch (error) {
            console.error(`Failed to get country for ${ip}: ${error}`);
            results.push({ ip, country: 'Error' });
        }
    }
    return results;
};

// Exporting the module
module.exports = {
    getCountry,
    getCountriesForIPs,
};
