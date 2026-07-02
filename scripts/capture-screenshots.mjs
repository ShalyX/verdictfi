import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';

const base = process.env.VERDICTFI_URL || 'http://localhost:3100';
const out = '/root/verdictfi-screenshots';
await fs.mkdir(out, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 1 });

async function shot(path, name, fullPage = true) {
  await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `${out}/${name}.png`, fullPage });
  console.log(`${out}/${name}.png`);
}

await shot('/', '01-landing');
await shot('/onboarding', '02-onboarding');
await shot('/desk', '03-dashboard');

await page.goto(`${base}/desk`, { waitUntil: 'networkidle' });
await page.getByLabel('Notional USD').fill('3000');
await page.getByRole('button', { name: /generate accountable signal/i }).click();
await page.getByRole('link', { name: /public packet/i }).waitFor({ timeout: 15000 });
const packetHref = await page.getByRole('link', { name: /public packet/i }).getAttribute('href');
if (!packetHref) throw new Error('No public packet link found');
await shot(packetHref, '04-evidence-packet');
await shot('/track-record', '05-track-record');

await browser.close();
