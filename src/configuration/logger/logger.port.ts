export type LogData = Record<string, unknown>;

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

export interface LoggerPort {
  info(message: string, logData?: LogData): void;
  error(input: { message?: string; error?: Error; logData?: LogData }): void;
}
