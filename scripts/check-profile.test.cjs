const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const test = require('node:test');

const profile = readFileSync(join(__dirname, '..', 'README.md'), 'utf8');
const allowedRepos = new Set([
  'tantanpq/pai',
  'tantanpq/business-idea-scorer',
  'tantanpq/leona-scoring-standards',
  'tantanpq/pai-reliability-evidence',
]);

test('profile contains no personal contact or local network details', () => {
  for (const [label, pattern] of [
    ['email', /[\w.!#$%&'*+/=?^`{|}~-]+@[\w-]+(?:\.[\w-]+)+/i],
    ['private IP', /\b(?:100(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2})\b/],
    ['personal path', /c:[\\/]users[\\/]/i],
  ]) {
    assert.equal(pattern.test(profile), false, `Remove ${label} from the profile`);
  }
});

test('GitHub links reference only allowlisted repositories', () => {
  for (const match of profile.matchAll(/(?:https?:)?\/\/[^\s<>"')\]]+/gi)) {
    const url = new URL(match[0], 'https://github.com');
    if (url.hostname.toLowerCase().replace(/^www\./, '') !== 'github.com') continue;
    const repo = decodeURIComponent(url.pathname).split('/').filter(Boolean).slice(0, 2).join('/').toLowerCase();
    assert.equal(allowedRepos.has(repo), true, 'Remove non-allowlisted GitHub repository link');
  }
});

test('profile presents the four public PAI surfaces and business contact', () => {
  for (const phrase of ['Personal Assistant Intelligence', 'evidence-verified outcomes',
    'Context Kit', 'Context Economy', 'W_Flow Core', 'SimLab Core', 'https://zlinegroup.us']) {
    assert.equal(profile.includes(phrase), true, `Missing ${phrase}`);
  }
  assert.match(profile, /archived evidence/i);
});
