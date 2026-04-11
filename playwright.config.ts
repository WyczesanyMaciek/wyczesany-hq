import { defineConfig } from '@playwright/test'
export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  use: { baseURL: 'http://localhost:3002' },
  webServer: {
    command: 'npm run dev',
    port: 3002,
    reuseExistingServer: true,
    timeout: 60000,
  },
})
