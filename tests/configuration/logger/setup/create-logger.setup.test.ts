jest.mock('fs');
jest.mock('winston', () => {
  const actual = jest.requireActual('winston');

  return {
    ...actual,
    createLogger: jest.fn()
  };
});

const loadCreateLoggerSetup = (): (() => unknown) => {
  let createLoggerSetup: () => unknown;

  jest.isolateModules(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    ({ createLoggerSetup } = require('../../../../src/configuration/logger/setup/create-logger.setup'));
  });

  return createLoggerSetup!;
};

describe('createLoggerSetup', () => {
  const DIRECTORY_NAME_TO_LOG = 'logs';

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test('should create the log directory when it does not exist yet', () => {
    const fs = jest.requireMock('fs') as { existsSync: jest.Mock; mkdirSync: jest.Mock };
    fs.existsSync.mockReturnValue(false);

    loadCreateLoggerSetup();

    expect(fs.existsSync).toHaveBeenCalledWith(DIRECTORY_NAME_TO_LOG);
    expect(fs.mkdirSync).toHaveBeenCalledWith(DIRECTORY_NAME_TO_LOG);
  });

  test('should not create the log directory when it already exists', () => {
    const fs = jest.requireMock('fs') as { existsSync: jest.Mock; mkdirSync: jest.Mock };
    fs.existsSync.mockReturnValue(true);

    loadCreateLoggerSetup();

    expect(fs.mkdirSync).not.toHaveBeenCalled();
  });

  test('should create the logger instance with the correct transports and exception handlers', () => {
    const fs = jest.requireMock('fs') as { existsSync: jest.Mock; mkdirSync: jest.Mock };
    fs.existsSync.mockReturnValue(true);

    const winston = jest.requireMock('winston') as { createLogger: jest.Mock };
    const fakeLoggerInstance = { info: jest.fn(), error: jest.fn() };
    winston.createLogger.mockReturnValue(fakeLoggerInstance);

    const createLoggerSetup = loadCreateLoggerSetup();
    const instance = createLoggerSetup();

    expect(winston.createLogger).toHaveBeenCalledTimes(1);

    const callArgs = winston.createLogger.mock.calls[0][0];
    expect(callArgs.level).toEqual('info');
    expect(callArgs.transports).toHaveLength(3);
    expect(callArgs.exceptionHandlers).toHaveLength(2);
    expect(instance).toBe(fakeLoggerInstance);
  });

  test('should format the log message with timestamp, level and message', () => {
    const fs = jest.requireMock('fs') as { existsSync: jest.Mock; mkdirSync: jest.Mock };
    fs.existsSync.mockReturnValue(true);

    const winston = jest.requireMock('winston') as { createLogger: jest.Mock };
    winston.createLogger.mockReturnValue({});

    const createLoggerSetup = loadCreateLoggerSetup();
    createLoggerSetup();

    const callArgs = winston.createLogger.mock.calls[0][0];
    const formatted = callArgs.format.transform({ level: 'error', message: 'something went wrong' });

    expect(formatted[Symbol.for('message')]).toMatch(
      /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} \[ ERROR \]==> something went wrong$/
    );
  });

  test('should build the log file paths under the logs directory', () => {
    const fs = jest.requireMock('fs') as { existsSync: jest.Mock; mkdirSync: jest.Mock };
    fs.existsSync.mockReturnValue(true);

    const winston = jest.requireMock('winston') as { createLogger: jest.Mock };
    winston.createLogger.mockReturnValue({});

    const createLoggerSetup = loadCreateLoggerSetup();
    createLoggerSetup();

    const callArgs = winston.createLogger.mock.calls[0][0];
    const combinedLogTransports = callArgs.transports.filter(
      (transport: { filename?: string }) => transport.filename === 'combined.log'
    );

    expect(combinedLogTransports).toHaveLength(2);
    combinedLogTransports.forEach((transport: { dirname: string }) => {
      expect(transport.dirname).toEqual(DIRECTORY_NAME_TO_LOG);
    });

    expect(callArgs.exceptionHandlers[0].filename).toEqual('exceptions.log');
    expect(callArgs.exceptionHandlers[0].dirname).toEqual(DIRECTORY_NAME_TO_LOG);
  });
});
