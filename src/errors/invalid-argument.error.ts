import { container } from 'tsyringe';

import { alignArgs, ErrorBase, ErrorCode, ErrorTrace } from './error-base';
import { LoggerPort, LogLevel } from '../index';
import { DependencyInjectionTokens } from '../configuration/dependency-registries';

export type InvalidArgumentErrorTrace = ErrorTrace & {
  message?: string;
};
/**
 * Error when an invalid argument in informed.
 *
 * This error will:
 *  - surface to the user with known message for the invalid argument.
 *  - Log automatically the error & "trace" field when it is present in the args
 *    - new InvalidArgumentError(message) => do not error & message
 *    - new InvalidArgumentError(message, trace) => do log message and trace fields
 *
 * * @matheusicaro
 */
class InvalidArgumentError extends ErrorBase {
  constructor(message: string);
  constructor(trace: InvalidArgumentErrorTrace);
  constructor(message: string, trace?: InvalidArgumentErrorTrace);
  constructor(messageOrTrace: string | InvalidArgumentErrorTrace, _trace?: InvalidArgumentErrorTrace) {
    const { message, trace } = alignArgs(messageOrTrace, _trace);

    if (!message) {
      throw new Error('The message error for InvalidArgumentError cannot be undefined');
    }

    super(ErrorCode.INVALID_ARGUMENT, InvalidArgumentError.name, message, {
      userMessage: trace?.userMessage,
      originalError: trace?.logData?.error,
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

export { InvalidArgumentError };
