import { LogData, LoggerPort, LogLevel } from '../';

export interface ErrorTrace {
  logData: LogData & {
    error?: Error;
  };
}

export interface ErrorTraceImplement {
  originalError?: Error;
  logs?: {
    data?: LogData;
    level: LogLevel;
    instance: LoggerPort;
  };
}

export enum ErrorCode {
  INVALID_ARGUMENT = 'INVALID_ARGUMENT',
  INVALID_REQUEST = 'INVALID_REQUEST',
  INVALID_STATE = 'INVALID_STATE',
  NOT_FOUND = 'NOT_FOUND'
}

/**
 * ErrorBase to implement custom errors with logging the trace args when it is informed.
 * Implementations:
 *   - InvalidArgumentError
 *   - InvalidRequestError
 *   - InvalidStateError
 *   - NotFoundError
 *
 * * @matheusicaro
 */
abstract class ErrorBase extends Error {
  readonly code: ErrorCode;
  readonly isErrorBase: boolean;
  readonly logLevel?: LogLevel;
  readonly logData?: LogData;
  readonly originalErrorMessage?: string;

  constructor(code: ErrorCode, name: string, message: string, trace?: ErrorTraceImplement) {
    super(message);

    this.code = code;
    this.name = name;
    this.isErrorBase = true;

    if (trace?.originalError) {
      this.stack = trace.originalError.stack;
      this.originalErrorMessage = trace.originalError.message;
    }

    if (trace?.logs) {
      this.logLevel = trace.logs.level;
      this.logData = trace.logs.data;

      trace.logs.instance.exception(this);
    }
  }

  public toString(): string {
    return JSON.stringify(this);
  }
}

interface Args {
  message?: string;
  trace?: ErrorTrace;
}

const alignArgs = (messageOrTrace: string | ErrorTrace, _trace?: ErrorTrace): Args => {
  const trace = typeof messageOrTrace === 'object' ? messageOrTrace : _trace;
  const message = typeof messageOrTrace === 'string' ? messageOrTrace : undefined;

  return { message, trace };
};

export { ErrorBase, alignArgs };
