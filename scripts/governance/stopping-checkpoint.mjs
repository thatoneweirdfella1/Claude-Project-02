import { git } from './lib.mjs'
import { runPreflight } from './preflight.mjs'

const result = runPreflight()
const dirty = git(['status','--porcelain'], { allowFailure: true }).stdout
const remote = git(['rev-parse','--verify','origin/horizontal-layer-completion-v1'], { allowFailure: true })
const head = git(['rev-parse','HEAD'], { allowFailure: true }).stdout

if (dirty) result.errors.push(`governed worktree is not clean: ${dirty.replace(/\n/g, ', ')}`)
if (remote.status === 0 && remote.stdout !== head) result.errors.push(`remote continuation head ${remote.stdout} differs from local HEAD ${head}`)

if (result.errors.length) {
  console.error('STOPPING CHECKPOINT: FATAL')
  for (const error of result.errors) console.error(`- ${error}`)
  process.exit(2)
}

console.log('STOPPING CHECKPOINT: SAFE')
console.log(`Committed HEAD: ${head}`)
console.log('Worktree: CLEAN')
console.log(remote.status === 0 ? 'Remote lease: MATCHED' : 'Remote lease: NOT AVAILABLE — verify before push')
