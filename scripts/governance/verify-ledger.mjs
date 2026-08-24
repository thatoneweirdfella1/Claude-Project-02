import { parseCsv, read, registryIds, sameSet, validStatus, printResult } from './lib.mjs'

export function verifyLedger() {
  const errors = []
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
  for (const row of data) {
    if (row.length !== expectedHeader.length) errors.push(`${row[0] || '<blank>'} has ${row.length} columns`)
    for (let index = 6; index <= 12; index += 1) {
      if (!validStatus(row[index] || '')) errors.push(`${row[0]} has invalid ${expectedHeader[index]} status: ${row[index]}`)
    }
  }
  return errors
}

if (import.meta.url === `file://${process.argv[1]}`) {
  if (!printResult('verify-ledger', verifyLedger())) process.exit(1)
}
