import { container } from 'tsyringe';

import { ErrorCode } from '../../src/errors/error-base';
import { InvalidRequestError } from '../../src/errors/invalid-request.error';
import { DependencyRegistry } from '../../src';

describe('InvalidRequestError', () => {
  beforeEach(() => {
    container.reset();
  });

  describe('constructor', () => {
    test('should set the default fields correctly when only message is passed', () => {
      const error = new InvalidRequestError('error');

      expect(error.message).toEqual('error');
      expect(error.code).toEqual(ErrorCode.INVALID_REQUEST);
      expect(error.isErrorBase).toEqual(true);
      expect(error.logData).toBeUndefined();
      expect(error.logLevel).toBeUndefined();
      expect(error.originalErrorMessage).toBeUndefined();
      expect(error.userMessage).toBeUndefined();
      expect(error.stack).not.toBeUndefined();
    });

    test('should set the default fields correctly when message and user message are passed', () => {
      const error = new InvalidRequestError('error', {
        userMessage: 'user message'
      });

      expect(error.message).toEqual('error');
      expect(error.userMessage).toEqual('user message');
      expect(error.code).toEqual(ErrorCode.INVALID_REQUEST);
      expect(error.isErrorBase).toEqual(true);
      expect(error.logData).toBeUndefined();
      expect(error.logLevel).toBeUndefined();
      expect(error.originalErrorMessage).toBeUndefined();
      expect(error.stack).not.toBeUndefined();
    });

    test('should throw when message is not informed', () => {
      expect(() => new InvalidRequestError(undefined as unknown as string)).toThrow(
        'The message error for InvalidRequestError cannot be undefined'
      );
    });

    test('should log via the registry when logData and registry are both passed', () => {
      const registry = new DependencyRegistry([]);

      const error = new InvalidRequestError('error', { logData: { foo: 'bar' }, registry });

      expect(error.logData).toEqual({ foo: 'bar' });
      expect(error.logLevel).toEqual('ERROR');
    });

    test('should throw when logData is passed without a registry', () => {
      expect(() => new InvalidRequestError('error', { logData: { foo: 'bar' } })).toThrow(
        'InvalidRequestError: trace.registry is required when trace.logData is informed'
      );
    });
  });
});
