# Playwright E-Commerce QA Automation Framework

An AI-assisted, production-style test automation framework built with **Playwright + TypeScript**, demonstrating professional SDET practices: Page Object Model, API testing, cross-browser/responsive coverage, CI/CD, Dockerization, and optional AI-powered failure analysis.

Built as a portfolio project to demonstrate real-world automation architecture — not a collection of ad-hoc scripts.

---

## 1. Project Overview

This framework automates end-to-end and API testing for an e-commerce experience:

- **UI under test:** [SauceDemo](https://www.saucedemo.com) — a stable, purpose-built demo storefront (login, product catalog, cart, checkout).
- **API under test:** [FakeStoreAPI](https://fakestoreapi.com) — a public REST API modeling an e-commerce catalog (products, carts, users, auth), used to demonstrate full CRUD + auth API testing since SauceDemo itself exposes no public API.

The two apps are deliberately different services — a common, honest pattern in QA portfolios when the primary UI target doesn't expose a testable API of its own.

## 2. Features

- Page Object Model with zero duplicated selectors and no hard-coded waits
- Custom Playwright fixtures (`authenticatedPage`, page objects, `apiClient`)
- 185 tests: UI (auth, product search/filter/sort, cart, checkout, full regression journey) + API (products CRUD, carts, auth, negative cases)
- Cross-browser: Chromium, Firefox, WebKit
- Responsive: desktop + mobile (Pixel 7, iPhone 14) projects
- Tagged tests (`@smoke`, `@regression`, `@api`) for selective runs
- HTML, JSON, JUnit, and Allure reporting
- Screenshot + video + trace capture on failure
- Optional AI-powered failure analysis with heuristic fallback (heuristic mode fully tested with zero config; live Anthropic API mode implemented, pending end-to-end verification with a real key)
- GitHub Actions CI matrix (chromium / firefox / webkit / api) with artifact upload
- Docker + docker-compose for fully containerized runs
- TypeScript strict mode, ESLint (with `eslint-plugin-playwright`), Prettier

## 3. Tech Stack

Playwright · TypeScript · Node.js · Playwright Test Runner · Page Object Model · `APIRequestContext` · Allure · GitHub Actions · Docker · ESLint · Prettier · dotenv

## 4. Architecture

- **`pages/`** — Page Object classes. Own selectors and UI interaction logic only; no assertions.
- **`fixtures/`** — Custom `test`/`expect` extending Playwright's base, wiring page objects, an authenticated session, and the API client.
- **`tests/ui/`** — Business-behavior-focused specs, grouped by domain (`auth`, `products`, `cart`, `checkout`, `regression`).
- **`tests/api/`** — API specs, run under a dedicated `api` project (no browser).
- **`api/`** — Typed `ApiClient` wrapping `APIRequestContext`.
- **`test-data/`** — Reusable users, customer info, and product fixtures. Credentials are sourced from environment variables, never hard-coded.
- **`utils/`** — Cross-cutting helpers: money/tax math, AI failure analysis, custom reporter.
- **`config/`** — Environment loader (`.env` + `process.env`, with sane defaults).
- **`types/`** — Shared TypeScript interfaces for test data, API models, and AI analysis output.

## 5. Folder Structure

```
playwright-ecommerce-framework/
├── tests/
│   ├── ui/
│   │   ├── auth/login.spec.ts
│   │   ├── products/products.spec.ts
│   │   ├── cart/cart.spec.ts
│   │   ├── checkout/checkout.spec.ts
│   │   └── regression/e2e-journey.spec.ts
│   └── api/
│       ├── products.api.spec.ts
│       └── carts-and-auth.api.spec.ts
├── pages/
│   ├── BasePage.ts
│   ├── LoginPage.ts
│   ├── HomePage.ts
│   ├── ProductPage.ts
│   ├── CartPage.ts
│   └── CheckoutPage.ts
├── fixtures/fixtures.ts
├── test-data/
│   ├── users.ts
│   └── products.ts
├── utils/
│   ├── money.ts
│   ├── aiFailureAnalysis.ts
│   └── aiReporter.ts
├── api/ApiClient.ts
├── types/index.ts
├── config/env.ts
├── .github/workflows/playwright.yml
├── playwright.config.ts
├── package.json
├── tsconfig.json
├── eslint.config.js
├── .prettierrc
├── .env.example
├── .gitignore
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## 6. Installation

```bash
npm install
npx playwright install --with-deps
```

## 7. Environment Setup

Copy the example env file and adjust if needed (defaults already point at the live demo apps):

```bash
cp .env.example .env
```

```
BASE_URL=https://www.saucedemo.com
USERNAME=standard_user
PASSWORD=secret_sauce
LOCKED_USERNAME=locked_out_user
PROBLEM_USERNAME=problem_user
API_BASE_URL=https://fakestoreapi.com
AI_API_KEY=
AI_MODEL=claude-sonnet-4-6
```

`.env` is git-ignored — never commit real credentials. In CI, these are supplied via GitHub Actions repository **Variables** (non-secret) and **Secrets** (`APP_PASSWORD`, `AI_API_KEY`).

## 8. How to Run Tests

```bash
npm test                 # all projects
npm run test:headed      # headed mode
npm run test:debug       # Playwright inspector
npm run test:ui          # UI specs only
npm run test:api         # API specs only
npm run test:smoke       # @smoke-tagged tests
npm run test:regression  # @regression-tagged tests
```

## 9. Browser Configuration

| Project         | Target                           |
| --------------- | -------------------------------- |
| `chromium`      | Desktop Chrome                   |
| `firefox`       | Desktop Firefox                  |
| `webkit`        | Desktop Safari                   |
| `mobile-chrome` | Pixel 7 (responsive/mobile)      |
| `mobile-safari` | iPhone 14 (responsive/mobile)    |
| `api`           | No browser — `APIRequestContext` |

```bash
npm run test:chromium
npm run test:firefox
npm run test:webkit
npm run test:mobile
```

## 10. Test Tags

Tags are appended to test titles and filtered with `--grep`:

- `@smoke` — critical-path checks, fast subset
- `@regression` — full functional coverage
- `@api` — API-only suite

## 11. Reporting

```bash
npm run report                    # opens the HTML report
npm run report:allure:generate    # builds reports/allure-report
npm run report:allure:open        # opens the Allure report
```

Reports are written to `reports/` (`html-report/`, `results.json`, `junit-results.xml`, `allure-results/`, `ai-analysis.json`). On failure, screenshots, videos, and traces are captured automatically and attached to the HTML/Allure reports.

## 12. CI/CD

`.github/workflows/playwright.yml` runs on every push/PR to `main`:

1. Checkout → install Node 20 → `npm ci`
2. Install Playwright browsers (matrix: chromium / firefox / webkit / api)
3. Run tests per project
4. Generate the Allure report
5. Upload the HTML/Allure/JUnit/AI-analysis reports as artifacts
6. On failure, additionally upload screenshots/videos/traces
7. Publish JUnit results as a check-run summary

## 13. Docker

```bash
docker build -t pw-ecommerce-tests .
docker run --rm -v $(pwd)/reports:/app/reports pw-ecommerce-tests

# or
docker compose up --build
```

The image is based on `mcr.microsoft.com/playwright`, which ships Node and all browser binaries pre-installed — no separate browser-install step needed inside the container.

## 14. AI Failure Analysis

`utils/aiFailureAnalysis.ts` + `utils/aiReporter.ts` implement an **optional** post-run analysis step, registered as a secondary Playwright reporter:

- On every failed/timed-out test, the reporter collects the test name, error message, stack trace, screenshot path, and trace path.
- If `AI_API_KEY` is set, that context is sent to the Anthropic API, which returns a probable root cause, a failure category (`product-bug` / `automation-bug` / `environment-issue` / `flaky-test` / `unknown`), and a suggested fix.
- If no key is configured, a deterministic **heuristic** analyzer (pattern-matching on the error message) produces the same shape of output, so the feature — and the framework as a whole — works with zero external dependencies.
- **Status:** The heuristic path has been run and verified against real failing tests. The `AI_API_KEY` path is implemented and calls the Anthropic API as designed, but has not yet been exercised end-to-end with a live key.

## 15. Example Test Scenarios

- Login with valid/invalid/empty credentials; locked-out user; logout; session guard on direct URL access
- Sort products A–Z, Z–A, price low→high, high→low; verify product detail fields
- Add/remove single and multiple products; verify cart badge, quantities, and total
- Checkout with valid data; each required-field omission rejected individually; subtotal + tax = total; cancel returns to cart; confirmation clears the cart
- Full purchase journey combining all of the above in one `test.step`-annotated flow
- API: GET/POST/PUT/PATCH/DELETE on `/products`, category filtering, cart creation/lookup, login token issuance, negative-credential login, bearer-header usage, malformed-payload handling

## 16. Future Improvements

- Add visual regression testing (Playwright screenshot comparisons) for key pages
- Add contract/schema validation (e.g. Zod or JSON Schema) for API responses instead of ad-hoc property checks
- Parameterize the AI analyzer to also suggest a draft bug-report body for `product-bug` classifications
- Add a lightweight test-data factory/cleanup layer for the API suite (currently stateless against a mock-backed public API)
- Extend Allure reporting with historical trend tracking in CI (requires persistent storage between runs)
- Add contract tests against a real backing store if/when the API under test supports one (FakeStoreAPI does not persist writes)

## Known Limitations

- FakeStoreAPI is a public sandbox: `POST`/`PUT`/`PATCH`/`DELETE` calls return realistic responses but do **not** persist — this is documented in the API tests rather than hidden.
- `GET /products/:id` on FakeStoreAPI returns HTTP 200 with an empty body for unknown IDs rather than a 404; the test asserts this actual (if unusual) behavior instead of an assumed one.
- SauceDemo has no public API, so UI and API suites intentionally target two different demo applications.
