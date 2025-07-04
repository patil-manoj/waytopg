import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  ],
});

// Add custom formatter for better readability in Render logs
const formatMessage = winston.format((info) => {
  const { timestamp, level, message, ...rest } = info;
  return {
    ...info,
    message: `[${timestamp}] ${level.toUpperCase()}: ${message} ${Object.keys(rest).length ? JSON.stringify(rest) : ''}`
  };
})();

logger.format = winston.format.combine(
  winston.format.timestamp(),
  formatMessage,
  winston.format.printf(info => info.message)
);

export default logger;
