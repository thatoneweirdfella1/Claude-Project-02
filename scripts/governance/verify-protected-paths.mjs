import { git, readJson, printResult } from './lib.mjs'

function escapeRegex(text) {
  return text.replace(/[.+^${}()|[\]\\]/g, '\\$&')
}

function globToRegex(glob) {
  const marker = '__DOUBLE_STAR__'
  const normalized = glob.replace(/\\/g, '/').replace(/\*\*/g, marker)
  const escaped = escapeRegex(normalized)
    .replace(/\*/g, '[^/]*')
    .replace(new RegExp(marker, 'g'), '.*')
  return new RegExp(`^${escaped}$`)
}

export function verifyProtectedPaths() {
  const errors = []
  const checkout = git(['rev-parse','--is-inside-work-tree'], { allowFailure: true })
  if (checkout.status !== 0 || checkout.stdout !== 'true') return ['protected-path verification requires a real Git checkout']
  const config = readJson('docs/layer-system/PROTECTED-PATHS.yml')
  const baseline = readJson(config.governance_baseline_file)
  if (!/^[0-9a-f]{40}$/.test(baseline.baseline_commit || '')) errors.push('governance baseline commit is not set')

  const sourceDiff = git(['diff','--name-only',config.source_checkpoint,'--',...config.source_protected], { allowFailure: true })
  if (sourceDiff.status !== 0) errors.push(`source protected-path comparison failed: ${sourceDiff.stderr}`)
  else if (sourceDiff.stdout) errors.push(`source-protected paths changed: ${sourceDiff.stdout.replace(/\n/g, ', ')}`)

  if (/^[0-9a-f]{40}$/.test(baseline.baseline_commit || '')) {
    const governanceDiff = git(['diff','--name-only',baseline.baseline_commit,'--',...config.governance_protected], { allowFailure: true })
    if (governanceDiff.status !== 0) errors.push(`governance baseline comparison failed: ${governanceDiff.stderr}`)
    else if (governanceDiff.stdout) errors.push(`governance-protected paths changed: ${governanceDiff.stdout.replace(/\n/g, ', ')}`)
  }

  const trackedResult = git(['ls-files'], { allowFailure: true })
  if (trackedResult.status !== 0) errors.push(`tracked-file inspection failed: ${trackedResult.stderr || 'not a Git checkout'}`)
  const tracked = (trackedResult.stdout || '').split(/\r?\n/).filter(Boolean).map(p => p.replace(/\\/g, '/'))
  for (const pattern of config.secret_patterns) {
    const matcher = globToRegex(pattern.path)
    for (const trackedPath of tracked) {
      if (matcher.test(trackedPath)) errors.push(`restricted path is tracked: ${trackedPath}`)
    }
    if (pattern.hash !== 'NOT_RECORDED_SECRET') errors.push(`restricted pattern ${pattern.path} records a forbidden hash`)
  }
  return errors
}

if (import.meta.url === `file://${process.argv[1]}`) {
  if (!printResult('verify-protected-paths', verifyProtectedPaths())) process.exit(1)
}
