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

const b64 = partNames
  .map((name) => fs.readFileSync(path.join(partsDir, name), 'utf8'))
  .join('')
  .replace(/\s+/g, '');

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

console.log(`Applied complete Cowork preview overlay (${actual})`);
