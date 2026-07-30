import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    globals: true,
    // ÄNDERUNG [30.07.2026]: AP-2 — `tests/layout/**` enthält Playwright-Verträge,
    // die einen echten Browser und den Preview-Server brauchen. Ohne diesen
    // Ausschluss würde Vitest sie wegen des `.spec.ts`-Suffixes einsammeln und in
    // jsdom ausführen, wo `@playwright/test` nicht funktioniert.
    // Lauf über `npm run test:layout`.
    exclude: ['**/node_modules/**', '**/dist/**', 'tests/layout/**'],
  },
})
