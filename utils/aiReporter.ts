import type { FullResult, Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import * as fs from 'fs';
import * as path from 'path';
import { AiFailureAnalyzer } from './aiFailureAnalysis';
import type { TestFailureContext } from '../types';

/**
 * Collects context for every failed test and runs it through AiFailureAnalyzer.
 * Writes a single JSON summary to reports/ai-analysis.json. Registered as a
 * secondary reporter in playwright.config.ts — it never affects pass/fail status.
 */
export default class AiReporter implements Reporter {
  private readonly analyzer = new AiFailureAnalyzer();
  private readonly failures: Array<{ context: TestFailureContext; analysisPromise: Promise<unknown> }> = [];

  onTestEnd(test: TestCase, result: TestResult): void {
    if (result.status !== 'failed' && result.status !== 'timedOut') {
      return;
    }

    const screenshot = result.attachments.find((a) => a.name === 'screenshot');
    const trace = result.attachments.find((a) => a.name === 'trace');

    const context: TestFailureContext = {
      testName: test.titlePath().slice(1).join(' > '),
      filePath: test.location.file,
      errorMessage: result.errors.map((e) => e.message ?? '').join('\n') || 'Unknown error',
      stackTrace: result.errors.map((e) => e.stack ?? '').join('\n'),
      screenshotPath: screenshot?.path,
      tracePath: trace?.path,
      tags: test.tags,
      retryCount: result.retry,
    };

    this.failures.push({ context, analysisPromise: this.analyzer.analyze(context) });
  }

  async onEnd(_result: FullResult): Promise<void> {
    if (this.failures.length === 0) {
      return;
    }

    const outDir = path.resolve('reports');
    fs.mkdirSync(outDir, { recursive: true });

    const entries = await Promise.all(
      this.failures.map(async ({ context, analysisPromise }) => ({
        test: context.testName,
        file: context.filePath,
        error: context.errorMessage,
        analysis: await analysisPromise,
      })),
    );

    const summary = {
      generatedAt: new Date().toISOString(),
      aiEnabled: this.analyzer.isEnabled(),
      failureCount: entries.length,
      failures: entries,
    };

    fs.writeFileSync(path.join(outDir, 'ai-analysis.json'), JSON.stringify(summary, null, 2));
    console.log(
      `\n[ai-analysis] Wrote failure analysis for ${entries.length} test(s) to reports/ai-analysis.json` +
        (this.analyzer.isEnabled() ? '' : ' (heuristic mode — set AI_API_KEY for AI-generated analysis)'),
    );
  }
}
