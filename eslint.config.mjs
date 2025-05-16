import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tseslint from 'typescript-eslint';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default tseslint.config(
  js.configs.recommended,
  ...compat.extends('prettier'),
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      'import/extensions': 'off',
      'import/prefer-default-export': 'off',
      'no-duplicate-imports': 'error',
      'no-restricted-exports': 'off',
      'default-case': 2,
      'no-case-declarations': 2,
      'no-multi-assign': 2,
      'max-classes-per-file': ['warn', 4],
      'no-await-in-loop': 2,

      // Turned-off rules
      'class-methods-use-this': 'off',
    },
  },
  {
    ignores: [
      'test/**',
      '**/**.module.ts',
      '**/**.service.ts',
      '**/**.guard.ts',
      '**/**.command.ts',
      '**/**.entity.ts',
      '**/**.repository.ts',
      '**/**.controller.ts',
      '**/**.dto.ts',
      '**/**.interface.ts',
      '**/**.type.ts',
    ],
  },
);
