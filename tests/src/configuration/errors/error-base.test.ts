/**
 * TODO: implement tests for LoggerAdapter
 *     - issue: https://github.com/matheusicaro/mi-node-framework/issues/3
 */
describe('ErrorBase', () => {
  describe('constructor', () => {
    test('should set the default fields from the arguments correctly', () => {});

    describe('when trace is present in the args', () => {
      test('should set the original error fields correctly', () => {});

      describe('when trace.logs is present in the args', () => {
        test('should set the log fields correctly', () => {});

        test('should call log instance exception correctly when trace log is present in the args', () => {});
      });
    });
  });

  describe('toString', () => {
    test('should print the error instance correctly', () => {});
  });

  describe('alignArgs', () => {
    test('should align the args correctly', () => {});
  });
});
