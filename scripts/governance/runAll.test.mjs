// Run explicitly with: node --test scripts/governance/runAll.test.mjs
// Exit zero alone is insufficient: failing checks must print a verdict too.
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const cwd = fileURLToPath(new URL('../..', import.meta.url))
const checks = [
  ['derive-registries', ['--check'], /^derive-registries: (PASS|FAIL)$/m],
  ['derive-obligations', ['--check'], /^derive-obligations: (PASS|FAIL)$/m],
  ['verify-ledger', [], /^verify-ledger: (PASS|FAIL)$/m],
  ['verify-evidence', [], /^verify-evidence: (PASS|FAIL)$/m],
  ['verify-protected-paths', ['--action=read-only'], /^verify-protected-paths: (PASS|FAIL)$/m],
  ['preflight', ['--action=read-only'], /^Structural preflight: (PASS|FAIL)$/m],
  ['stopping-checkpoint', [], /^STOPPING CHECKPOINT: (SAFE|FATAL)$/m],
]

for (const [name, args, verdict] of checks) {
  test(`${name} reaches its own verdict as a child process`, () => {
    const child = spawnSync(process.execPath, [`scripts/governance/${name}.mjs`, ...args], {
      cwd, encoding: 'utf8', timeout: 120_000,
    })
    assert.ifError(child.error)
    assert.equal(child.signal, null)
    const output = child.stdout + child.stderr
    assert.match(output, verdict, `${name} exited ${child.status} without its own verdict`)
    const result = output.match(verdict)[1]
    assert.equal(child.status, ['PASS', 'SAFE'].includes(result) ? 0 : name === 'stopping-checkpoint' ? 2 : 1, output)
  })
}

test('lib is a library, not a silent governance pass', () => {
  const direct = spawnSync(process.execPath, ['scripts/governance/lib.mjs'], { cwd, encoding: 'utf8', timeout: 10_000 })
  assert.ifError(direct.error)
  assert.equal(direct.status, 0)
  assert.equal(direct.stdout + direct.stderr, '')
  const probe = spawnSync(process.execPath, ['--input-type=module', '--eval', `
    import assert from 'node:assert/strict'
    import { ROOT, at, sha256, printResult } from './scripts/governance/lib.mjs'
    assert.equal(at(''), ROOT)
    assert.equal(sha256('abc'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad')
    assert.equal(printResult('lib utility probe', []), true)
  `], { cwd, encoding: 'utf8', timeout: 10_000 })
  assert.ifError(probe.error)
  assert.equal(probe.status, 0, probe.stderr)
  assert.match(probe.stdout, /^lib utility probe: PASS$/m)
})
