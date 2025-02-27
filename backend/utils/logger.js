const winston = require('winston');

// Create a Winston logger instance
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug', // Set log level based on environment
  format: winston.format.combine(
    winston.format.timestamp(), // Add timestamp to logs
    winston.format.json() // Format logs as JSON
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }), // Log errors to error.log
    new winston.transports.File({ filename: 'combined.log' }) // Log all levels to combined.log
  ]
});

// In non-production environments, log to the console as well
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple() // Simple text format for console logs
  }));
}

module.exports = logger; // Export logger for use in other files
