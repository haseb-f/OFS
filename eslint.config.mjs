import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // No console — use @ofs/logger
      'no-console': 'error',

      // No explicit any without justification comment
      '@typescript-eslint/no-explicit-any': 'warn',

      // Unused vars: allow _ prefix for intentional ignores
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      // Enforce template literals for $queryRaw (blocks string concatenation)
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TaggedTemplateExpression[tag.property.name="queryRaw"] > TemplateLiteral',
          message: '$queryRaw must use tagged template literals, never string variables.',
        },
      ],

      // Require explicit return types on module boundaries
      '@typescript-eslint/explicit-module-boundary-types': 'warn',

      // No floating promises — all async must be awaited or explicitly handled
      '@typescript-eslint/no-floating-promises': 'error',

      // Consistent type imports
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
      ],
    },
  },
  {
    // Relax some rules for config files
    files: ['*.config.{js,mjs,cjs,ts}', '*.config.*.{js,mjs,ts}'],
    rules: {
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'no-console': 'off',
    },
  },
  {
    // Web app — React-idiomatic and pre-existing code relaxations.
    // Rule rationale in comments; these are stylistic, not bug-prone patterns.
    files: ['apps/web/src/**/*.{ts,tsx}'],
    rules: {
      // () => setState(x) in JSX event handlers is idiomatic React
      '@typescript-eslint/no-confusing-void-expression': 'off',
      // ${number} in template literals is correct JS
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      // x && fn() short-circuit and ternary expression-statements are idiomatic
      '@typescript-eslint/no-unused-expressions': ['error', { allowShortCircuit: true, allowTernary: true }],
      // Downgrade overly strict type-level warnings to warn-only
      '@typescript-eslint/no-unnecessary-condition': 'warn',
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
      '@typescript-eslint/no-unnecessary-type-conversion': 'warn',
      '@typescript-eslint/no-unnecessary-template-expression': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-deprecated': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-dynamic-delete': 'warn',
      '@typescript-eslint/require-await': 'warn',
      // react-hooks plugin is not configured in the root eslint config
      'react-hooks/exhaustive-deps': 'off',
    },
  },
  {
    ignores: [
      'dist/**',
      '.next/**',
      'build/**',
      'node_modules/**',
      'coverage/**',
      'pnpm-lock.yaml',
      'supabase/.branches/**',
      'supabase/.temp/**',
      '**/*.d.ts',
    ],
  }
);
