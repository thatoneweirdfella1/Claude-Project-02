import { spawnSync } from 'node:child_process'
import { exists, git, matchesAnyGlob, read, readJson, registryIds, sha256 } from './lib.mjs'
import { verifyLedger } from './verify-ledger.mjs'
import { verifyEvidence } from './verify-evidence.mjs'
import { verifyProtectedPaths } from './verify-protected-paths.mjs'

const ACTION_TO_PERMISSION = {
  'read-only':'inspect_repository',
  'install_governance':'install_governance',
  'modify_governance':'modify_governance',
  'create_continuation_branch':'create_continuation_branch',
  'push_continuation_branch':'push_continuation_branch',
  'create_protected_tag':'create_protected_tag',
  'configure_repository_rules':'configure_repository_rules',
  'open_pull_request':'open_pull_request',
  'merge':'merge',
  'modify_application_behavior':'modify_application_behavior',
  'modify_application_tests':'modify_application_tests',
  'deploy_preview':'deploy_preview',
  'promote_stable_preview':'promote_stable_preview',
  'deploy_production':'deploy_production',
  'configure_auth_service':'configure_auth_service',
  'create_or_modify_identity':'create_or_modify_identity',
  'provision_database_or_storage':'provision_database_or_storage',
  'write_remote_user_data':'write_remote_user_data',
  'synchronize_remote_user_data':'synchronize_remote_user_data',
  'run_schema_migration':'run_schema_migration',
  'configure_payment_provider':'configure_payment_provider',
  'create_payment_or_checkout':'create_payment_or_checkout',
  'call_payment_sandbox':'call_payment_sandbox',
  'charge_or_reserve_funds':'charge_or_reserve_funds',
  'reconcile_or_release_reserved_credit':'reconcile_or_release_reserved_credit',
  'modify_allowance_or_entitlement':'modify_allowance_or_entitlement',
  'connect_free_provider':'connect_free_provider',
  'connect_paid_provider':'connect_paid_provider',
  'call_external_ai_provider':'call_external_ai_provider',
  'register_oauth_application':'register_oauth_application',
  'install_browser_companion':'install_browser_companion',
  'modify_environment_configuration':'modify_environment_configuration',
  'read_secrets':'read_secrets',
  'write_or_rotate_secrets':'write_or_rotate_secrets'
}

const GOVERNANCE_ACTIONS = ['read-only','install_governance','modify_governance','create_continuation_branch','push_continuation_branch','create_protected_tag','configure_repository_rules']
const EXTERNAL_EFFECT_PERMISSIONS = Object.values(ACTION_TO_PERMISSION).filter((permission) => !['inspect_repository','install_governance','modify_governance','create_continuation_branch','push_continuation_branch','modify_application_behavior','modify_application_tests'].includes(permission))

function canonicalRemote(value) {
  return (value || '').trim().replace(/^git@github\.com:/,'https://github.com/').replace(/\.git$/,'').replace(/\/$/,'')
}

function remoteHead(branch) {
  const result = git(['ls-remote','--heads','origin',`refs/heads/${branch}`], { allowFailure:true })
  if (result.status !== 0) return { error: result.stderr || 'remote lease check failed' }
  return { sha: result.stdout.split(/\s+/)[0] || null }
}

export function runPreflight({ print = true, action = 'read-only' } = {}) {
  const errors = []
  const warnings = []
  const required = [
    'AGENTS.md','CLAUDE.md','START-HERE-DIVERGENCE.md',
    'docs/layer-system/AUTHORITY-MANIFEST.yml','docs/layer-system/SOURCE-CHECKPOINT.json',
    'docs/layer-system/CURRENT-LAYER-STATUS.md','docs/layer-system/PERMISSIONS.yml',
    'docs/layer-system/HANDOFF.md','docs/layer-system/HORIZONTAL-LAYER-COMPLETION-SYSTEM.md',
    'docs/layer-system/HYBRID-INDEPENDENT-AUDIT-PROTOCOL.md','AUDIT-RESULTS/2026-08-24-hybrid-reconciled.md',
    'docs/layer-system/LAYER-DEFINITIONS.yml','docs/layer-system/LAYER-OBLIGATION-PROFILES.yml',
    'docs/layer-system/PLATFORM-TRACKS.yml',
    'docs/layer-system/LAYER-OBLIGATION-MATRIX.csv','docs/layer-system/LAYER-COVERAGE-LEDGER.csv',
    'docs/layer-system/LAYER-EVIDENCE-INDEX.jsonl','docs/layer-system/BATCH-SCOPE.json',
    'docs/layer-system/COVERAGE-LOCK.json','docs/layer-system/AUDIT-GATE.json',
    'docs/layer-system/GOVERNANCE-BASELINE.json','docs/layer-system/PROTECTED-PATHS.yml',
    'docs/layer-system/PROTECTED-PATH-EXCEPTIONS.yml','docs/layer-system/LAYER-AUDIT-RECORD-SCHEMA.json',
    'docs/layer-system/UNSAFE-PATCH-RECORD-SCHEMA.json','docs/layer-system/RECOVERY.md'
  ]
  for (const file of required) if (!exists(file)) errors.push(`missing required file: ${file}`)
  if (!ACTION_TO_PERMISSION[action]) errors.push(`unknown requested action: ${action}`)

  const source = readJson('docs/layer-system/SOURCE-CHECKPOINT.json')
  const permissions = readJson('docs/layer-system/PERMISSIONS.yml')
  const manifest = readJson('docs/layer-system/AUTHORITY-MANIFEST.yml')
  const statusText = read('docs/layer-system/CURRENT-LAYER-STATUS.md')
  const batch = readJson('docs/layer-system/BATCH-SCOPE.json')
  const coverage = readJson('docs/layer-system/COVERAGE-LOCK.json')
  const audit = readJson('docs/layer-system/AUDIT-GATE.json')
  const baseline = readJson('docs/layer-system/GOVERNANCE-BASELINE.json')
  const platforms = readJson('docs/layer-system/PLATFORM-TRACKS.yml')
  const branch = git(['branch','--show-current'], { allowFailure: true }).stdout
  const head = git(['rev-parse','HEAD'], { allowFailure: true }).stdout
  const remote = git(['remote','get-url','origin'], { allowFailure: true }).stdout
  const permission = ACTION_TO_PERMISSION[action]

  if (source.repository !== 'thatoneweirdfella1/Claude-Project-02') errors.push('repository identity mismatch')
  if (branch !== source.continuation_branch) errors.push(`wrong branch: ${branch || '<none>'}`)
  if (canonicalRemote(remote) !== canonicalRemote(source.canonical_remote)) errors.push(`wrong or missing origin: ${remote || '<none>'}`)
  if (!/^[0-9a-f]{40}$/.test(head)) errors.push('runtime HEAD is not a full SHA')
  if (git(['merge-base','--is-ancestor',source.source_commit,'HEAD'], { allowFailure: true }).status !== 0) errors.push('source checkpoint is not an ancestor of HEAD')
  if (!permissions.grants?.[permission]?.allowed) errors.push(`requested action lacks permission: ${permission}`)

  for (const authority of manifest.authorities || []) {
    if (!exists(authority.canonical_path)) { errors.push(`manifest authority is missing: ${authority.canonical_path}`); continue }
    if (sha256(read(authority.canonical_path)) !== authority.content_sha256) errors.push(`manifest hash mismatch: ${authority.canonical_path}`)
  }
  for (const script of ['derive-registries.mjs','derive-obligations.mjs']) {
    const derive = spawnSync(process.execPath, [`scripts/governance/${script}`,'--check'], { cwd: new URL('../..', import.meta.url), encoding:'utf8' })
    if (derive.status !== 0) errors.push(`${script} failed: ${(derive.stderr || derive.stdout).trim()}`)
  }
  errors.push(...verifyLedger(), ...verifyEvidence(), ...verifyProtectedPaths({ action }))

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
  for (const [name, expected] of Object.entries(coverage.required_counts || {})) {
    const actual = manifest.denominators?.[name]?.verified_count
    if (actual !== expected) errors.push(`coverage lock count ${name}=${expected} differs from manifest ${actual}`)
  }
  for (const artifact of coverage.required_artifacts || []) if (!exists(artifact)) errors.push(`coverage-lock artifact is missing: ${artifact}`)
  if (audit.implementation_session_may_self_certify !== false) errors.push('audit gate permits implementation-session self-certification')
  if (coverage.application_permission_currently_granted !== Boolean(permissions.grants?.modify_application_behavior?.allowed)) errors.push('coverage lock and effective app-edit permission disagree')
  if (coverage.protected_governance_ref_currently_available !== Boolean(baseline.protected_ref)) errors.push('coverage lock and protected governance ref disagree')
  if ((platforms.web?.layers || []).join(',') !== 'L1,L2,L3,L4,L5,L6,L7') errors.push('web platform track does not declare exactly L1 through L7')
  if (!(platforms.desktop_windows?.seed_requirement_ids || []).includes('SPEC-DS-01')) errors.push('desktop platform track lost SPEC-DS-01')
  if (!(platforms.desktop_windows?.required_before_activation || []).length || !/DEFERRED/.test(platforms.desktop_windows?.status || '')) errors.push('desktop platform track is not safely deferred with activation requirements')
  if (!/WEB L7/.test(platforms.whole_application_completion || '') || !/DESKTOP\/WINDOWS/.test(platforms.whole_application_completion || '')) errors.push('whole-application completion does not require both web and desktop tracks')

  const allowlisted = new Set(read('docs/layer-system/TEMPLATE-MARKER-ALLOWLIST.txt').split(/\r?\n/).filter((line) => line && !line.startsWith('#')))
  const trackedResult = git(['ls-files'], { allowFailure: true })
  if (trackedResult.status !== 0) errors.push(`tracked-file scan unavailable: ${trackedResult.stderr || 'not a Git checkout'}`)
  for (const file of (trackedResult.stdout || '').split(/\r?\n/).filter(Boolean)) {
    if (allowlisted.has(file)) continue
    let body
    try { body = read(file) } catch { continue }
    if (body.includes('__REQUIRED_VALUE__')) errors.push(`unresolved template marker in ${file}`)
  }

  if (permissions.schema_version !== 2) errors.push('permissions schema is not v2')
  if (permissions.default !== 'deny') errors.push('permissions default is not deny')
  if (permissions.branch_scope !== source.continuation_branch) errors.push('permission branch scope differs from continuation branch')
  for (const name of EXTERNAL_EFFECT_PERMISSIONS) if (!Object.hasOwn(permissions.grants || {}, name)) errors.push(`missing explicit external-effect permission: ${name}`)
  if (!baseline.protected_ref) warnings.push(baseline.server_protection)
  const lastMatch = /\*\*Last completed horizontal layer:\*\* `?(L[1-7]|NONE)`?/.exec(statusText)
  const activeMatch = /\*\*Active layer:\*\* `?(L[1-7]|NONE)`?/.exec(statusText)
  const batchMatch = /\*\*Active coherent batch:\*\* `([^`]+)`/.exec(statusText)
  const next = /## Exact next action\s+([\s\S]*?)(?:\n##|$)/.exec(statusText)?.[1]?.trim().replace(/\s+/g,' ') || 'MISSING'
  if (!lastMatch) errors.push('last completed layer is missing or malformed')
  if (!activeMatch) errors.push('active layer is missing or malformed')
  if (!batchMatch) errors.push('active batch is missing or malformed')
  if (next === 'MISSING') errors.push('exact next action is missing')
  const last = lastMatch?.[1] || 'UNKNOWN'
  const active = activeMatch?.[1] || 'UNKNOWN'
  const activeBatch = batchMatch?.[1] || 'UNKNOWN'
  if ((batch.active_layer || 'NONE') !== active) errors.push('BATCH-SCOPE active layer differs from CURRENT-LAYER-STATUS')

  const appOrExternalAction = !GOVERNANCE_ACTIONS.includes(action)
  if (appOrExternalAction) {
    if (coverage.status !== 'PASS' || audit.post_correction_audit !== 'PASS' || audit.user_acceptance_of_independent_result !== 'ACCEPTED') errors.push('L0 coverage/audit/user-acceptance gate is not complete')
    if (!baseline.protected_ref) errors.push('app or external action is blocked until a protected governance ref exists')
    if (!/^L[1-7]$/.test(active) || batch.active_layer !== active || !batch.subsystem) errors.push('app action requires one exact active layer and coherent batch')
    if (!(batch.permanent_ids || []).length || !(batch.allowed_paths || []).length || !(batch.required_tests || []).length) errors.push('active app batch lacks IDs, paths, or required tests')
    const permanentIds = new Set(registryIds('docs/authority/PERMANENT-ID-REGISTRY.txt'))
    for (const id of batch.permanent_ids || []) if (!permanentIds.has(id)) errors.push(`BATCH-SCOPE contains unknown permanent ID: ${id}`)
    const protectedConfig = readJson('docs/layer-system/PROTECTED-PATHS.yml')
    for (const allowedPath of batch.allowed_paths || []) {
      if ((protectedConfig.source_protected || []).some((pattern) => pattern === allowedPath)) errors.push(`BATCH-SCOPE directly allows a source-protected pattern: ${allowedPath}`)
    }
    if (batch.entry_head !== head) errors.push('runtime HEAD differs from the batch entry lease')
    const lease = remoteHead(branch)
    if (lease.error) errors.push(lease.error)
    else if (lease.sha !== batch.start_remote_head) errors.push(`remote branch moved from batch lease ${batch.start_remote_head || '<none>'} to ${lease.sha || '<none>'}`)
    if (/^[0-9a-f]{40}$/.test(batch.entry_head || '')) {
      const changed = git(['diff','--name-only',batch.entry_head,'HEAD'], { allowFailure:true })
      if (changed.status !== 0) errors.push('cannot evaluate changed files against BATCH-SCOPE')
      else for (const path of changed.stdout.split(/\r?\n/).filter(Boolean)) if (!matchesAnyGlob(path,batch.allowed_paths || [])) errors.push(`changed file is outside BATCH-SCOPE: ${path}`)
    }
  }

  const effective = Object.entries(permissions.grants || {}).filter(([,value]) => value.allowed).map(([name]) => name)
  const certificate = [
    'RESUME CERTIFICATE',
    `Requested action: ${action}`,
    `Repository: ${source.repository}`,
    `Remote: ${remote || '<none>'}`,
    `Branch: ${branch || '<none>'}`,
    `Runtime HEAD: ${head || '<none>'}`,
    `Verified source checkpoint: ${source.source_commit}`,
    `Governance baseline ref/SHA: ${baseline.protected_ref || 'UNPROTECTED'} / ${baseline.baseline_commit}`,
    `Last completed layer: ${last}`,
    `Active layer: ${active}`,
    `Active batch: ${activeBatch}`,
    `Exact next action: ${next}`,
    `Effective permissions: ${effective.join(', ') || 'NONE'}`,
    `Structural preflight: ${errors.length ? 'FAIL' : 'PASS'}`,
    `Blocking findings: ${errors.length ? errors.join(' | ') : 'NONE'}`
  ].join('\n')
  if (print) {
    console.log(certificate)
    for (const warning of warnings) console.warn(`WARNING: ${warning}`)
  }
  return { ok: errors.length === 0, errors, warnings, certificate }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const actionArg = process.argv.find((value) => value.startsWith('--action='))
  const modeArg = process.argv.find((value) => value.startsWith('--mode='))
  const action = actionArg?.split('=')[1] || modeArg?.split('=')[1] || 'read-only'
  const result = runPreflight({ action })
  if (!result.ok) process.exit(1)
}
