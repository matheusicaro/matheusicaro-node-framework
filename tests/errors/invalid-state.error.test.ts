import { ErrorCode, InvalidStateError } from '../../src/errors';

/**
 * TODO: implement tests for InvalidStateError
 *     - issue: https://github.com/matheusicaro/mi-node-framework/issues/3
 */
describe('InvalidStateError', () => {
  describe('constructor', () => {
    test('should set the default fields correctly when only message is passed', () => {
      const error = new InvalidStateError('error');

      expect(error.message).toEqual('error');
      expect(error.code).toEqual(ErrorCode.INVALID_STATE);
      expect(error.isErrorBase).toEqual(true);
      expect(error.logData).toBeUndefined();
      expect(error.logLevel).toBeUndefined();
      expect(error.originalErrorMessage).toBeUndefined();
      expect(error.userMessage).toBeUndefined();
      expect(error.stack).not.toBeUndefined();
    });

    test('should set the default fields correctly when message and user message are passed', () => {
      const error = new InvalidStateError('error', {
        userMessage: 'user message'
      });

      expect(error.message).toEqual('error');
      expect(error.userMessage).toEqual('user message');
      expect(error.code).toEqual(ErrorCode.INVALID_STATE);
      expect(error.isErrorBase).toEqual(true);
      expect(error.logData).toBeUndefined();
      expect(error.logLevel).toBeUndefined();
      expect(error.originalErrorMessage).toBeUndefined();
      expect(error.stack).not.toBeUndefined();
    });

    test('should call supper with the correct args', () => {});
  });
});
