#!/usr/bin/env node
/**
 * Command Center Setup
 * Run: node setup.js
 * Creates your .env file interactively.
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise(res => rl.question(q, res));

async function main() {
  console.log('\n⚡ COMMAND CENTER SETUP\n' + '─'.repeat(40));
  console.log('Answer each question. Press Enter to skip a service.\n');

  const env = {};

  // Stripe
  const wantStripe = (await ask('Stripe revenue dashboard? (y/n): ')).toLowerCase().startsWith('y');
  if (wantStripe) {
    const k = (await ask('  Stripe Secret Key (dashboard.stripe.com/apikeys): ')).trim();
    if (k) env.STRIPE_SECRET_KEY = k;
  }

  // Instagram
  const wantIg = (await ask('Instagram post analytics? (y/n): ')).toLowerCase().startsWith('y');
  if (wantIg) {
    const t = (await ask('  IG Access Token (developers.facebook.com/tools/explorer): ')).trim();
    if (t) env.IG_ACCESS_TOKEN = t;
  }

  // Competitors
  const wantComp = (await ask('Competitor tracking via Apify? (y/n): ')).toLowerCase().startsWith('y');
  if (wantComp) {
    const t = (await ask('  Apify Token (apify.com → Settings → Integrations): ')).trim();
    if (t) env.APIFY_TOKEN = t;
    const handles = (await ask('  Competitor handles (comma-separated, no @): ')).trim();
    if (handles) env.COMPETITORS = handles;
  }

  // Google
  const wantGoogle = (await ask('Gmail + Calendar (requires gws CLI)? (y/n): ')).toLowerCase().startsWith('y');
  if (wantGoogle) {
    const email = (await ask('  Your Gmail address: ')).trim();
    env.GOOGLE_ENABLED = 'true';
    if (email) env.USER_EMAIL = email;
    console.log('  → Run "gws auth login" in your terminal to authenticate Google.');
  }

  // News
  const wantNews = (await ask('AI News via Tavily? (y/n): ')).toLowerCase().startsWith('y');
  if (wantNews) {
    const k = (await ask('  Tavily API Key (tavily.com): ')).trim();
    if (k) env.TAVILY_API_KEY = k;
  }

  rl.close();

  // Write .env
  const lines = ['# Command Center Configuration'];
  for (const [k, v] of Object.entries(env)) lines.push(`${k}=${v}`);
  const envPath = path.join(__dirname, '.env');
  fs.writeFileSync(envPath, lines.join('\n') + '\n');

  const enabled = Object.keys(env).filter(k => !['USER_EMAIL', 'GOOGLE_ENABLED', 'COMPETITORS'].includes(k));
  console.log('\n✓ .env saved');
  console.log('Enabled: ' + (enabled.length ? enabled.join(', ') : 'none') + '\n');
  console.log('Start your dashboard:');
  console.log('  npm start\n');
  console.log('Then open: http://localhost:3000\n');
}

main().catch(e => { console.error(e); process.exit(1); });
