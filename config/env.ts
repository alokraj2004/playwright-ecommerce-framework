import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env, falling back silently if it doesn't exist (CI supplies real env vars).
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

function getEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  baseUrl: getEnv('BASE_URL', 'https://www.saucedemo.com'),
  username: getEnv('SAUCE_USERNAME', 'standard_user'),
  password: getEnv('SAUCE_PASSWORD', 'secret_sauce'),
  lockedUsername: getEnv('LOCKED_USERNAME', 'locked_out_user'),
  problemUsername: getEnv('PROBLEM_USERNAME', 'problem_user'),
  apiBaseUrl: getEnv('API_BASE_URL', 'https://fakestoreapi.com'),
  ciMode: process.env.CI === 'true',
  aiApiKey: process.env.AI_API_KEY ?? '',
  aiModel: process.env.AI_MODEL ?? 'claude-sonnet-4-6',
};