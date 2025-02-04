const winston = require('winston');
const chalk = require('chalk');

// Define custom log levels and colors
const customLevels = {
  levels: {
    off: 0,
    error: 1,
    warn: 2,
    success: 3,
    info: 4,
    debug: 5,
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    success: 'green',
    info: 'white',
    debug: 'blue'
  }
};

// Create a custom format for console output
const consoleFormat = winston.format.printf(({ level, message, timestamp }) => {
  const color = customLevels.colors[level];
  //TODO:Troubleshoot chalk colors
  // return `${timestamp} ${chalk[color](level.toUpperCase())}: ${message}`;
  return `${timestamp} ${level.toUpperCase()}: ${message}`;
});

// Create a custom format for file output (without colors)
const fileFormat = winston.format.printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level.toUpperCase()}: ${message}`;
});

// Create the logger
const logger = winston.createLogger({
  levels: customLevels.levels,
  level: 'info',
  exitOnError: false, // do not exit on handled exceptions
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        consoleFormat
      )
    }),
    new winston.transports.File({
      filename: 'logs/application.log',
      format: winston.format.combine(
        fileFormat
      )
    })
  ]
});

// Add colors to Winston
winston.addColors(customLevels.colors);

module.exports = logger;
