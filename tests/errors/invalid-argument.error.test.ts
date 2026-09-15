import { container } from 'tsyringe';

import { DependencyRegistry, ErrorCode } from '../../src';
import { InvalidArgumentError } from '../../src/errors/invalid-argument.error';

describe('InvalidArgumentError', () => {
  beforeEach(() => {
    container.reset();
  });

  describe('constructor', () => {
    test('should set the default fields correctly when only message is passed', () => {
      const error = new InvalidArgumentError('error');

      expect(error.message).toEqual('error');
      expect(error.code).toEqual(ErrorCode.INVALID_ARGUMENT);
      expect(error.isErrorBase).toEqual(true);
      expect(error.logData).toBeUndefined();
      expect(error.logLevel).toBeUndefined();
      expect(error.originalErrorMessage).toBeUndefined();
      expect(error.userMessage).toBeUndefined();
      expect(error.stack).not.toBeUndefined();
    });

    test('should set the default fields correctly when message and user message are passed', () => {
      const error = new InvalidArgumentError('error', {
        userMessage: 'user message'
      });

      expect(error.message).toEqual('error');
      expect(error.userMessage).toEqual('user message');
      expect(error.code).toEqual(ErrorCode.INVALID_ARGUMENT);
      expect(error.isErrorBase).toEqual(true);
      expect(error.logData).toBeUndefined();
      expect(error.logLevel).toBeUndefined();
      expect(error.originalErrorMessage).toBeUndefined();
      expect(error.stack).not.toBeUndefined();
    });

    test('should create the error correctly only with message', () => {
      const error = new InvalidArgumentError('error');

      expect(error).toBeInstanceOf(InvalidArgumentError);
    });

    test('should throw error correctly with no errors in the constructor', () => {
      const error = new InvalidArgumentError('error');

      expect(() => {
        throw error;
      }).toThrow(InvalidArgumentError);
    });

    test('should throw when message is not informed', () => {
      expect(() => new InvalidArgumentError(undefined as unknown as string)).toThrow(
        'The message error for InvalidArgumentError cannot be undefined'
      );
    });

    test('should log via the registry when logData and registry are both passed', () => {
      const registry = new DependencyRegistry([]);

      const error = new InvalidArgumentError('error', { logData: { foo: 'bar' }, registry });

      expect(error.logData).toEqual({ foo: 'bar' });
      expect(error.logLevel).toEqual('ERROR');
    });

    test('should throw when logData is passed without a registry', () => {
      expect(() => new InvalidArgumentError('error', { logData: { foo: 'bar' } })).toThrow(
        'InvalidArgumentError: trace.registry is required when trace.logData is informed'
      );
    });
  });
});
