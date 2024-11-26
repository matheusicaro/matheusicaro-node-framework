import { TransformableInfo } from 'logform';
import { join } from 'path';
import { createLogger, format, Logger, transports } from 'winston';
import { existsSync as isFileLogCreated, mkdirSync as buildFile } from 'fs';

const DIRECTORY_NAME_TO_LOG = 'logs';

if (!isFileLogCreated(DIRECTORY_NAME_TO_LOG)) {
  buildFile(DIRECTORY_NAME_TO_LOG);
}

const logFormat = (log: TransformableInfo) => `${log.timestamp} [ ${log.level.toUpperCase()} ]==> ${log.message}`;

const createLoggerSetup = (): Logger => {
  const combinedLogPath = join(DIRECTORY_NAME_TO_LOG, 'combined.log');
  const exceptionsLogPath = join(DIRECTORY_NAME_TO_LOG, 'exceptions.log');

  const instance = createLogger({
    level: 'info',

    format: format.combine(format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), format.printf(logFormat)),

    transports: [
      new transports.File({ filename: combinedLogPath }),
      new transports.File({ filename: combinedLogPath, level: 'error' }),
      new transports.Console()
    ],

    exceptionHandlers: [new transports.File({ filename: exceptionsLogPath }), new transports.Console()]
  });

  return instance;
};
export { createLoggerSetup };
