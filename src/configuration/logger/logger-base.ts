import { ErrorBase } from '../..';
import { LogData, LoggerPort, LogLevel } from './logger.port';
import { createLoggerSetup } from './setup/create-logger.setup';

interface ErrorInput {
  message: string;
  error?: Error | ErrorBase;
  logData?: LogData;
}

/**
 * LoggerBase is a base logger setup with a useful logger based on winston.
 */
abstract class LoggerBase implements LoggerPort {
  private instance;

  constructor() {
    this.instance = createLoggerSetup();
  }

  /**
   * Log a ErrorBase based on the error.logLevel
   *
   * @param message: custom message
   * @param logData: any value/field to be logged
   */
  exception(error: ErrorBase): void {
    switch (error.logLevel) {
      case LogLevel.ERROR:
        this.error({ message: error.message, error, logData: error.logData });
        break;

      case LogLevel.INFO:
        this.info(error.message, error.logData);
        break;

      default:
        throw new Error(`Log level ${error.logLevel} not implemented.`);
    }
  }

  /**
   * Log a message and log data as info
   *
   * @param message: custom message
   * @param logData: any value/field to be logged
   */
  info(message: string, logData?: LogData): void {
    const log = this.formatDataToBeLogged({ message, logData });

    this.instance.info(JSON.stringify(log));
  }

  /**
   * Log a message and log data as error
   *
   * @param message: custom message
   * @param error: error to be logged
   * @param logData: any value/field to be logged
   */
  error(input: ErrorInput): void {
    this.instance.error(JSON.stringify(this.formatDataToBeLogged(input)));
  }

  /**
   * Function to format the inputs to be logged.
   *
   * @returns {
   *   "message":"fail here 2",
   *   "logData":{
   *      ...{input.logData},
   *      "originalError": {
   *        "message":"original error message",
   *        "stack":"Error: original error message\n  at Timeout._onTimeout (...service/src/server.ts:32:14)..."
   *      }
   *  }
   * }
   */
  private formatDataToBeLogged(input: ErrorInput) {
    const errorData = {
      ...(input.error && {
        originalError: {
          message: input.error.message,
          stack: input.error.stack || 'undefined'
        }
      })
    };

    const logData = {
      ...(input.logData && input.logData),
      ...errorData
    };

    return {
      message: input.message,
      logData
    };
  }
}

export { LoggerBase };
