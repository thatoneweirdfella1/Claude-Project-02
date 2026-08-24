import { git, readJson, printResult } from './lib.mjs'

export function verifyProtectedPaths() {
  const errors = []
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

  const tracked = new Set(git(['ls-files']).stdout.split(/\r?\n/))
  for (const secret of config.secret_patterns) {
    if (!secret.path.includes('*') && tracked.has(secret.path)) errors.push(`secret path is tracked: ${secret.path}`)
    if (secret.hash !== 'NOT_RECORDED_SECRET') errors.push(`secret pattern ${secret.path} records a forbidden hash`)
  }
  return errors
}

if (import.meta.url === `file://${process.argv[1]}`) {
  if (!printResult('verify-protected-paths', verifyProtectedPaths())) process.exit(1)
}
