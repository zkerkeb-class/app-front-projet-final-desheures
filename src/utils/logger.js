import pino from 'pino';

const logger = pino({
  level: 'info',
  browser: {
    asObject: true,
    write: {
      info: (...args) => console.log(...args),
      error: (...args) => console.error(...args),
      warn: (...args) => console.warn(...args),
      debug: (...args) => console.debug(...args),
      trace: (...args) => console.trace(...args),
    },
  },
  ...(process.env.NODE_ENV === 'development'
    ? {
        formatters: {
          level: (label) => ({ level: label.toUpperCase() }),
          bindings: () => ({}),
          log: (object) => object,
        },
        timestamp: () => `,"time":"${new Date().toISOString()}"`,
      }
    : {}),
});

export default logger;
