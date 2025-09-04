```markdown
# FloQast Staff QA Assessment – Playwright + Allure Framework

This repository contains an end‑to‑end **API + UI test automation framework** built with [Playwright](https://playwright.dev/), [TypeScript](https://www.typescriptlang.org/), and [Allure Reporting](https://docs.qameta.io/allure/).

It includes:

- **API Test Suite** – CRUD operations, validation, and authorization scenarios
- **UI Test Suite** – User registration and transaction flows (mock frontend)
- **Test Utilities** – Factories, helpers, environment config, custom assertions
- **Reporting** – Allure HTML reports, screenshots, API logs
- **CI/CD** – Ready‑to‑run GitHub Actions workflow

---

## 📦 Prerequisites

Before you begin, ensure you have:

- **Node.js** ≥ 18.x and npm ≥ 9.x  
  [Download Node.js](https://nodejs.org/en/download/)
- **Java** ≥ 8 (required for Allure CLI)  
  [Install Java](https://adoptopenjdk.net/)
- **Allure CLI** installed globally:
  ```bash
  npm install -g allure-commandline --save-dev
  ```
- **Git** installed and configured

---

## 🚀 Cloning the Repository

```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
```

---

## ⚙️ Installing Dependencies

```bash
npm install
```

This will install:
- Playwright + browsers
- TypeScript
- Allure Playwright adapter
- Mock server dependencies
- Utility libraries (faker, dotenv, etc.)

---

## 🛠 Environment Configuration

Environment variables are managed via `.env` files.

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```
2. Update values as needed:
   ```env
   BASE_URL=http://localhost:3001
   UI_URL=http://localhost:3002
   TOKEN=dummy-token
   LOG_API_RESPONSES=true
   ```

---

## 🖥 Running Locally

### 1. Start API + UI servers and run all tests
```bash
npm run serve
```
This will:
- Kill any processes on ports 3001/3002
- Start the mock API server (`src/mocks/mockApiServer.ts`)
- Start the mock UI server (`src/mocks/uiServer.ts`)
- Run **API + UI tests** sequentially
- Generate and open the Allure report

---

### 2. Run only API tests
```bash
npm run test:api:with-server
```

### 3. Run only UI tests
```bash
npm run test:ui:with-server
```

---

## 📊 Viewing Reports

After a run:
```bash
npm run allure:generate
npm run allure:open
```
This opens the interactive Allure dashboard with:
- Test results grouped by **epic**, **feature**, and **story**
- Screenshots, videos, and traces for UI failures
- API request/response logs

---

## 🧪 Project Structure

```
.
├── src
│   ├── mocks/                 # Mock API + UI servers
│   ├── factories/             # Test data builders
│   ├── utils/                  # ApiClient, assertions, helpers
│   └── config/                 # Environment config
├── tests
│   ├── api/                    # API test suites
│   └── ui/                     # UI test suites
├── playwright.config.ts        # Playwright configuration
├── package.json
└── README.md
```

---

## 🔄 GitHub Actions CI/CD

This repo includes a `.github/workflows/ci.yml` workflow that:

1. Runs on every push and pull request
2. Checks out the repo
3. Installs Node.js and dependencies
4. Installs Playwright browsers
5. Runs the full test suite
6. Uploads the Allure results as an artifact

**Example workflow file** (`.github/workflows/ci.yml`):

```yaml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run tests
        run: npm run test:all

      - name: Generate Allure report
        run: |
          npm run allure:generate
          mkdir -p allure-history
          cp -r allure-report/* allure-history/

      - name: Upload Allure report artifact
        uses: actions/upload-artifact@v4
        with:
          name: allure-report
          path: allure-report
```

---

## 🧹 Useful Commands

| Command | Description |
|---------|-------------|
| `npm run lint` | Run ESLint checks |
| `npm run typecheck` | Run TypeScript type checks |
| `npm run perf` | Run k6 performance tests |
| `npm run build` | Compile TypeScript |

---

## 💡 Tips for Reviewers

- **Allure Labels**: Tests are tagged with `epic`, `feature`, and `story` for easy filtering in the report.
- **Factories**: Use `buildUser()` and `buildTransaction()` to generate valid/invalid test data.
- **Custom Assertions**: `expectJson()` and `expectProblem()` ensure consistent API response validation.
- **CI/CD Ready**: The GitHub Actions workflow runs the same commands as local, ensuring parity.

---

## 📄 License

This project is for assessment purposes only and not licensed for production use.
```

---
 I  also added a video recording section to visually show the test run and Allure report 
