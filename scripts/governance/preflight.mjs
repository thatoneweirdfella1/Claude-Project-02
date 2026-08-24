import { spawnSync } from 'node:child_process'
import { exists, git, read, readJson, registryIds, sha256 } from './lib.mjs'
import { verifyLedger } from './verify-ledger.mjs'
import { verifyEvidence } from './verify-evidence.mjs'
import { verifyProtectedPaths } from './verify-protected-paths.mjs'

export function runPreflight({ print = true } = {}) {
  const errors = []
  const warnings = []
  const required = [
    'AGENTS.md','CLAUDE.md','START-HERE-DIVERGENCE.md',
    'docs/layer-system/AUTHORITY-MANIFEST.yml','docs/layer-system/SOURCE-CHECKPOINT.json',
    'docs/layer-system/CURRENT-LAYER-STATUS.md','docs/layer-system/PERMISSIONS.yml',
    'docs/layer-system/HANDOFF.md','docs/layer-system/LAYER-COVERAGE-LEDGER.csv',
    'docs/layer-system/LAYER-EVIDENCE-INDEX.jsonl'
  ]
  for (const file of required) if (!exists(file)) errors.push(`missing required file: ${file}`)

  const source = readJson('docs/layer-system/SOURCE-CHECKPOINT.json')
  const permissions = readJson('docs/layer-system/PERMISSIONS.yml')
  const manifest = readJson('docs/layer-system/AUTHORITY-MANIFEST.yml')
  const statusText = read('docs/layer-system/CURRENT-LAYER-STATUS.md')
  const branch = git(['branch','--show-current'], { allowFailure: true }).stdout
  const head = git(['rev-parse','HEAD'], { allowFailure: true }).stdout
  const remote = git(['remote','get-url','origin'], { allowFailure: true }).stdout

  if (source.repository !== 'thatoneweirdfella1/Claude-Project-02') errors.push('repository identity mismatch')
  if (branch !== source.continuation_branch) errors.push(`wrong branch: ${branch || '<none>'}`)
  if (remote && !remote.includes('thatoneweirdfella1/Claude-Project-02')) errors.push(`wrong origin: ${remote}`)
  if (!/^[0-9a-f]{40}$/.test(head)) errors.push('runtime HEAD is not a full SHA')
  if (git(['merge-base','--is-ancestor',source.source_commit,'HEAD'], { allowFailure: true }).status !== 0) errors.push('source checkpoint is not an ancestor of HEAD')

  for (const authority of manifest.authorities || []) {
    if (!exists(authority.canonical_path)) {
      errors.push(`manifest authority is missing: ${authority.canonical_path}`)
      continue
    }
    const actual = sha256(read(authority.canonical_path))
    if (actual !== authority.content_sha256) errors.push(`manifest hash mismatch: ${authority.canonical_path}`)
  }

  const derive = spawnSync(process.execPath, ['scripts/governance/derive-registries.mjs','--check'], { cwd: new URL('../..', import.meta.url), encoding:'utf8' })
  if (derive.status !== 0) errors.push(`registry derivation failed: ${(derive.stderr || derive.stdout).trim()}`)

  errors.push(...verifyLedger(), ...verifyEvidence(), ...verifyProtectedPaths())

  for (const [name, denominator] of Object.entries(manifest.denominators || {})) {
    const count = registryIds(denominator.registry_path).length
    if (count !== denominator.verified_count) errors.push(`${name} registry count ${count} differs from manifest ${denominator.verified_count}`)
    for (let index = 0; index < (denominator.source_paths || []).length; index += 1) {
      const sourcePath = denominator.source_paths[index]
      const expectedHash = denominator.source_sha256?.[index]
      if (!exists(sourcePath)) errors.push(`${name} denominator source is missing: ${sourcePath}`)
      else if (sha256(read(sourcePath)) !== expectedHash) errors.push(`${name} denominator source hash mismatch: ${sourcePath}`)
    }
  }

  const allowlisted = new Set(read('docs/layer-system/TEMPLATE-MARKER-ALLOWLIST.txt').split(/\r?\n/).filter((line) => line && !line.startsWith('#')))
  const trackedResult = git(['ls-files'], { allowFailure: true })
  if (trackedResult.status !== 0) errors.push(`tracked-file scan unavailable: ${trackedResult.stderr || 'not a Git checkout'}`)
  const tracked = (trackedResult.stdout || '').split(/\r?\n/).filter(Boolean)
  for (const file of tracked) {
    if (allowlisted.has(file)) continue
    let body
    try { body = read(file) } catch { continue }
    if (body.includes('__REQUIRED_VALUE__')) errors.push(`unresolved template marker in ${file}`)
  }

  if (permissions.default !== 'deny') errors.push('permissions default is not deny')
  if (permissions.grants?.modify_application_behavior?.allowed) warnings.push('application behavior permission is active')
  const baseline = readJson('docs/layer-system/GOVERNANCE-BASELINE.json')
  if (!baseline.protected_ref) warnings.push(baseline.server_protection)

  const last = /\*\*Last completed horizontal layer:\*\* `([^`]+)`/.exec(statusText)?.[1] || 'UNKNOWN'
  const active = /\*\*Active layer:\*\* `([^`]+)`/.exec(statusText)?.[1] || 'UNKNOWN'
  const batch = /\*\*Active coherent batch:\*\* `([^`]+)`/.exec(statusText)?.[1] || 'UNKNOWN'
  const next = /## Exact next action\s+([\s\S]*?)(?:\n##|$)/.exec(statusText)?.[1]?.trim().replace(/\s+/g,' ') || 'MISSING'
  if (active !== 'NONE' && !/^L[1-7]$/.test(active)) errors.push(`invalid active layer ${active}`)
  if (next === 'MISSING') errors.push('exact next action is missing')

  const effective = Object.entries(permissions.grants || {}).filter(([,value]) => value.allowed).map(([name]) => name)
  const certificate = [
    'RESUME CERTIFICATE',
    `Repository: ${source.repository}`,
    `Remote: ${remote || source.canonical_remote}`,
    `Branch: ${branch || '<none>'}`,
    `Runtime HEAD: ${head || '<none>'}`,
    `Verified source checkpoint: ${source.source_commit}`,
    `Governance baseline ref/SHA: ${baseline.protected_ref || 'PROCEDURAL'} / ${baseline.baseline_commit}`,
    `Last completed layer: ${last}`,
    `Active layer: ${active}`,
    `Active batch: ${batch}`,
    `Exact next action: ${next}`,
    `Effective permissions: ${effective.join(', ') || 'NONE'}`,
    `Protected paths: ${errors.some((error) => error.includes('protected')) ? 'CHANGED' : 'UNCHANGED'}`,
    `Structural preflight: ${errors.length ? 'FAIL' : 'PASS'}`,
    `Blocking findings: ${errors.length ? errors.join(' | ') : 'NONE'}`,
  ].join('\n')

  if (print) {
    console.log(certificate)
    for (const warning of warnings) console.warn(`WARNING: ${warning}`)
  }
  return { ok: errors.length === 0, errors, warnings, certificate }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = runPreflight()
  if (!result.ok) process.exit(1)
}
