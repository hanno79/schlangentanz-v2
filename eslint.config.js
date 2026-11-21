import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // .claude/worktrees/ hält vollständige Kopien des Repos (Worktrees der Agenten).
  // tagebuch/ enthält keinen Quellcode: Belege der Prüfer (auch Skripte als .ts) und die
  // erzeugte Tagebuchseite.
  globalIgnores(['dist', '.claude/', 'tagebuch/']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
])
