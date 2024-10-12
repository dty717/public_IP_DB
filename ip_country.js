const { exec } = require('child_process');
const { expandRange, getIPsFromCIDR } = require('./IPTool');

// Function to fetch country information for a given IP address
const getCountry = (ip) => {
    // return new Promise(resolve => setTimeout(()=>resolve("AU"), 10));
    return new Promise((resolve, reject) => {
        exec(`whois ${ip}`, (error, stdout) => {
            if (error) {
                return reject(`Error: ${error.message}`);
            }
            if (stdout.includes('ERROR')) {
                console.log(ip, stdout)
                process.exit(1);
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
                const country = await getCountry(ip);
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

// Exporting the module
module.exports = {
    getCountry,
    getCountriesForIPs,
};
