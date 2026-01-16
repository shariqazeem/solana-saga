// Browser stub for pino logger
// This is needed because @jup-ag/jup-mobile-adapter uses pino which doesn't work in browsers

const noop = () => {};

const createLogger = () => ({
  trace: noop,
  debug: noop,
  info: noop,
  warn: noop,
  error: noop,
  fatal: noop,
  child: () => createLogger(),
  level: 'silent',
  silent: noop,
});

const pino = createLogger;
pino.default = pino;
pino.pino = pino;
pino.destination = () => ({ write: noop });
pino.transport = () => ({ write: noop });
pino.stdTimeFunctions = {
  epochTime: () => Date.now(),
  unixTime: () => Math.round(Date.now() / 1000),
  nullTime: () => '',
  isoTime: () => new Date().toISOString(),
};

module.exports = pino;
module.exports.default = pino;
