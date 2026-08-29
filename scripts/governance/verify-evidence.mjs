import fs from 'node:fs'
import { at, exists, git, parseCsv, read, readJson, registryIds, sha256, uniqueSorted, printResult } from './lib.mjs'

function split(value) {
  return (value || '').split(';').filter(Boolean)
}

export function verifyEvidence() {
  const errors = []
  const permanent = new Set(registryIds('docs/authority/PERMANENT-ID-REGISTRY.txt'))
  const tests = new Set(registryIds('docs/authority/ACCEPTANCE-TEST-ID-REGISTRY.txt'))
  const workflows = new Set(registryIds('docs/authority/WORKFLOW-ID-REGISTRY.txt'))
  const definitions = readJson('docs/layer-system/LAYER-DEFINITIONS.yml')
  const matrixRows = parseCsv(read(definitions.resolved_obligation_matrix))
  const matrixHeader = matrixRows[0] || []
  const matrix = new Map(matrixRows.slice(1).filter((row) => row.some(Boolean)).map((row) => [row[0], row]))
  function obligation(id, layer) {
    const row = matrix.get(id)
    if (!row) return null
    return {
      authority: row[matrixHeader.indexOf('authority_citation')],
      code: row[matrixHeader.indexOf(`${layer}_code`)],
      status: row[matrixHeader.indexOf(`${layer}_status`)],
      assertion: row[matrixHeader.indexOf(`${layer}_obligation`)],
      evidenceTypes: split(row[matrixHeader.indexOf(`${layer}_evidence_types`)])
    }
  }
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
    const resolved = obligation(record.permanent_id, record.layer)
    if (!resolved) errors.push(`${key} has no resolved obligation`)
    else {
      if (record.obligation_code !== resolved.code) errors.push(`${key} obligation code differs from the resolved matrix`)
      if (!Array.isArray(record.obligation_assertions) || !record.obligation_assertions.includes(resolved.assertion)) errors.push(`${key} does not assert the exact resolved obligation`)
      if (!Array.isArray(record.authority_citations) || !record.authority_citations.includes(resolved.authority)) errors.push(`${key} lacks its exact authority citation`)
    }
    for (const field of ['authority_citations','implementation_paths','obligation_assertions','evidence_types','test_results','workflow_results','manual_or_live_results','artifact_paths','artifact_sha256']) {
      if (!Array.isArray(record[field])) errors.push(`${key} field ${field} must be an array`)
    }
    for (const field of ['implementation_commit','evidence_commit']) {
      if (!/^[0-9a-f]{40}$/.test(record[field] || '')) errors.push(`${key} field ${field} must be a full SHA`)
    }
    if (!record.implementation_session_id) errors.push(`${key} lacks an implementation session ID`)
    if (!record.actual_result || !record.auditor_result) errors.push(`${key} lacks actual/auditor result`)
    if ((record.artifact_paths || []).length !== (record.artifact_sha256 || []).length) errors.push(`${key} artifact paths and hashes are not one-to-one`)
    for (const digest of record.artifact_sha256 || []) {
      if (!/^[0-9a-f]{64}$/.test(digest)) errors.push(`${key} has an invalid artifact SHA-256`)
    }
    for (const result of record.test_results || []) {
      for (const field of definitions.test_result_contract?.required_fields || []) {
        if (result[field] === undefined) errors.push(`${key} test result lacks ${field}`)
      }
      if (!tests.has(result.test_id)) errors.push(`${key} test result uses unknown test ID ${result.test_id}`)
      if (result.layer !== record.layer) errors.push(`${key} test result claims a different layer`)
      if (!Array.isArray(result.obligation_codes) || !result.obligation_codes.includes(record.obligation_code)) errors.push(`${key} test result does not name its obligation code`)
      if (!Array.isArray(result.assertions) || !result.assertions.includes(resolved?.assertion)) errors.push(`${key} test result lacks the exact resolved assertion`)
      if (!Array.isArray(result.artifact_paths) || !result.artifact_paths.length) errors.push(`${key} test result lacks artifacts`)
      if (!(definitions.test_result_contract?.result_values || []).includes(result.result)) errors.push(`${key} test result has invalid verdict ${result.result}`)
    }
    for (const result of record.workflow_results || []) {
      if (!workflows.has(result.workflow_id)) errors.push(`${key} workflow result uses unknown workflow ID ${result.workflow_id}`)
      if (result.layer !== record.layer) errors.push(`${key} workflow result claims a different layer`)
      if (!Array.isArray(result.obligation_codes) || !result.obligation_codes.includes(record.obligation_code)) errors.push(`${key} workflow result does not name its obligation code`)
      if (!Array.isArray(result.assertions) || !result.assertions.includes(resolved?.assertion)) errors.push(`${key} workflow result lacks the exact resolved assertion`)
      if (!Array.isArray(result.artifact_paths) || !result.artifact_paths.length) errors.push(`${key} workflow result lacks artifacts`)
      if (!['PASS','FAIL','BLOCKED'].includes(result.result)) errors.push(`${key} workflow result has invalid verdict ${result.result}`)
    }
  }
  for (const row of ledger) {
    const permanentId = row[ledgerHeader.indexOf('permanent_id')]
    for (const layer of definitions.layers || []) {
      if (row[ledgerHeader.indexOf(layer.id)] !== 'PROVEN') continue
      const key = `${permanentId}|${layer.id}`
      const record = records.get(key)
      const resolved = obligation(permanentId, layer.id)
      if (resolved?.status !== 'APPLICABLE') errors.push(`${key} cannot be PROVEN because the resolved matrix marks it N/A`)
      if (!record) { errors.push(`${key} is PROVEN in the ledger without an evidence record`); continue }
      if (record.auditor_result !== 'PROVEN') errors.push(`${key} is PROVEN without a PROVEN audit verdict`)
      const allResults = [...(record.test_results || []), ...(record.workflow_results || [])]
      if (!allResults.some((result) => result.result === 'PASS') && !(record.manual_or_live_results || []).some((result) => result.result === 'PASS')) errors.push(`${key} has no passing proof result`)
      if (allResults.some((result) => result.result !== 'PASS') || (record.manual_or_live_results || []).some((result) => result.result && result.result !== 'PASS')) errors.push(`${key} contains failed or blocked evidence`)
      const types = new Set(record.evidence_types || [])
      for (const type of resolved?.evidenceTypes || []) if (!types.has(type)) errors.push(`${key} lacks required evidence type ${type}`)
      if (!(record.artifact_paths || []).length) errors.push(`${key} has no hashed evidence artifact`)
      for (let index = 0; index < (record.artifact_paths || []).length; index += 1) {
        const path = record.artifact_paths[index]
        if (!exists(path)) errors.push(`${key} evidence artifact does not exist: ${path}`)
        else if (sha256(fs.readFileSync(at(path))) !== record.artifact_sha256[index]) errors.push(`${key} evidence artifact hash mismatch: ${path}`)
      }
      for (const commit of [record.implementation_commit, record.evidence_commit]) {
        if (git(['merge-base','--is-ancestor',commit,'HEAD'], { allowFailure:true }).status !== 0) errors.push(`${key} evidence commit is not an ancestor of HEAD: ${commit}`)
      }
      const stale = git(['diff','--name-only',record.evidence_commit,'HEAD','--',...(record.implementation_paths || [])], { allowFailure:true })
      if (stale.status !== 0) errors.push(`${key} implementation-path staleness check failed`)
      else if (stale.stdout) errors.push(`${key} implementation paths changed after evidence: ${stale.stdout.replace(/\n/g, ', ')}`)
      if ((resolved?.evidenceTypes || []).some((type) => /deployment_identity/.test(type))) {
        const identity = record.deployment_identity
        if (!identity || !identity.url || identity.commit_sha !== record.evidence_commit) errors.push(`${key} lacks a deployment identity matching the evidence commit`)
      }
      if (!/^docs\/layer-system\/AUDIT-RESULTS\/.+\.json$/.test(record.audit_record_path || '')) errors.push(`${key} audit record path is outside the governed JSON audit directory`)
      else if (!exists(record.audit_record_path)) errors.push(`${key} audit record does not exist`)
      else {
        const auditText = read(record.audit_record_path)
        if (sha256(auditText) !== record.audit_record_sha256) errors.push(`${key} audit record hash mismatch`)
        try {
          const audit = JSON.parse(auditText)
          if (audit.audited_commit !== record.evidence_commit || audit.layer !== record.layer) errors.push(`${key} audit record targets a different commit or layer`)
          if (audit.verdict !== 'PASS' || audit.user_acceptance !== 'ACCEPTED') errors.push(`${key} audit record is not an accepted PASS`)
          if (!audit.report_path || !exists(audit.report_path)) errors.push(`${key} independent audit report is missing`)
          else if (sha256(fs.readFileSync(at(audit.report_path))) !== audit.report_sha256) errors.push(`${key} independent audit report hash mismatch`)
          if (audit.implementation_session_id !== record.implementation_session_id) errors.push(`${key} audit record names a different implementation session`)
          if (!audit.independent_from_implementation_session || audit.auditor?.session_reference === record.implementation_session_id) errors.push(`${key} audit is not independent from implementation`)
          if (!audit.auditor?.session_export_path || !exists(audit.auditor.session_export_path)) errors.push(`${key} audit session export is missing`)
          else if (sha256(fs.readFileSync(at(audit.auditor.session_export_path))) !== audit.auditor.session_export_sha256) errors.push(`${key} audit session export hash mismatch`)
          const applicableIds = uniqueSorted([...matrix.entries()].filter(([,matrixRow]) => matrixRow[matrixHeader.indexOf(`${record.layer}_status`)] === 'APPLICABLE').map(([id]) => id))
          const applicableHash = sha256(`${applicableIds.join('\n')}\n`)
          if (audit.applicable_permanent_ids_sha256 !== applicableHash) errors.push(`${key} audit record applicable-ID set hash differs from the resolved matrix`)
        } catch { errors.push(`${key} audit record is not valid JSON`) }
      }
    }
  }
  return errors
}

if (import.meta.url === `file://${process.argv[1]}`) {
  if (!printResult('verify-evidence', verifyEvidence())) process.exit(1)
}
