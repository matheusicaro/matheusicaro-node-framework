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
 *    - new InvalidArgumentError(message, trace) => do log message and trace fields, trace.registry
 *      is required whenever trace.logData is informed
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

    const { registry, ...traceWithoutRegistry } = trace ?? {};

    if (traceWithoutRegistry.logData && !registry) {
      throw new Error('InvalidArgumentError: trace.registry is required when trace.logData is informed');
    }

    super(ErrorCode.INVALID_ARGUMENT, InvalidArgumentError.name, message, {
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

export { InvalidArgumentError };
