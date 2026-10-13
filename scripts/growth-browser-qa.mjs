import { chromium } from '../.tmp/browser-qa/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
await context.addInitScript(() => localStorage.setItem('usiHubLanguage', 'en'));
const page = await context.newPage();
const errors = []; page.on('pageerror', err => errors.push(err.message));
try {
  await page.goto('http://localhost:4189/#startup-growth', { waitUntil: 'domcontentloaded' });
  await page.locator('[data-growth-new="session"]').waitFor({ timeout: 45000 });
  // Fixture references an existing startup. No startup/goal sample from the prototype is imported.
  const fixture = await page.evaluate(async () => {
    const { getDemoData } = await import('/js/services/dataService.js');
    const { saveRecord } = await import('/js/services/mvpService.js');
    const startups = getDemoData().startups;
    const milestone = saveRecord('milestones', { startupId: startups[0].id, title: 'Browser QA evidence milestone', owner: 'QA SGA', due: '2026-12-01', criteria: 'Synthetic interview observations' }, 'sga', startups.map(s => s.id));
    return { id: startups[0].id, milestoneId: milestone.id };
  });
  await page.selectOption('#growth-startup', fixture.id);
  await page.click('[data-growth-new="session"]');
  for (const [key, value] of Object.entries({ title: 'Browser QA structured session', date: '2026-10-13', owner: 'QA SGA', source: 'Synthetic QA notes', issue: 'Evidence gap', supportNeed: 'Customer discovery guidance', action: 'Browser QA action', assignee: 'QA SGA', due: '2026-12-01' })) await page.locator(`#growth-form [name="${key}"]`).fill(value);
  await page.selectOption('#growth-form-goal', fixture.milestoneId);
  await page.check('#growth-form [name="createTask"]');
  await page.click('#growth-form [type="submit"]');
  await page.locator('.growth-records h3', { hasText: 'Browser QA structured session' }).waitFor();
  const state = await page.evaluate(() => JSON.parse(localStorage.getItem('usiHubMvpV1')));
  assert.equal(state.sessions.length, 1); assert.equal(state.tasks.length, 1);
  assert.equal(state.tasks[0].milestoneId, fixture.milestoneId);
  await page.click('[data-growth-view="worklist"]');
  await page.fill('#task-owner-filter', 'QA SGA');
  assert.ok((await page.locator('#task-table').innerText()).includes('Browser QA action'));
  await page.locator(`[data-open-task="${state.tasks[0].id}"]`).click();
  await page.selectOption('#detail-status', 'Done');
  await page.fill('#detail-notes', 'Synthetic completion note');
  await page.click('#save-task-detail');
  await page.goto('http://localhost:4189/#startup-growth');
  await page.locator('[data-growth-view="followups"]').waitFor();
  await page.click('[data-growth-view="followups"]');
  assert.ok((await page.locator('.growth-records').innerText()).includes('Outcome pending'));
  await page.click(`[data-growth-outcome="${state.sessions[0].id}"]`);
  await page.fill('#growth-form [name="date"]', '2026-10-14');
  await page.selectOption('#growth-form [name="type"]', 'Partial result');
  await page.fill('#growth-form [name="observation"]', 'Two synthetic interviews observed');
  await page.fill('#growth-form [name="evidence"]', 'Synthetic interview note reference');
  await page.click('#growth-form [type="submit"]');
  assert.ok((await page.locator('.growth-records').innerText()).includes('Two synthetic interviews observed'));
  await page.reload();
  await page.locator('[data-growth-view="followups"]').waitFor();
  await page.click('[data-growth-view="followups"]');
  assert.ok((await page.locator('.growth-records').innerText()).includes('Two synthetic interviews observed'));
  await page.screenshot({ path: '.tmp/growth-desktop.png', fullPage: true });
  await page.click('#language-switch');
  assert.ok((await page.locator('.growth-page').innerText()).includes('Theo dõi và kết quả'));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: '.tmp/growth-mobile.png', fullPage: true });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2), 'No horizontal page overflow');
  for (const route of ['overview', 'startup-os', 'startup-detail', 'project-board', 'knowledge-base', 'mvp-operations', 'contacts']) {
    await page.goto(`http://localhost:4189/#${route}`);
    await page.locator('#app-root').waitFor();
    assert.ok(!(await page.locator('#app-root').innerText()).includes('could not render'), route);
  }
  assert.deepEqual(errors, []);
  console.log('PASS: session/action links, worklist/task consistency, Done independent of outcome, outcome persistence, VI/EN, desktop/mobile, legacy routes.');
  console.log('Screenshots: .tmp/growth-desktop.png; .tmp/growth-mobile.png');
} finally { await browser.close(); }
