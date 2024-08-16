const fs = require('fs');
const path = require('path');
const { getCurrentDateAndDate } = require('./time');


/*
Constructs an absolute path to the log directory based on the directory where
the script file is
 */
const logDir = path.join(__dirname, '../log');
if (!fs.existsSync(logDir)) { // existsSync checks if the log directory exists
    fs.mkdirSync(logDir); // If not, mkdirSync creates the directory
}

/*
Does both console.log and log the message to a file
 */
function log(message) {
    const timestamp = getCurrentDateAndDate();
    const currentDate = timestamp.slice(0, 10); // "2024-05-18"
    // Example logfile path: '../log/2024-05-18_main.log'
    const logfile = path.join(logDir, `${currentDate}_main.log`);

    const logEntry = `${timestamp} ${message}\n`;
    console.log(logEntry.trim());

    try { // Appends the log entry to the file specified by logfile
        fs.appendFileSync(logfile, logEntry, { encoding: 'utf8' });
    } catch (err) {
        console.error(`${timestamp} ERROR in log(): ${err}`);
    }

    return timestamp;
}

function handleError(e) {
    try {
        const logTimestamp = log(`ERROR TRACE:\n${e.stack}\n# TRACE END\n`);
        // Add webhook or other error handling logic here
    } catch (err) {
        const timestamp = getCurrentDateAndDate();
        console.error(`${timestamp} ERROR in handleError(): ${err}`);
    }
}

// Export functions if needed
module.exports = {
    log,
    handleError
};
