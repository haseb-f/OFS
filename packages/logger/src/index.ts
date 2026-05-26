import pino from 'pino';

export interface Logger {
  info(obj: Record<string, unknown> | string, msg?: string): void;
  warn(obj: Record<string, unknown> | string, msg?: string): void;
  error(obj: Record<string, unknown> | string, msg?: string): void;
  debug(obj: Record<string, unknown> | string, msg?: string): void;
  fatal(obj: Record<string, unknown> | string, msg?: string): void;
  child(bindings: Record<string, unknown>): Logger;
}

const PII_REDACT_PATHS = [
  'password',
  'token',
  'secret',
  'authorization',
  'creditCard',
  'cardNumber',
  'cvv',
  '*.password',
  '*.token',
  '*.secret',
  '*.authorization',
  'req.headers.authorization',
  'req.headers.cookie',
];

const isDev = process.env['NODE_ENV'] !== 'production';

const baseLogger = pino({
  level: process.env['LOG_LEVEL'] ?? (isDev ? 'debug' : 'info'),
  redact: {
    paths: PII_REDACT_PATHS,
    censor: '[REDACTED]',
  },
  ...(isDev && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:dd mmm yyyy HH:MM:ss',
        ignore: 'pid,hostname',
      },
    },
  }),
  formatters: {
    level(label) {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

/**
 * Factory for creating a named logger.
 * This is the only permitted way to create a logger — no direct pino() calls.
 */
export function createLogger(context: string): Logger {
  return baseLogger.child({ context });
}

export type { pino as PinoLogger };
