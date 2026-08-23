const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const crypto = require('crypto');

const root = process.cwd();
const partsDir = path.join(root, 'cowork-preview', 'parts');
const partNames = fs.readdirSync(partsDir).filter((name) => /^part-\d+$/.test(name)).sort();
if (partNames.length !== 8) {
  throw new Error(`Expected 8 Cowork preview archive parts, found ${partNames.length}`);
}

const expectedPartHashes = [
  'b7a4faa3726acacd3909d2aaf094fb3fe4470e12a96dce8d9e664e77a152f691',
  '85202958efa74947ef56ed55d63ef9140137cf4705b26c42efa2c24f8b2f0843',
  'bc38e169bd9a765da82ce8bfb3dc1c491225e6bc1c8b6926d02de895722cf105',
  '0f4fdffe7cd0f3debcb9554c708c4e418ac8600c385a05cc7188fea98a0e6d62',
  'faa5a2b3cd538f033668c9a387d83737c061587c2a47e75ae12c5aeab96fe332',
  'cfe2467038cc0f33336e0e1dba372e696f28e73acd33960b1ef1f5d8ff4c1559',
  'c40d238b08c52ef34a88ee1e2eea31ec9f636e96a980d9ca8d69c3afe876cd51',
  '6e9cb5bed9fae411b6879b3b0b0c663e9347b364e16ae79b5d3f5249328b4f25',
];

const partTexts = partNames.map((name, index) => {
  const text = fs.readFileSync(path.join(partsDir, name), 'utf8');
  const hash = crypto.createHash('sha256').update(text).digest('hex');
  if (hash !== expectedPartHashes[index]) {
    throw new Error(`Cowork overlay part mismatch: ${name}; expected ${expectedPartHashes[index]}, got ${hash}`);
  }
  return text;
});

const b64 = partTexts.join('').replace(/\s+/g, '');
const archive = Buffer.from(b64, 'base64');
const actual = crypto.createHash('sha256').update(archive).digest('hex');
const expected = 'fd0417f1b72881492c9faebea5cefc6514258eae535c3436de9425193a5c49bb';
if (actual !== expected) {
  throw new Error(`Cowork overlay checksum mismatch: expected ${expected}, got ${actual}`);
}

const tmp = path.join(root, '.cowork-delta.tar.gz');
fs.writeFileSync(tmp, archive);
try {
  cp.execFileSync('tar', ['-xzf', tmp, '-C', root], { stdio: 'inherit' });
} finally {
  if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
}

// Vercel compiles files in api/ with NodeNext module resolution, which requires
// explicit .js extensions on relative ESM imports. Cowork's client-side Vite
// build accepts the extensionless form, so normalize only in this disposable
// preview build after the authoritative Cowork overlay has been applied.
const nodeNextFixes = [
  ['src/services/modelRegistry.ts', 'export type { ModelId } from "../stores/types";', 'export type { ModelId } from "../stores/types.js";'],
  ['src/services/providers/openai.ts', 'from "../proxyHandler";', 'from "../proxyHandler.js";'],
  ['src/services/providers/google.ts', 'from "../proxyHandler";', 'from "../proxyHandler.js";'],
  ['src/services/providers/xai.ts', 'from "../proxyHandler";', 'from "../proxyHandler.js";'],
  ['src/services/providers/deepseek.ts', 'from "../proxyHandler";', 'from "../proxyHandler.js";'],
];
for (const [rel, before, after] of nodeNextFixes) {
  const file = path.join(root, rel);
  const source = fs.readFileSync(file, 'utf8');
  if (!source.includes(before)) {
    if (!source.includes(after)) throw new Error(`Expected NodeNext import pattern missing in ${rel}`);
    continue;
  }
  fs.writeFileSync(file, source.replace(before, after));
}

console.log(`Applied complete Cowork preview overlay (${actual}) and Vercel-only NodeNext import normalization`);
