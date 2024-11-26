import globals from 'globals';
import pluginJs from '@eslint/js';
import pluginTs from 'typescript-eslint';
import pluginJest from 'eslint-plugin-jest';

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ['**/*.{js,mjs,cjs,ts}', 'test/**'], ...pluginJest.configs['flat/recommended'] },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    plugins: {
      ...pluginJest.configs['flat/recommended'].plugins
    }
  },
  pluginJs.configs.recommended,
  ...pluginTs.configs.recommended,
  {
    rules: {
      /**
       * Custom rules to restrict large packages to be imported
       * @matheusicaro
       */
      'no-restricted-imports': 'off',
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'lodash',
              message: "Use `import <pack> from 'lodash/<pack>'` instead.",
              allowTypeImports: true
            }
          ]
        }
      ],
      /**
       * Ignore lint when the argument not used has the slash as a prefix, exe:
       *  not used args:
       *   - (..., _arg) => no lint error
       *   - (..., arg) => lint error
       *
       * @matheusicaro
       */
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true
        }
      ],
      '@typescript-eslint/no-empty-object-type': [
        'error',
        {
          allowInterfaces: 'with-single-extends'
        }
      ]
    }
  }
];
