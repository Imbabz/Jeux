import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'dev-dist', 'coverage', 'e2e/.results', 'e2e/screenshots'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.strict],
    files: ['**/*.{ts,tsx}'],
    languageOptions: { ecmaVersion: 2022, globals: globals.browser },
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
  {
    // Le moteur est pur : ni React, ni services, ni accès au DOM.
    files: ['src/engine/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: ['react', 'react-dom', '**/services/**', '**/ui/**'] },
      ],
      'no-restricted-globals': [
        'error',
        'window',
        'document',
        'localStorage',
        'speechSynthesis',
        'Date',
      ],
    },
  },
  {
    // L'UI affiche l'état et envoie des événements : pas d'import des règles internes.
    files: ['src/ui/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: ['**/engine/games/*/scoring*', '**/engine/games/*/draw*'] },
      ],
    },
  },
);
