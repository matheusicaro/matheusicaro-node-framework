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
 *    - new NotFoundError(message) => do not error & message
 *    - new NotFoundError(message, trace) => do log message and trace fields, trace.registry is
 *      required whenever trace.logData is informed
 *
 * @matheusicaro
 */
class NotFoundError extends ErrorBase {
  constructor(message: string);
  constructor(trace: NotFoundErrorTrace);
  constructor(message: string, trace?: NotFoundErrorTrace);
  constructor(messageOrTrace: string | NotFoundErrorTrace, _trace?: NotFoundErrorTrace) {
    const { message = 'Not found', trace } = alignArgs(messageOrTrace, _trace);
    const { registry, ...traceWithoutRegistry } = trace ?? {};

    if (traceWithoutRegistry.logData && !registry) {
      throw new Error('NotFoundError: trace.registry is required when trace.logData is informed');
    }

    super(ErrorCode.NOT_FOUND, NotFoundError.name, message, {
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

export { NotFoundError };
