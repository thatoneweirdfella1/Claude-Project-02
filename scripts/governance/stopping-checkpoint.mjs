import fs from 'node:fs'
import path from 'node:path'
import { at, git, sha256 } from './lib.mjs'
import { runPreflight } from './preflight.mjs'

function snapshotUnsafePatch(head) {
  const gitDir = git(['rev-parse','--git-dir']).stdout
  const stamp = new Date().toISOString().replaceAll(':','-')
  const checkpoint = path.resolve(at('.'), gitDir, 'divergence-checkpoints', stamp)
  fs.mkdirSync(checkpoint, { recursive:true })
  const patchText = git(['diff','--binary','HEAD'], { allowFailure:true }).stdout
  const patchPath = path.join(checkpoint,'tracked.patch')
  fs.writeFileSync(patchPath, patchText)
  const untracked = git(['ls-files','--others','--exclude-standard'], { allowFailure:true }).stdout.split(/\r?\n/).filter(Boolean)
  const binary = []
  for (const file of untracked) {
    const source = at(file)
    if (!fs.existsSync(source) || !fs.statSync(source).isFile()) continue
    const destination = path.join(checkpoint,'untracked',file)
    fs.mkdirSync(path.dirname(destination), { recursive:true })
    fs.copyFileSync(source,destination)
    if (fs.readFileSync(source).includes(0)) binary.push(file)
  }
  const record = {
    base_sha: head,
    observed_head_sha: head,
    paths: git(['diff','--name-only','HEAD'], { allowFailure:true }).stdout.split(/\r?\n/).filter(Boolean),
    untracked_paths: untracked,
    binary_paths: binary,
    patch_path: patchPath,
    patch_sha256: sha256(patchText),
    test_state: 'NOT RUN',
    safety_classification: 'UNSAFE UNCOMMITTED',
    exact_recovery_action: `Restore a checkout at ${head}, apply ${patchPath}, copy the saved untracked directory, then rerun the exact batch tests and preflight before committing.`
  }
  fs.writeFileSync(path.join(checkpoint,'UNSAFE-PATCH-RECORD.json'), `${JSON.stringify(record,null,2)}\n`)
  return checkpoint
}

const result = runPreflight({ action:'read-only' })
const dirty = git(['status','--porcelain'], { allowFailure: true }).stdout
const branch = git(['branch','--show-current'], { allowFailure:true }).stdout
const remote = git(['ls-remote','--heads','origin',`refs/heads/${branch}`], { allowFailure: true })
const remoteHead = remote.stdout.split(/\s+/)[0] || null
const head = git(['rev-parse','HEAD'], { allowFailure: true }).stdout

if (dirty) {
  const checkpoint = snapshotUnsafePatch(head)
  result.errors.push(`governed worktree is dirty; an UNSAFE recovery snapshot was written to ${checkpoint}, but it is not a verified handoff checkpoint`)
}
if (remote.status !== 0) result.errors.push(`remote lease could not be verified: ${remote.stderr || 'unknown error'}`)
else if (remoteHead !== head) result.errors.push(`remote continuation head ${remoteHead || '<none>'} differs from local HEAD ${head}`)

if (result.errors.length) {
  console.error('STOPPING CHECKPOINT: FATAL')
  for (const error of result.errors) console.error(`- ${error}`)
  process.exit(2)
}

console.log('STOPPING CHECKPOINT: SAFE')
console.log(`Committed HEAD: ${head}`)
console.log('Worktree: CLEAN')
console.log('Remote lease: MATCHED')
