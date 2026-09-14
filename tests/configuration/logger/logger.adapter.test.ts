import { Logger } from 'winston';

import { createLoggerSetup } from '../../../src/configuration/logger/setup/create-logger.setup';
import { LoggerAdapter } from '../../../src/configuration/logger/logger.adapter';
import { ErrorBase, ErrorCode, ErrorTraceImplement, LogLevel } from '../../../src';

jest.mock('../../../src/configuration/logger/setup/create-logger.setup');

class TestError extends ErrorBase {
  constructor(message: string, trace?: ErrorTraceImplement) {
    super(ErrorCode.INVALID_STATE, TestError.name, message, trace);
  }
}

describe('LoggerAdapter', () => {
  const mockInstance = {
    info: jest.fn(),
    error: jest.fn()
  } as unknown as Logger;

  beforeEach(() => {
    jest.clearAllMocks();
    (createLoggerSetup as jest.Mock).mockReturnValue(mockInstance);
  });

  describe('constructor', () => {
    test('should create instance correctly', () => {
      new LoggerAdapter();

      expect(createLoggerSetup).toHaveBeenCalledWith();
    });
  });

  describe('info', () => {
    test('should log info with the message correctly', () => {
      const logger = new LoggerAdapter();

      logger.info('info message');

      expect(mockInstance.info).toHaveBeenCalledWith(JSON.stringify({ message: 'info message', logData: {} }));
    });

    test('should log info with the metadata from logData correctly', () => {
      const logger = new LoggerAdapter();

      logger.info('info message', { foo: 'bar' });

      expect(mockInstance.info).toHaveBeenCalledWith(
        JSON.stringify({ message: 'info message', logData: { foo: 'bar' } })
      );
    });
  });

  describe('error', () => {
    test('should log error with the input message correctly', () => {
      const logger = new LoggerAdapter();

      logger.error({ message: 'error message' });

      expect(mockInstance.error).toHaveBeenCalledWith(JSON.stringify({ message: 'error message', logData: {} }));
    });

    test('should log error with the metadata from logData correctly', () => {
      const logger = new LoggerAdapter();

      logger.error({ message: 'error message', logData: { foo: 'bar' } });

      expect(mockInstance.error).toHaveBeenCalledWith(
        JSON.stringify({ message: 'error message', logData: { foo: 'bar' } })
      );
    });

    test('should log error with the original error message and stack correctly', () => {
      const logger = new LoggerAdapter();
      const originalError = new Error('original error message');

      logger.error({ message: 'error message', error: originalError });

      expect(mockInstance.error).toHaveBeenCalledWith(
        JSON.stringify({
          message: 'error message',
          logData: {
            originalError: {
              message: originalError.message,
              stack: originalError.stack
            }
          }
        })
      );
    });
  });

  describe('exception', () => {
    test('should log as error when the error logLevel is ERROR', () => {
      const logger = new LoggerAdapter();

      // ErrorBase calls logger.exception(this) as part of its own constructor
      const error = new TestError('error message', {
        logs: { level: LogLevel.ERROR, instance: logger }
      });

      expect(mockInstance.error).toHaveBeenCalledWith(
        JSON.stringify({
          message: error.message,
          logData: {
            originalError: {
              message: error.message,
              stack: error.stack
            }
          }
        })
      );
    });

    test('should log as info when the error logLevel is INFO', () => {
      const logger = new LoggerAdapter();

      const error = new TestError('error message', {
        logs: { level: LogLevel.INFO, instance: logger }
      });

      expect(mockInstance.info).toHaveBeenCalledWith(JSON.stringify({ message: error.message, logData: {} }));
    });

    test('should throw when the error logLevel is not implemented', () => {
      const logger = new LoggerAdapter();

      expect(
        () =>
          new TestError('error message', {
            logs: { level: LogLevel.WARN, instance: logger }
          })
      ).toThrow('Log level WARN not implemented.');
    });
  });
});
