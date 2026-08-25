import { env } from '../config/env';
import type { AiFailureAnalysis, FailureCategory, TestFailureContext } from '../types';

/**
 * Optional AI-powered failure analysis.
 *
 * The framework works fully without an API key. When AI_API_KEY is set,
 * failed tests are sent to the Anthropic API to produce a probable root
 * cause, a failure category, and a suggested fix. This runs from the
 * custom reporter (utils/aiReporter.ts) after the test run completes.
 */
export class AiFailureAnalyzer {
  private readonly enabled: boolean;

  constructor(apiKey: string = env.aiApiKey) {
    this.enabled = Boolean(apiKey);
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  /** Falls back to a deterministic heuristic analysis when no API key is configured. */
  async analyze(failure: TestFailureContext): Promise<AiFailureAnalysis> {
    if (!this.enabled) {
      return this.heuristicAnalysis(failure);
    }

    try {
      return await this.callAnthropicApi(failure);
    } catch (error) {
      // Never let AI analysis failures break the test report.
      console.warn(`[ai-analysis] Falling back to heuristic analysis: ${(error as Error).message}`);
      return this.heuristicAnalysis(failure);
    }
  }

  private async callAnthropicApi(failure: TestFailureContext): Promise<AiFailureAnalysis> {
    const prompt = `You are a Senior SDET reviewing a failed Playwright test. Respond ONLY with JSON, no prose, no markdown fences, matching this shape:
{"probableRootCause": string, "category": "product-bug" | "automation-bug" | "environment-issue" | "flaky-test" | "unknown", "suggestedFix": string, "confidence": "low" | "medium" | "high"}

Test name: ${failure.testName}
File: ${failure.filePath}
Retry count: ${failure.retryCount}
Error message: ${failure.errorMessage}
Stack trace (truncated): ${failure.stackTrace.slice(0, 1500)}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.aiApiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: env.aiModel,
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API responded with status ${response.status}`);
    }

    const data = (await response.json()) as { content: Array<{ type: string; text?: string }> };
    const text = data.content
      .map((block) => block.text ?? '')
      .join('')
      .replace(/```json|```/g, '')
      .trim();

    const parsed = JSON.parse(text) as AiFailureAnalysis;
    return parsed;
  }

  /** Simple rule-based fallback so the feature is useful with zero configuration. */
  private heuristicAnalysis(failure: TestFailureContext): AiFailureAnalysis {
    const message = failure.errorMessage.toLowerCase();
    let category: FailureCategory = 'unknown';
    let probableRootCause = 'Unable to determine root cause without AI analysis enabled.';
    let suggestedFix = 'Review the screenshot, trace, and stack trace manually.';

    if (message.includes('timeout') || message.includes('exceeded')) {
      category = 'automation-bug';
      probableRootCause = 'A locator or navigation did not resolve within the configured timeout.';
      suggestedFix =
        'Verify the selector still matches the DOM and add a proper wait condition instead of a fixed delay.';
    } else if (message.includes('net::') || message.includes('econnrefused') || message.includes('enotfound')) {
      category = 'environment-issue';
      probableRootCause = 'The application under test or a dependent service was unreachable.';
      suggestedFix = 'Check BASE_URL/API_BASE_URL, network connectivity, and whether the demo environment is up.';
    } else if (message.includes('tobevisible') || message.includes('tohavetext') || message.includes('expect(')) {
      category = 'product-bug';
      probableRootCause = 'The application returned or rendered a value different from the expected assertion.';
      suggestedFix =
        'Manually reproduce the flow; if confirmed, file a product bug with the screenshot/trace attached.';
    } else if (failure.retryCount > 0) {
      category = 'flaky-test';
      probableRootCause = 'The test failed intermittently and passed or failed differently across retries.';
      suggestedFix =
        'Investigate timing/race conditions; consider stabilizing with an explicit wait for a specific state.';
    }

    return {
      probableRootCause,
      category,
      suggestedFix,
      confidence: this.enabled ? 'medium' : 'low',
    };
  }
}
