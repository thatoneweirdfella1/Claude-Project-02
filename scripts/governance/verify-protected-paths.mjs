import { git, matchesAnyGlob, readJson, printResult } from './lib.mjs'

function lines(value) {
  return (value || '').split(/\r?\n/).filter(Boolean)
}

function exactException(path, base, exceptions, errors) {
  const match = (exceptions.exceptions || []).find((entry) => entry.path === path)
  if (!match) return false
  const oldBlob = git(['rev-parse',`${base}:${path}`], { allowFailure:true }).stdout
  const newBlob = git(['rev-parse',`HEAD:${path}`], { allowFailure:true }).stdout
  if (oldBlob !== match.old_blob_sha || newBlob !== match.new_blob_sha) errors.push(`protected-path exception blob mismatch: ${path}`)
  if (!Array.isArray(match.affected_permanent_ids) || !match.affected_permanent_ids.length) errors.push(`protected-path exception lacks affected IDs: ${path}`)
  if (!match.authorization_date || !match.user_attestation || !/^[0-9a-f]{40}$/.test(match.expires_after_commit || '')) errors.push(`protected-path exception is incomplete: ${path}`)
  if (git(['merge-base','--is-ancestor',match.expires_after_commit,'HEAD'], { allowFailure:true }).status === 0 && match.expires_after_commit !== git(['rev-parse','HEAD']).stdout) errors.push(`protected-path exception expired after ${match.expires_after_commit}: ${path}`)
  return true
}

export function verifyProtectedPaths({ action = 'read-only' } = {}) {
  const errors = []
  const checkout = git(['rev-parse','--is-inside-work-tree'], { allowFailure: true })
  if (checkout.status !== 0 || checkout.stdout !== 'true') return ['protected-path verification requires a real Git checkout']
  const config = readJson('docs/layer-system/PROTECTED-PATHS.yml')
  const workingBaseline = readJson(config.governance_baseline_file)
  const exceptions = readJson('docs/layer-system/PROTECTED-PATH-EXCEPTIONS.yml')
  const protectedRef = workingBaseline.protected_ref
  let trustedBaseline = workingBaseline
  if (protectedRef) {
    const refCheck = git(['rev-parse','--verify',protectedRef], { allowFailure:true })
    if (refCheck.status !== 0) errors.push(`protected governance ref is unavailable: ${protectedRef}`)
    else {
      const shown = git(['show',`${protectedRef}:${config.governance_baseline_file}`], { allowFailure:true })
      if (shown.status !== 0) errors.push('protected governance ref does not contain the baseline file')
      else {
        try { trustedBaseline = JSON.parse(shown.stdout) }
        catch { errors.push('protected governance ref contains an invalid baseline file') }
      }
    }
  }
  const baselineCommit = trustedBaseline.baseline_commit
  if (!/^[0-9a-f]{40}$/.test(baselineCommit || '')) errors.push('governance baseline commit is not set')

  const sourceDiff = git(['diff','--name-only',config.source_checkpoint,'HEAD','--',...config.source_protected], { allowFailure: true })
  if (sourceDiff.status !== 0) errors.push(`source protected-path comparison failed: ${sourceDiff.stderr}`)
  else for (const path of lines(sourceDiff.stdout)) if (!exactException(path, config.source_checkpoint, exceptions, errors)) errors.push(`source-protected path changed without an exact exception: ${path}`)

  if (/^[0-9a-f]{40}$/.test(baselineCommit || '')) {
    const allDiff = git(['diff','--name-only',baselineCommit,'HEAD'], { allowFailure: true })
    if (allDiff.status !== 0) errors.push(`baseline comparison failed: ${allDiff.stderr}`)
    else {
      const changed = lines(allDiff.stdout)
      const governanceChanged = changed.filter((path) => matchesAnyGlob(path, config.governance_protected || []))
      if (protectedRef && governanceChanged.length && !['install_governance','modify_governance'].includes(action)) errors.push(`governance-protected paths changed: ${governanceChanged.join(', ')}`)
      const safetyChanged = changed.filter((path) => matchesAnyGlob(path, config.safety_critical_source || []) && !matchesAnyGlob(path, config.governance_protected || []))
      if (safetyChanged.length) {
        const batch = readJson('docs/layer-system/BATCH-SCOPE.json')
        if (batch.active_layer === 'NONE') errors.push(`safety-critical source changed without an active batch: ${safetyChanged.join(', ')}`)
        for (const path of safetyChanged) if (!matchesAnyGlob(path, batch.allowed_paths || [])) errors.push(`safety-critical path is outside BATCH-SCOPE: ${path}`)
      }
    }
  }

  const trackedResult = git(['ls-files'], { allowFailure: true })
  if (trackedResult.status !== 0) errors.push(`tracked-file inspection failed: ${trackedResult.stderr || 'not a Git checkout'}`)
  const tracked = lines(trackedResult.stdout)
  for (const secret of config.secret_patterns || []) {
    for (const path of tracked.filter((file) => matchesAnyGlob(file, [secret.path]))) errors.push(`secret-pattern path is tracked: ${path}`)
    if (secret.hash !== 'NOT_RECORDED_SECRET') errors.push(`secret pattern ${secret.path} records a forbidden hash`)
  }
  return errors
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const action = process.argv.find((value) => value.startsWith('--action='))?.split('=')[1] || 'read-only'
  if (!printResult('verify-protected-paths', verifyProtectedPaths({ action }))) process.exit(1)
}
