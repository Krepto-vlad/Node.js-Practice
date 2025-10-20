# Log Generator & Analyzer

This project consists of two Node.js applications:

- **Log Generator**: Periodically creates folders and log files with random log entries.
- **Log Analyzer**: Analyzes generated logs and provides statistics, with CLI filtering support.

---

## Installation

1. Clone or download this repository.
2. Install dependencies: npm install.

---

## Usage

1. To start the Log Generator use: "npm start" or "node generator.js"

This will start generating logs in the **/logs** folder.

- A new folder will be created every minute.
- A new log file will be created every 10 seconds in the current minute's folder.
- To stop the generator, type exit in the console or press Ctrl+C.

2. Analyze Logs
You can analyze all logs or filter by type.

- Analyze all logs: "npm run analyze" or "node analyzer.js"

- Filter logs by type:
    "npm run analyze -- --type success",
    "npm run analyze -- --type error",
    "npm run analyze -- --type warning",

- Show help: "npm run analyze -- --help"

---

## Notes
- Make sure the generator is running for logs to be available for analysis.
- The /logs folder will be created automatically if it does not exist.