import { ErrorCode } from '../../src/errors/error-base';
import { InvalidRequestError } from '../../src/errors/invalid-request.error';

/**
 * TODO: implement tests for InvalidRequestError
 *     - issue: https://github.com/matheusicaro/mi-node-framework/issues/3
 */
describe('InvalidRequestError', () => {
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

    test('should call supper with the correct args', () => {});
  });
});
