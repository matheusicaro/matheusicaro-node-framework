import { container } from 'tsyringe';

import { alignArgs, ErrorBase, ErrorCode, ErrorTrace } from './error-base';
import { LoggerPort, LogLevel } from '../logger';
import { DependencyInjectionTokens } from '../dependency-registries';

export type NotFoundErrorTrace = ErrorTrace;
/**
 * When the system is in an invalid state and cannot perform an action. This error will surface to the user
 * as a unknown error as there is nothing the user can do at this point to fix the request.
 *
 * If the user needs to know the details of what went wrong consider implement a InvalidRequestError
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
