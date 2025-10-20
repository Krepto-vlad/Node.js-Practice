const fs = require('fs').promises;
const path = require('path');
const Logger = require('./logger');

const LOGS_ROOT = path.join(__dirname, './logs');

async function analyzeLogs(typeFilter) {
  let stats = {
    success: 0,
    error: 0,
    warning: 0,
    malformed: 0,
    total: 0
  };

  try {
    const folders = await fs.readdir(LOGS_ROOT);
    for (const folder of folders) {
      const folderPath = path.join(LOGS_ROOT, folder);
      let files;
      try {
        files = await fs.readdir(folderPath);
      } catch (e) {
        console.error(`Could not read folder ${folderPath}: ${e.message}`);
        continue;
      }

      for (const file of files) {
        const filePath = path.join(folderPath, file);
        let content;
        try {
          content = await fs.readFile(filePath, 'utf-8');
        } catch (e) {
          console.error(`Could not read file ${filePath}: ${e.message}`);
          continue;
        }
        const log = Logger.parseLogLine(content);
        if (!log || !log.type) {
          stats.malformed++;
          continue;
        }
        if (typeFilter && log.type !== typeFilter) continue;
        if (['success', 'error', 'warning'].includes(log.type)) {
          stats[log.type]++;
        }
        stats.total++;
      }
    }
    console.log('Log Statistics:');
    if (typeFilter) {
      console.log(`Filter: ${typeFilter}`);
      console.log(`${typeFilter}: ${stats[typeFilter]}`);
    } else {
      console.log(`Success: ${stats.success}`);
      console.log(`Error: ${stats.error}`);
      console.log(`Warning: ${stats.warning}`);
    }
    console.log(`Malformed: ${stats.malformed}`);
    console.log(`Total processed: ${stats.total}`);
  } catch (e) {
    if (e.code === 'ENOENT') {
      console.error('Logs folder not found. Please run the log generator FIRST! :(');
    } else {
      console.error('Error during log analysis:', e.message);
    }
  }
}

function printHelp() {
  console.log(`
Usage: node analyzer.js (--type success/error/warning) or (--help)

--type <type>   Filter logs by type (success, error, warning)
--help          Show this help message
`);
}


function main() {
  const args = process.argv.slice(2);
  let typeFilter = null;
  if (args.includes('--type')) {
    const idx = args.indexOf('--type');
    typeFilter = args[idx + 1];
    if (!['success', 'error', 'warning'].includes(typeFilter)) {
      console.error('Invalid type for filtering. Use success, error, or warning.');
      printHelp();
      process.exit(1);
    }
  }
  if (args.includes('--help')) {
    printHelp();
    process.exit(0);
  }
  console.log('Log Analyzer started! If you want to see all available commands, run: npm run analyze -- --help \n');
  analyzeLogs(typeFilter);
}

main();