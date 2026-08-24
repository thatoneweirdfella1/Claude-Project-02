import { parseCsv, read, readJson, registryIds, sameSet, validStatus, printResult } from './lib.mjs'
import { verifyObligationMatrix } from './derive-obligations.mjs'

const REFERENCE_COLUMNS = {
  repair_ids: 'docs/authority/REPAIR-ID-REGISTRY.txt',
  decision_ids: 'docs/authority/DECISION-ID-REGISTRY.txt',
  workflow_ids: 'docs/authority/WORKFLOW-ID-REGISTRY.txt',
  test_ids: 'docs/authority/ACCEPTANCE-TEST-ID-REGISTRY.txt'
}

function splitIds(value) {
  return (value || '').split(';').filter(Boolean)
}

export function verifyLedger() {
  const errors = [...verifyObligationMatrix()]
  let rows
  try { rows = parseCsv(read('docs/layer-system/LAYER-COVERAGE-LEDGER.csv')) }
  catch (error) { return [String(error.message || error)] }
  const header = rows[0] || []
  const expectedHeader = ['permanent_id','authority_citation','repair_ids','decision_ids','workflow_ids','test_ids','L1','L2','L3','L4','L5','L6','L7','last_verified_commit']
  if (header.join('|') !== expectedHeader.join('|')) errors.push('ledger header is not canonical')
  const data = rows.slice(1).filter((row) => row.some(Boolean))
  const ids = data.map((row) => row[0])
  if (!sameSet(ids, registryIds('docs/authority/PERMANENT-ID-REGISTRY.txt'))) errors.push('ledger permanent ID set differs from registry')
  if (new Set(ids).size !== ids.length) errors.push('ledger contains duplicate permanent IDs')
  const definitions = readJson('docs/layer-system/LAYER-DEFINITIONS.yml')
  const layers = definitions.layers || []
  const layerIds = layers.map((layer) => layer.id)
  if (!sameSet(layerIds, ['L1','L2','L3','L4','L5','L6','L7'])) errors.push('layer definitions do not contain exactly L1 through L7')
  let obligationRows = []
  try { obligationRows = parseCsv(read(definitions.resolved_obligation_matrix)) }
  catch (error) { errors.push(`cannot read resolved obligation matrix: ${error.message}`) }
  const obligationHeader = obligationRows[0] || []
  const obligations = new Map(obligationRows.slice(1).filter((row) => row.some(Boolean)).map((row) => [row[0], row]))
  if (!sameSet([...obligations.keys()], registryIds('docs/authority/PERMANENT-ID-REGISTRY.txt'))) errors.push('resolved obligation matrix permanent ID set differs from registry')
  function matrixCell(id, layer) {
    const row = obligations.get(id)
    if (!row) return null
    const status = row[obligationHeader.indexOf(`${layer}_status`)]
    const assertion = row[obligationHeader.indexOf(`${layer}_obligation`)]
    const code = row[obligationHeader.indexOf(`${layer}_code`)]
    return { status, assertion, code, exactNa: status === 'N/A' ? `N/A AT THIS DEPTH — ${assertion}` : null }
  }
  const unresolved = read('docs/layer-system/LAYER-DECISION-BLOCKERS.md')
  const blockers = [...(definitions.decision_blockers || []), ...(definitions.project_task_blockers || [])]
  const registries = Object.fromEntries(Object.entries(REFERENCE_COLUMNS).map(([column, file]) => [column, new Set(registryIds(file))]))
  const used = Object.fromEntries(Object.keys(REFERENCE_COLUMNS).map((column) => [column, new Set()]))
  for (const row of data) {
    if (row.length !== expectedHeader.length) errors.push(`${row[0] || '<blank>'} has ${row.length} columns`)
    for (const column of Object.keys(REFERENCE_COLUMNS)) {
      const columnIndex = header.indexOf(column)
      for (const reference of splitIds(row[columnIndex])) {
        used[column].add(reference)
        if (!registries[column].has(reference)) errors.push(`${row[0]} ${column} contains unknown ID ${reference}`)
      }
    }
    for (let index = 6; index <= 12; index += 1) {
      const layer = expectedHeader[index]
      const status = row[index] || ''
      if (!validStatus(status)) errors.push(`${row[0]} has invalid ${layer} status: ${status}`)
      if (status.startsWith('N/A AT THIS DEPTH — ')) {
        const exact = matrixCell(row[0], layer)?.exactNa
        if (!exact || status !== exact) errors.push(`${row[0]} has an unapproved or inexact ${layer} N/A clause`)
      }
      if (matrixCell(row[0], layer)?.status === 'APPLICABLE' && status.startsWith('N/A AT THIS DEPTH — ')) errors.push(`${row[0]} is applicable at ${layer} and cannot be N/A`)
      if (status === 'PROVEN') {
        for (const blocker of blockers.filter((entry) => entry.affected_ids?.includes(row[0]) && entry.blocks_from)) {
          const blockedFrom = Number(blocker.blocks_from.slice(1))
          const currentLayer = Number(layer.slice(1))
          const blockerLine = unresolved.split(/\r?\n/).find((line) => line.includes(blocker.id)) || ''
          if (currentLayer >= blockedFrom && /UNRESOLVED|\bOPEN\b/.test(blockerLine)) {
            errors.push(`${row[0]} cannot be PROVEN at ${layer} while ${blocker.id} remains unresolved`)
          }
        }
      }
    }
  }
  for (const column of Object.keys(REFERENCE_COLUMNS)) {
    for (const id of registries[column]) {
      if (!used[column].has(id)) errors.push(`${column} registry ID ${id} is not mapped to any ledger row`)
    }
  }
  const completedMatch = read('docs/layer-system/CURRENT-LAYER-STATUS.md').match(/Last completed horizontal layer:\*\* `?(L[1-7]|NONE)`?/)
  const completed = completedMatch?.[1] || 'NONE'
  if (completed !== 'NONE') {
    const last = Number(completed.slice(1))
    for (const row of data) {
      for (let layerNumber = 1; layerNumber <= last; layerNumber += 1) {
        const status = row[5 + layerNumber]
        const layer = `L${layerNumber}`
        const exactNa = matrixCell(row[0], layer)?.exactNa
        if (status !== 'PROVEN' && status !== exactNa) errors.push(`${row[0]} does not satisfy claimed completed layer ${layer}`)
      }
    }
  }
  return errors
}

if (import.meta.url === `file://${process.argv[1]}`) {
  if (!printResult('verify-ledger', verifyLedger())) process.exit(1)
}
