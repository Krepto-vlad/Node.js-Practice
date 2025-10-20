class Logger {
  constructor(logDir) {
    this.logDir = logDir;
  }

    static getMessage(type) {
    switch (type) {
      case 'success': return 'Everything went according to plan! Hooray!';
      case 'error':   return 'Oops, error! Someone broke something!';
      case 'warning': return 'Caution! This is a warning!';
      default:        return 'Unknown log type :/';
    }
  }

  async log(type) {
    const entry = {
      timestamp: new Date().toISOString(),
      type,
      message: Logger.getMessage(type)
    };
    return entry;
  }

  static parseLogLine(line) {
    try {
      return JSON.parse(line);
    } catch {
      return null;
    }
  }
}

module.exports = Logger;