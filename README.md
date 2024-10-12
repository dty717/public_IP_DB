# IP Country Database

This project maintains a database of IP address ranges associated with their respective countries.

## Table of Contents

- [Pre-Installation Requirements](#pre-installation-requirements)
- [Installation](#installation)
- [Usage](#usage)
- [License](#license)
- [Acknowledgements](#acknowledgements)

## Pre-Installation Requirements

Before installing this project, ensure you have the following software installed:

- **Node.js** 
- **MongoDB** 
- **npm** 

## Installation

0. Install the whois:
```bash
sudo apt-get install whois
```

1. Clone the repository:

```bash
git clone https://github.com/dty717/public_IP_DB.git
```

2. Navigate to the project directory:

```bash
cd public_IP_DB
```

3. Install dependencies:

```bash
npm install
```

4. Create a `config.js` file to store your MongoDB connection string:
```
// config.js
module.exports = {
    mongoUri: 'your_mongodb_connection_string', // Replace with your actual MongoDB connection string
};
```

## Usage

1. Start the application:

```bash
node app.js
```
or to check an IP range, run:
```bash
node app.js <start IP> <end IP>
```
## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

This project was generated from ChatGPT and modified by dty717
