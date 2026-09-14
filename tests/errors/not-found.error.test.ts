import { container } from 'tsyringe';

import { DependencyRegistry, ErrorCode, NotFoundError } from '../../src';

describe('NotFoundError', () => {
  beforeEach(() => {
    container.reset();
  });

  describe('constructor', () => {
    test('should set the default fields correctly when only message is passed', () => {
      const error = new NotFoundError('error');

      expect(error.message).toEqual('error');
      expect(error.code).toEqual(ErrorCode.NOT_FOUND);
      expect(error.isErrorBase).toEqual(true);
      expect(error.logData).toBeUndefined();
      expect(error.logLevel).toBeUndefined();
      expect(error.originalErrorMessage).toBeUndefined();
      expect(error.userMessage).toBeUndefined();
      expect(error.stack).not.toBeUndefined();
    });

    test('should set the default fields correctly when message and user message are passed', () => {
      const error = new NotFoundError('error', {
        userMessage: 'user message'
      });

      expect(error.message).toEqual('error');
      expect(error.userMessage).toEqual('user message');
      expect(error.code).toEqual(ErrorCode.NOT_FOUND);
      expect(error.isErrorBase).toEqual(true);
      expect(error.logData).toBeUndefined();
      expect(error.logLevel).toBeUndefined();
      expect(error.originalErrorMessage).toBeUndefined();
      expect(error.stack).not.toBeUndefined();
    });

    test('should default the message when no message is passed', () => {
      const error = new NotFoundError({ userMessage: 'user message' });

      expect(error.message).toEqual('Not found');
    });

    test('should log via the registry when logData and registry are both passed', () => {
      const registry = new DependencyRegistry([]);

      const error = new NotFoundError('error', { logData: { foo: 'bar' }, registry });

      expect(error.logData).toEqual({ foo: 'bar' });
      expect(error.logLevel).toEqual('ERROR');
    });

    test('should throw when logData is passed without a registry', () => {
      expect(() => new NotFoundError('error', { logData: { foo: 'bar' } })).toThrow(
        'NotFoundError: trace.registry is required when trace.logData is informed'
      );
    });
  });
});
