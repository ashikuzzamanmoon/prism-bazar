import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';

const nodeEnv = (process.env.NODE_ENV || 'development').toLowerCase();
const isProd = nodeEnv === 'production';
const logDir = process.env.LOG_DIR || 'logs';
const logLevel = process.env.LOG_LEVEL || (isProd ? 'info' : 'debug');
const localTimezone =
    process.env.LOG_TIMEZONE || Intl.DateTimeFormat().resolvedOptions().timeZone;
const consoleLevel = isProd
    ? logLevel
    : process.env.DEV_CONSOLE_LOG_LEVEL || 'debug';

// JSON format for production - parseable, compatible with log aggregators (Datadog, Loki, CloudWatch)
const jsonFormat = winston.format.combine(
    winston.format.errors({ stack: true }),
    winston.format.timestamp(),
    winston.format.json(),
);

// Human-readable format for local development
const devFormat = winston.format.combine(
    winston.format.errors({ stack: true }),
    winston.format.timestamp({
        format: () =>
            new Date().toLocaleString('en-US', {
                timeZone: localTimezone,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: 'numeric',
                minute: '2-digit',
                second: '2-digit',
                hour12: true,
            }),
    }),
    winston.format.ms(),
    nestWinstonModuleUtilities.format.nestLike('Nest', {
        colors: true,
        prettyPrint: true,
    }),
);

const fileFormat = jsonFormat;
const consoleFormat = isProd ? jsonFormat : devFormat;

export const winstonConfig: winston.LoggerOptions = {
    level: logLevel,
    format: jsonFormat,
    transports: [
        new winston.transports.Console({
            level: consoleLevel,
            format: consoleFormat,
        }),

        // All logs at or above logLevel (info in prod, debug in dev)
        new winston.transports.DailyRotateFile({
            level: logLevel,
            filename: 'combined-%DATE%.log',
            dirname: logDir,
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '50m',
            maxFiles: '14d',
            format: fileFormat,
        }),

        // Warnings only — useful for alerting on degraded states
        new winston.transports.DailyRotateFile({
            level: 'warn',
            filename: 'warn-%DATE%.log',
            dirname: logDir,
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '30d',
            format: fileFormat,
        }),

        // Errors only — highest retention, dedicated for incident review
        new winston.transports.DailyRotateFile({
            level: 'error',
            filename: 'error-%DATE%.log',
            dirname: logDir,
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '90d',
            format: fileFormat,
        }),
    ],
    // Prevent winston from crashing the process on unhandled logger errors
    exitOnError: false,
};

export const logger = winston.createLogger(winstonConfig);
