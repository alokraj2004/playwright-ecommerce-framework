import { defineConfig, devices } from '@playwright/test';
import { env } from './config/env';

export default defineConfig({
  testDir: './tests',
  timeout: 45_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/html-report', open: 'never' }],
    ['json', { outputFile: 'reports/results.json' }],
    ['junit', { outputFile: 'reports/junit-results.xml' }],
    ['./utils/aiReporter.ts'],
  ],
  outputDir: 'test-results',
  use: {
    baseURL: env.baseUrl,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    extraHTTPHeaders: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  },

  projects: [
    {
      name: 'chromium',
      testIgnore: /.*\.api\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      testIgnore: /.*\.api\.spec\.ts/,
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      testIgnore: /.*\.api\.spec\.ts/,
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      testIgnore: /.*\.api\.spec\.ts/,
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      testIgnore: /.*\.api\.spec\.ts/,
      use: { ...devices['iPhone 12'] },
    },
    {
      name: 'api',
      testMatch: /.*\.api\.spec\.ts/,
      use: {
        baseURL: 'https://fakestoreapi.com',
        extraHTTPHeaders: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
        },
      },
    },
  ],
});
