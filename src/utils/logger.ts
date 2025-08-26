enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

class Logger {
  private level: LogLevel = LogLevel.INFO

  setLevel(level: LogLevel) {
    this.level = level
  }

  private log(level: LogLevel, message: string, ...args: unknown[]) {
    if (level < this.level) return

    const timestamp = new Date().toISOString()
    const levelName = LogLevel[level]
    const prefix = `[${timestamp}] [${levelName}]`

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(prefix, message, ...args)
        break
      case LogLevel.INFO:
        console.info(prefix, message, ...args)
        break
      case LogLevel.WARN:
        console.warn(prefix, message, ...args)
        break
      case LogLevel.ERROR:
        console.error(prefix, message, ...args)
        break
    }
  }

  debug(message: string, ...args: unknown[]) {
    this.log(LogLevel.DEBUG, message, ...args)
  }

  info(message: string, ...args: unknown[]) {
    this.log(LogLevel.INFO, message, ...args)
  }

  warn(message: string, ...args: unknown[]) {
    this.log(LogLevel.WARN, message, ...args)
  }

  error(message: string, ...args: unknown[]) {
    this.log(LogLevel.ERROR, message, ...args)
  }
}

// Export singleton instance
export const logger = new Logger()
export { LogLevel }
