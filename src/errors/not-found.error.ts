import { container } from 'tsyringe';

import { alignArgs, ErrorBase, ErrorCode, ErrorTrace } from './error-base';
import { LoggerPort, LogLevel } from '../';
import { DependencyInjectionTokens } from '../';

export type NotFoundErrorTrace = ErrorTrace;
/**
 * Error when a resource is not found.
 *
 * This error will:
 *  - surface to the user as a unknown error once there is nothing the user can do at this point to fix the request.
 *  - Log automatically the error & "trace" field when it is present in the args
 *    - new InvalidStateError(message) => do not error & message
 *    - new InvalidStateError(message, trace) => do log message and trace fields
 *
 * @matheusicaro
 */
class NotFoundError extends ErrorBase {
  constructor(message: string);
  constructor(trace: NotFoundErrorTrace);
  constructor(message: string, trace?: NotFoundErrorTrace);
  constructor(messageOrTrace: string | NotFoundErrorTrace, _trace?: NotFoundErrorTrace) {
    const { message = 'Not found', trace } = alignArgs(messageOrTrace, _trace);

    super(ErrorCode.NOT_FOUND, NotFoundError.name, message, {
      originalError: trace?.logData.error,
      ...(trace?.logData && {
        logs: {
          data: trace?.logData,
          level: LogLevel.ERROR,
          instance: container.resolve<LoggerPort>(DependencyInjectionTokens.Logger)
        }
      })
    });
  }
}

export { NotFoundError };
