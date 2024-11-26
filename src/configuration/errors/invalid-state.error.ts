import { container } from 'tsyringe';

import { alignArgs, ErrorBase, ErrorCode, ErrorTrace } from './error-base';
import { LoggerPort, LogLevel } from '../logger';
import { DependencyInjectionTokens } from '../dependency-registries';

export type InvalidStateErrorTrace = ErrorTrace;
/**
 * When the system is in an invalid state and cannot perform an action. This error will surface to the user
 * as a unknown error as there is nothing the user can do at this point to fix the request.
 *
 * If the user needs to know the details of what went wrong consider implement a InvalidRequestError
 */
class InvalidStateError extends ErrorBase {
  constructor(message: string);
  constructor(trace: InvalidStateErrorTrace);
  constructor(message: string, trace?: InvalidStateErrorTrace);
  constructor(messageOrTrace: string | InvalidStateErrorTrace, _trace?: InvalidStateErrorTrace) {
    const { message = 'Something went wrong', trace } = alignArgs(messageOrTrace, _trace);

    super(ErrorCode.INVALID_STATE, InvalidStateError.name, message, {
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

export { InvalidStateError };
