const { exec } = require('child_process');
const { expandRange, getIPsFromCIDR } = require('./IPTool');

// Function to fetch country information for a given IP address
const getCountry = (ip) => {
    // return new Promise((resolve, reject) => {
    //     resolve("AU");
    // });
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

// Main function to get country information for IPs
const getCountriesForIPs = async (startIP, endIP) => {
    const ips = startIP.includes('/') ? getIPsFromCIDR(startIP) : (endIP ? expandRange(startIP, endIP) : expandRange(startIP, startIP));
    const results = [];
    var lastPercentage = 0
    for (let index = 0; index < ips.length; index++) {
        const ip = ips[index];
        var percentage = parseInt(index / ips.length * 100);
        if (percentage > lastPercentage) {
            console.log(percentage + "%");
            lastPercentage = percentage
        }
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
