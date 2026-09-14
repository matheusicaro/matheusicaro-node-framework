import { alignArgs, ErrorBase, ErrorCode, ErrorTrace, ErrorTraceImplement } from '../../src/errors/error-base';
import { LoggerPort, LogLevel } from '../../src/configuration/logger/logger.port';

class TestError extends ErrorBase {
  constructor(message: string, trace?: ErrorTraceImplement) {
    super(ErrorCode.INVALID_STATE, TestError.name, message, trace);
  }
}

describe('ErrorBase', () => {
  describe('constructor', () => {
    test('should set the default fields from the arguments correctly', () => {
      const error = new TestError('error message');

      expect(error.message).toEqual('error message');
      expect(error.name).toEqual('TestError');
      expect(error.code).toEqual(ErrorCode.INVALID_STATE);
      expect(error.isErrorBase).toEqual(true);
      expect(error.userMessage).toBeUndefined();
      expect(error.logLevel).toBeUndefined();
      expect(error.logData).toBeUndefined();
      expect(error.originalErrorMessage).toBeUndefined();
    });

    test('should set the userMessage from the trace when informed', () => {
      const error = new TestError('error message', { userMessage: 'user message' });

      expect(error.userMessage).toEqual('user message');
    });

    describe('when trace is present in the args', () => {
      test('should set the original error fields correctly', () => {
        const originalError = new Error('original error message');

        const error = new TestError('error message', { originalError });

        expect(error.stack).toEqual(originalError.stack);
        expect(error.originalErrorMessage).toEqual('original error message');
      });

      describe('when trace.logs is present in the args', () => {
        test('should set the log fields correctly', () => {
          const logInstance: LoggerPort = {
            info: jest.fn(),
            error: jest.fn(),
            exception: jest.fn()
          };

          const error = new TestError('error message', {
            logs: {
              level: LogLevel.ERROR,
              data: { foo: 'bar' },
              instance: logInstance
            }
          });

          expect(error.logLevel).toEqual(LogLevel.ERROR);
          expect(error.logData).toEqual({ foo: 'bar' });
        });

        test('should call log instance exception correctly when trace log is present in the args', () => {
          const logInstance: LoggerPort = {
            info: jest.fn(),
            error: jest.fn(),
            exception: jest.fn()
          };

          const error = new TestError('error message', {
            logs: {
              level: LogLevel.INFO,
              instance: logInstance
            }
          });

          expect(logInstance.exception).toHaveBeenCalledTimes(1);
          expect(logInstance.exception).toHaveBeenCalledWith(error);
        });

        test('should construct successfully without a logs field and leave logLevel/logData unset', () => {
          const error = new TestError('error message');

          expect(error.logLevel).toBeUndefined();
          expect(error.logData).toBeUndefined();
        });
      });
    });
  });

  describe('toString', () => {
    test('should print the error instance correctly', () => {
      const error = new TestError('error message');

      expect(JSON.parse(error.toString())).toEqual({
        code: ErrorCode.INVALID_STATE,
        name: 'TestError',
        isErrorBase: true
      });
    });
  });

  describe('alignArgs', () => {
    test('should align the args correctly when a message string is passed', () => {
      const trace: ErrorTrace = { userMessage: 'user message' };

      const result = alignArgs('error message', trace);

      expect(result).toEqual({ message: 'error message', trace });
    });

    test('should align the args correctly when a trace object is passed as the first argument', () => {
      const trace: ErrorTrace = { userMessage: 'user message' };

      const result = alignArgs(trace);

      expect(result).toEqual({ message: undefined, trace });
    });

    test('should return an undefined trace when neither a trace nor a second argument is passed', () => {
      const result = alignArgs('error message');

      expect(result).toEqual({ message: 'error message', trace: undefined });
    });
  });
});
