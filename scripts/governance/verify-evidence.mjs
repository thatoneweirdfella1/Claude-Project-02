import { read, registryIds, printResult } from './lib.mjs'

export function verifyEvidence() {
  const errors = []
  const permanent = new Set(registryIds('docs/authority/PERMANENT-ID-REGISTRY.txt'))
  const lines = read('docs/layer-system/LAYER-EVIDENCE-INDEX.jsonl').split(/\r?\n/).filter(Boolean)
  const keys = new Set()
  for (let index = 0; index < lines.length; index += 1) {
    let record
    try { record = JSON.parse(lines[index]) }
    catch { errors.push(`evidence line ${index + 1} is not valid JSON`); continue }
    if (!permanent.has(record.permanent_id)) errors.push(`evidence line ${index + 1} uses unknown permanent ID`)
    if (!/^L[1-7]$/.test(record.layer || '')) errors.push(`evidence line ${index + 1} has invalid layer`)
    const key = `${record.permanent_id}|${record.layer}`
    if (keys.has(key)) errors.push(`duplicate evidence key ${key}`)
    keys.add(key)
    for (const field of ['authority_citations','implementation_paths','test_results','manual_or_live_results','artifact_paths','artifact_sha256']) {
      if (!Array.isArray(record[field])) errors.push(`${key} field ${field} must be an array`)
    }
    for (const field of ['implementation_commit','evidence_commit']) {
      if (!/^[0-9a-f]{40}$/.test(record[field] || '')) errors.push(`${key} field ${field} must be a full SHA`)
    }
    if (!record.actual_result || !record.auditor_result) errors.push(`${key} lacks actual/auditor result`)
  }
  return errors
}

if (import.meta.url === `file://${process.argv[1]}`) {
  if (!printResult('verify-evidence', verifyEvidence())) process.exit(1)
}
