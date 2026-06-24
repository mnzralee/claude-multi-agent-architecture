---
name: interactive-live-testing
description: Drive Playwright against a running application step-by-step, screenshot, analyze, decide, act. Applies to any web frontend regardless of stack.
---

# Interactive Live Testing Skill

Drive Playwright against a running application step-by-step, screenshot, analyze, decide, act. Like a senior QA engineer manually testing but with full programmatic control. The discipline is stack-agnostic and applies to any web frontend (Next.js, Vite, Create React App, Vue, Angular, or similar).

## When to Use

- Seeding data through actual UI flows rather than API shortcuts
- Verifying end-to-end rendering after a deployment or build
- Finding integration bugs that unit tests miss
- Visual regression testing with screenshot evidence
- Testing auth flows, form submissions, and event-driven pipelines live

## Philosophy

**See, Decide, Act, Verify.** Never script 50 steps blind. Take a screenshot, read it, decide the next action based on what you SEE. Every bug found is fixed immediately, committed, rebuilt, and retested before proceeding.

## Prerequisites

Before any live testing session:

```bash
# 1. Verify services are running (adapt to your runtime: Docker Compose, k8s, PM2, etc.)
#    [CUSTOMIZE: replace with your health-check command]
docker compose ps   # or: kubectl get pods -n [CUSTOMIZE: namespace]

# 2. Expose required services on localhost if behind a proxy or cluster
#    [CUSTOMIZE: port-forward, ngrok tunnel, or docker compose ports mapping]
kubectl port-forward deploy/svc-api 3001:3001 &
kubectl port-forward deploy/svc-auth 3002:3002 &

# 3. Start the frontend locally (or confirm the dev server is already running)
#    [CUSTOMIZE: your frontend start command and environment variables]
cd apps/web && NEXT_PUBLIC_API_URL=http://localhost:3001 npm run dev

# 4. Verify Playwright is installed in the frontend package
cd apps/web && npx playwright install chromium
```

## Core Pattern: Step-by-Step Navigation

Always run Playwright from the directory where it is installed (the frontend app package):

```javascript
cd /path/to/your/apps/web && node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // --- YOUR ACTIONS HERE ---
  await page.goto('http://localhost:3000/...', { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(2000);

  // --- SCREENSHOT ---
  await page.screenshot({ path: '/tmp/playwright-live-test/XX-description.png', fullPage: true });

  // --- ANALYZE ---
  const body = await page.textContent('body');
  console.log('Has expected text:', body.includes('Expected'));

  await browser.close();
})();
" 2>&1
```

Then READ the screenshot:
```
Read /tmp/playwright-live-test/XX-description.png
```

Based on what you see, decide the next action.

## Authentication Pattern (Session Token in localStorage)

For admin or internal apps that store a JWT in localStorage:

```javascript
// Navigate to login and click a dev-mode quick-login button if one exists
await page.goto('http://localhost:3000/auth/login', { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
await page.waitForTimeout(1500);
// [CUSTOMIZE: click the appropriate dev-mode login shortcut or fill credentials]
await page.getByText('Admin Login').first().click();
await page.waitForURL('**/dashboard**', { timeout: 15000 }).catch(() => {});
await page.waitForTimeout(2000);
```

For API calls from within the browser context (with the stored token):
```javascript
const result = await page.evaluate(async () => {
  // [CUSTOMIZE: replace token key and endpoint]
  const t = localStorage.getItem('access_token');
  const r = await fetch('/api/items?page=1&limit=20', {
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + t },
  });
  return { status: r.status, body: await r.text() };
});
console.log('API:', result.status, result.body.substring(0, 200));
```

## Authentication Pattern (Email / Password Form)

For consumer-facing apps that use a standard login form:

```javascript
await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
// [CUSTOMIZE: selector names and test credentials]
await page.fill('input#email', 'e2e-test@example.test');
await page.fill('input#password', 'TestPassword123!');
await page.click('button[type="submit"]');
// If an OTP step follows: [CUSTOMIZE: fill in the dev-mode OTP or skip if not applicable]
```

## Form Interaction Patterns

### Select dropdowns (shadcn/ui or similar headless component):
```javascript
await page.locator('#category').click();                           // Open select
await page.waitForTimeout(200);                                    // Wait for animation
await page.getByRole('option', { name: 'Your Option' }).click();  // [CUSTOMIZE: option name]
```

### Text inputs:
```javascript
await page.locator('#name').fill('E2E Test Item');  // [CUSTOMIZE: field selector and value]
```

### Buttons:
```javascript
await page.getByText('Submit').click();                              // By visible text
await page.getByRole('button', { name: 'Retry' }).click();          // By ARIA role
```

### Dialogs / modals:
```javascript
// Open dialog
await page.getByText('New Item').click();  // [CUSTOMIZE: trigger text]
await page.waitForTimeout(500);

// Fill dialog form
await page.locator('#name').fill('Test');
await page.getByText('Submit').click();

// Confirm the dialog closed
const isOpen = await page.locator('[role=dialog]').isVisible().catch(() => false);
console.log('Dialog still open:', isOpen);
```

## Diagnosis Patterns

### Find all buttons on the page:
```javascript
const buttons = await page.locator('button').allTextContents();
console.log('Buttons:', buttons.filter(b => b.trim()).join(' | '));
```

### Find all links:
```javascript
const links = await page.locator('a[href]').evaluateAll(els => els.map(e => e.href));
console.log('Links:', links.join('\n'));
```

### Check body text for keywords:
```javascript
const body = await page.textContent('body');
console.log('Has error:', body.includes('error') || body.includes('Error'));
console.log('Has data:', body.includes('Expected Content'));
```

### Check console errors:
```javascript
const errors = [];
page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
// ... navigate and interact ...
console.log('Console errors:', errors.length, errors.slice(0, 3));
```

### Check failed network requests:
```javascript
const requests = [];
page.on('response', res => {
  if (res.status() >= 400) requests.push({ url: res.url(), status: res.status() });
});
// ... navigate and interact ...
console.log('Failed requests:', requests);
```

## Bug Discovery, Fix, and Verify Cycle

When a bug is found during testing:

```
1. SCREENSHOT the broken state
2. READ the screenshot to understand the visual impact
3. CHECK backend logs: [CUSTOMIZE: e.g. kubectl logs deploy/svc-api --tail=10]
4. CHECK browser console: use the page.on('console') pattern above
5. IDENTIFY the root cause from error messages
6. FIX the code (Edit tool)
7. COMMIT the fix (git add + git commit with a descriptive message)
8. REBUILD the service if a backend change was made:
   [CUSTOMIZE: e.g. docker build / kubectl rollout / docker compose up --build]
9. RE-ESTABLISH any port-forwards that died during the restart
10. RE-TEST the same action that previously failed
11. SCREENSHOT the fixed state as evidence
```

Average cycle time: roughly 5 minutes per bug.

## Screenshot Naming Convention

```
/tmp/playwright-live-test/
├── 01-login-page.png
├── 02-after-login.png
├── 03-list-page.png
├── 04-dialog-open.png
├── 05-form-filled.png
├── 06-after-submit.png
├── 07-detail-page.png
├── 08-secondary-page.png
├── ...
```

Sequential numbers. Descriptive suffix. Screenshots are evidence: capture BEFORE and AFTER every significant action.

## Database Verification

Check persisted state directly after UI actions. The exact command depends on your runtime:

```bash
# Via kubectl exec (Kubernetes):
# [CUSTOMIZE: namespace, pod name, DB user, DB name, and query]
kubectl exec -n your-namespace postgres-0 -- psql -U app_user -d app_db -c \
  "SELECT id, status, created_at FROM orders ORDER BY created_at DESC LIMIT 5;"

# Via Docker Compose:
# [CUSTOMIZE: service name, user, DB name, and query]
docker compose exec postgres psql -U app_user -d app_db -c \
  "SELECT id, status, created_at FROM orders ORDER BY created_at DESC LIMIT 5;"

# Via a local psql client:
# [CUSTOMIZE: connection string and query]
psql $DATABASE_URL -c "SELECT id, status FROM orders ORDER BY created_at DESC LIMIT 5;"
```

For event-sourced or outbox-pattern systems, also verify the event/command queue:

```bash
# [CUSTOMIZE: table and column names to match your schema]
psql $DATABASE_URL -c \
  "SELECT event_type, status, created_at FROM outbox_events ORDER BY created_at DESC LIMIT 5;"
```

## Service Log Monitoring

```bash
# [CUSTOMIZE: adapt to your runtime (kubectl, docker compose, pm2 logs, etc.)]
# All relevant services in sequence
echo "=== api ===" && kubectl logs deploy/svc-api --tail=5
echo "=== worker ===" && kubectl logs deploy/worker --tail=5
echo "=== projector ===" && kubectl logs deploy/projector --tail=5
```

Watch for patterns such as:
- ORM errors indicating schema or query mismatches
- Missing role or permission errors from your authorization layer
- ABI or contract errors if the project uses on-chain integrations
- Missing event handler or unregistered event type logs

## Common Gotchas (Learned from Experience)

| Gotcha | Symptom | Fix |
|--------|---------|-----|
| Port-forward dies on pod restart | "Connection refused" | Kill the old forward (`pkill -f "port-forward.*PORT"`) then re-establish |
| Playwright package not found | `Cannot find module 'playwright'` | Run `node -e "..."` from the app directory where Playwright is installed |
| Turbopack or Webpack stale cache | Old component renders after a fix | `rm -rf .next` (or `dist/`) and restart the dev server |
| Route ordering | Parameterized route swallows literal path | Register literal paths (`/items/new`) BEFORE parameterized ones (`/items/:id`) |
| ORM enum mismatch | "Invalid value for argument" | Do not pass raw strings where the schema expects a typed enum value |
| JWT shape mismatch | "Invalid token payload" from backend | Verify the token payload fields match what the auth middleware expects |
| API response shape | Detail page crashes on render | Check whether the API wraps the payload (`{ item: {...} }`) or returns it flat |
| Docker layer cache | Service reports stale artifact count | Add a `COPY` invalidation step or pass `--no-cache` during rebuild |
| Wrong `DATABASE_URL` inside container | "Table does not exist" | Inspect the env inside the container: `kubectl exec ... -- env | grep DATABASE_URL` |

## Session Workflow

```
1. Read the previous work record for context
2. Set up port-forwards and start dev servers
3. Start the interactive testing loop:
   a. Navigate to the target page
   b. Screenshot
   c. Read the screenshot
   d. Decide the next action
   e. If a bug is found: enter the fix cycle (see above)
   f. If everything is working: proceed to the next test case
   g. Capture screenshot evidence at each checkpoint
4. Check backend logs after each major action
5. Verify database state after write operations
6. Update the work record with a narrative summary and screenshot references
7. Commit all fixes with descriptive messages
```

## Metrics to Track

- Screenshots captured (evidence count)
- Bugs found versus bugs fixed
- Service rebuilds needed
- Event-driven round-trips verified (for CQRS or outbox-pattern systems)
- Pages tested: list, detail, form, empty state, error state
- Entities seeded through the UI rather than via direct DB inserts
