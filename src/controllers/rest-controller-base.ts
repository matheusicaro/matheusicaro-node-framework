import { container } from 'tsyringe';
import { NextFunction, Request, Response } from 'express';

import { DependencyInjectionTokens, LoggerPort, ErrorBase } from '../';

/**
 * Interfaces to defined a the args of the ControllerBase.
 * If express is changed to another lib, we might just need to replace the express types here.
 */
export interface ServerRequest extends Request {}
export interface ServerResponse extends Response {}
export interface ServerResponseData<T> extends Response<T> {}
export interface ServerNextFunction extends NextFunction {}

/**
 * RestControllerBase is a base for controller implementations for HTTP REST requests
 *  - MyController extends RestControllerBase
 *
 * How to use: https://github.com/matheusicaro/mi-node-framework#rest-controller-base
 *
 */
abstract class RestControllerBase {
  protected logger: LoggerPort;
  protected badRequestStatusCode;
  protected badRequestPayload;

  constructor(
    customBadRequestStatusCode = 502,
    customBadRequestPayload = { message: 'error on processing the request' }
  ) {
    this.logger = container.resolve(DependencyInjectionTokens.Logger);

    this.badRequestStatusCode = customBadRequestStatusCode;
    this.badRequestPayload = customBadRequestPayload;
  }

  /**
   * This function will handle with errors in a default behavior of:
   *  - Response to the client with 502 http status code as a default if a custom status is not informed
   *  - Response with a default payload if a custom payload is not informed
   *  - Log the error details
   *
   * @param error
   * @param responseData: metadata to be added in the response payload
   * @param response: ServerResponse
   *
   * @returns
   */
  protected responseFailRequestWithErrorHandle<T>(input: {
    error: unknown;
    responseData?: Record<string, unknown>;
    response: ServerResponse;
  }): ServerResponse {
    this.logError(input.error);

    return input.response
      .status(this.badRequestStatusCode)
      .json({ ...this.badRequestPayload, ...(input.responseData && { ...input.responseData }) });
  }

  private logError(error: unknown): void {
    if (error instanceof ErrorBase && error.isErrorBase) {
      // ErrorBase already handle with errors and logger it when ErrorBase is thrown
      return;
    }

    if (error instanceof Error) {
      this.logger.error({
        message: `Error in ${RestControllerBase.name} - ${error.message}`,
        error
      });

      return;
    }

    this.logger.error({
      message: `Unknown error in ${RestControllerBase.name}`
    });
  }
}

export { RestControllerBase };
