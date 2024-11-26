import { LogData, LoggerPort, LogLevel } from './logger.port';
import { createLoggerSetup } from './setup/create-logger.setup';

interface ErrorInput {
  message: string;
  logData?: LogData;
}

class LoggerAdapter implements LoggerPort {
  private instance;

  constructor() {
    this.instance = createLoggerSetup();
  }

  public info(message: string, logData?: LogData): void {
    const log = this.formatDataToBeLogged({ message, logData });

    this.instance.info(log);
  }

  public error(input: ErrorInput): void {
    this.instance.error(this.formatDataToBeLogged(input));
  }

  private formatDataToBeLogged(input: ErrorInput) {
    const logData = {
      ...(input.logData && input.logData)
    };

    return JSON.stringify({
      message: input.message,
      logData
    });
  }
}

export { LoggerAdapter };
