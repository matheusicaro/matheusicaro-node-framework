import { alignArgs, ErrorBase, ErrorCode, ErrorTrace } from './error-base';
import { LoggerPort, LogLevel } from '../';
import { DependencyInjectionTokens } from '../';

export type InvalidRequestErrorTrace = ErrorTrace & {
  message?: string;
};
/**
 * Error when an invalid request is not able to be processed.
 *
 * This error will:
 *  - surface to the user with known message for the invalid request.
 *  - Log automatically the error & "trace" field when it is present in the args
 *    - new InvalidRequestError(message) => do not error & message
 *    - new InvalidRequestError(message, trace) => do log message and trace fields, trace.registry
 *      is required whenever trace.logData is informed
 *
 * @matheusicaro
 */
class InvalidRequestError extends ErrorBase {
  constructor(message: string);
  constructor(trace: InvalidRequestErrorTrace);
  constructor(message: string, trace?: InvalidRequestErrorTrace);
  constructor(messageOrTrace: string | InvalidRequestErrorTrace, _trace?: InvalidRequestErrorTrace) {
    const { message, trace } = alignArgs(messageOrTrace, _trace);

    if (!message) {
      throw new Error('The message error for InvalidRequestError cannot be undefined');
    }

    const { registry, ...traceWithoutRegistry } = trace ?? {};

    if (traceWithoutRegistry.logData && !registry) {
      throw new Error('InvalidRequestError: trace.registry is required when trace.logData is informed');
    }

    super(ErrorCode.INVALID_REQUEST, InvalidRequestError.name, message, {
      userMessage: traceWithoutRegistry.userMessage,
      originalError: traceWithoutRegistry.logData?.error,
      ...(traceWithoutRegistry.logData &&
        registry && {
          logs: {
            data: traceWithoutRegistry.logData,
            level: LogLevel.ERROR,
            instance: registry.resolve<LoggerPort>(DependencyInjectionTokens.Logger)
          }
        })
    });
  }
}

export { InvalidRequestError };
