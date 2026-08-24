import { parseCsv, read, readJson, registryIds, printResult } from './lib.mjs'

export function verifyEvidence() {
  const errors = []
  const permanent = new Set(registryIds('docs/authority/PERMANENT-ID-REGISTRY.txt'))
  const tests = new Set(registryIds('docs/authority/ACCEPTANCE-TEST-ID-REGISTRY.txt'))
  const workflows = new Set(registryIds('docs/authority/WORKFLOW-ID-REGISTRY.txt'))
  const definitions = readJson('docs/layer-system/LAYER-DEFINITIONS.yml')
  const requiredEvidence = new Map((definitions.layers || []).map((layer) => [layer.id, new Set(layer.required_evidence || [])]))
  const ledgerRows = parseCsv(read('docs/layer-system/LAYER-COVERAGE-LEDGER.csv'))
  const ledgerHeader = ledgerRows[0] || []
  const ledger = ledgerRows.slice(1).filter((row) => row.some(Boolean))
  const lines = read('docs/layer-system/LAYER-EVIDENCE-INDEX.jsonl').split(/\r?\n/).filter(Boolean)
  const keys = new Set()
  const records = new Map()
  for (let index = 0; index < lines.length; index += 1) {
    let record
    try { record = JSON.parse(lines[index]) }
    catch { errors.push(`evidence line ${index + 1} is not valid JSON`); continue }
    if (!permanent.has(record.permanent_id)) errors.push(`evidence line ${index + 1} uses unknown permanent ID`)
    if (!/^L[1-7]$/.test(record.layer || '')) errors.push(`evidence line ${index + 1} has invalid layer`)
    const key = `${record.permanent_id}|${record.layer}`
    if (keys.has(key)) errors.push(`duplicate evidence key ${key}`)
    keys.add(key)
    records.set(key, record)
    for (const field of ['authority_citations','implementation_paths','evidence_types','test_results','workflow_results','manual_or_live_results','artifact_paths','artifact_sha256']) {
      if (!Array.isArray(record[field])) errors.push(`${key} field ${field} must be an array`)
    }
    for (const field of ['implementation_commit','evidence_commit']) {
      if (!/^[0-9a-f]{40}$/.test(record[field] || '')) errors.push(`${key} field ${field} must be a full SHA`)
    }
    if (!record.actual_result || !record.auditor_result) errors.push(`${key} lacks actual/auditor result`)
    for (const digest of record.artifact_sha256 || []) {
      if (!/^[0-9a-f]{64}$/.test(digest)) errors.push(`${key} has an invalid artifact SHA-256`)
    }
    for (const result of record.test_results || []) {
      for (const field of definitions.test_result_contract?.required_fields || []) {
        if (result[field] === undefined) errors.push(`${key} test result lacks ${field}`)
      }
      if (!tests.has(result.test_id)) errors.push(`${key} test result uses unknown test ID ${result.test_id}`)
      if (result.layer !== record.layer) errors.push(`${key} test result claims a different layer`)
      if (!Array.isArray(result.assertions) || !result.assertions.length) errors.push(`${key} test result requires named layer assertions`)
      if (!(definitions.test_result_contract?.result_values || []).includes(result.result)) errors.push(`${key} test result has invalid verdict ${result.result}`)
    }
    for (const result of record.workflow_results || []) {
      if (!workflows.has(result.workflow_id)) errors.push(`${key} workflow result uses unknown workflow ID ${result.workflow_id}`)
      if (result.layer !== record.layer) errors.push(`${key} workflow result claims a different layer`)
      if (!Array.isArray(result.assertions) || !result.assertions.length) errors.push(`${key} workflow result requires named layer assertions`)
      if (!['PASS','FAIL','BLOCKED'].includes(result.result)) errors.push(`${key} workflow result has invalid verdict ${result.result}`)
    }
  }
  for (const row of ledger) {
    const permanentId = row[ledgerHeader.indexOf('permanent_id')]
    for (const layer of definitions.layers || []) {
      if (row[ledgerHeader.indexOf(layer.id)] !== 'PROVEN') continue
      const key = `${permanentId}|${layer.id}`
      const record = records.get(key)
      if (!record) { errors.push(`${key} is PROVEN in the ledger without an evidence record`); continue }
      if (record.auditor_result !== 'PROVEN') errors.push(`${key} is PROVEN in the ledger without an independent PROVEN verdict`)
      const types = new Set(record.evidence_types || [])
      for (const type of requiredEvidence.get(layer.id) || []) {
        if (!types.has(type)) errors.push(`${key} lacks required evidence type ${type}`)
      }
      if ([...(requiredEvidence.get(layer.id) || [])].some((type) => /deployment_identity/.test(type))) {
        const identity = record.deployment_identity
        if (!identity || !identity.url || !/^[0-9a-f]{40}$/.test(identity.commit_sha || '')) errors.push(`${key} lacks matching deployment URL and full commit identity`)
      }
    }
  }
  return errors
}

if (import.meta.url === `file://${process.argv[1]}`) {
  if (!printResult('verify-evidence', verifyEvidence())) process.exit(1)
}
