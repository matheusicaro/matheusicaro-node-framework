import { alignArgs, ErrorBase, ErrorCode, ErrorTrace } from './error-base';
import { LoggerPort, LogLevel } from '../';
import { DependencyInjectionTokens } from '../';

export type InvalidStateErrorTrace = ErrorTrace;
/**
 * Error when an invalid state was found and not able to be handle with.
 *
 * This error will:
 *  - surface to the user as a default error message (if not informed) once there is nothing the user can do at this point to fix the request
 *  - Log automatically the error & "trace" field when it is present in the args
 *    - new InvalidStateError(message) => do not error & message
 *    - new InvalidStateError(message, trace) => do log message and trace fields, trace.registry is
 *      required whenever trace.logData is informed
 *
 * Do not use this error when client is responsible for a invalid request, use InvalidRequestError instead.
 *
 * @matheusicaro
 */
class InvalidStateError extends ErrorBase {
  constructor(message: string);
  constructor(trace: InvalidStateErrorTrace);
  constructor(message: string, trace?: InvalidStateErrorTrace);
  constructor(messageOrTrace: string | InvalidStateErrorTrace, _trace?: InvalidStateErrorTrace) {
    const { message = 'Invalid state found during service request', trace } = alignArgs(messageOrTrace, _trace);
    const { registry, ...traceWithoutRegistry } = trace ?? {};

    if (traceWithoutRegistry.logData && !registry) {
      throw new Error('InvalidStateError: trace.registry is required when trace.logData is informed');
    }

    super(ErrorCode.INVALID_STATE, InvalidStateError.name, message, {
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

export { InvalidStateError };
