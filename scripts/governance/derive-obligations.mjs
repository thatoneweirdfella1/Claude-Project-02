import fs from 'node:fs'
import { at, read, readJson, registryIds, sameSet, uniqueSorted, printResult } from './lib.mjs'

const PROFILE_PATH = 'docs/layer-system/LAYER-OBLIGATION-PROFILES.yml'
const MATRIX_PATH = 'docs/layer-system/LAYER-OBLIGATION-MATRIX.csv'
const CONTROL_MAP = 'docs/authority/DIVERGENCE-AI-CONTROL-BEHAVIOR-MAP-v2.md'
const LAYERS = ['L1','L2','L3','L4','L5','L6','L7']

function csv(value) {
  const text = String(value ?? '')
  return /[",\n]/.test(text) ? `"${text.replaceAll('"','""')}"` : text
}

function controlRows() {
  const rows = new Map()
  for (const line of read(CONTROL_MAP).split(/\r?\n/)) {
    if (!line.startsWith('|')) continue
    const cells = line.split('|').slice(1,-1).map((cell) => cell.trim())
    if (/^(?:ADV|KB|ROUTE|SPEC|SRC|USR)-/.test(cells[0] || '')) {
      rows.set(cells[0], { name: cells[1] || '', approved_behavior: cells[2] || '' })
    }
  }
  return rows
}

function assignedProfile(id, config) {
  const matches = []
  for (const rule of config.assignment_rules || []) {
    if ((rule.exclude_ids || []).includes(id)) continue
    if ((rule.ids || []).includes(id) || (rule.prefixes || []).some((prefix) => id.startsWith(prefix))) matches.push(rule.profile)
  }
  if (matches.length > 1) throw new Error(`${id} matches more than one obligation assignment: ${matches.join(', ')}`)
  return matches[0] || config.default_profile
}

export function deriveObligationMatrix() {
  const config = readJson(PROFILE_PATH)
  const ids = registryIds('docs/authority/PERMANENT-ID-REGISTRY.txt')
  const controls = controlRows()
  if (!sameSet([...controls.keys()], ids)) throw new Error('control-map ID set differs from the permanent registry')
  const header = ['permanent_id','authority_citation','requirement_name','approved_behavior','profile','platform','final_proof_layer',...LAYERS.flatMap((layer) => [`${layer}_code`,`${layer}_status`,`${layer}_obligation`,`${layer}_evidence_types`])]
  const rows = [header]
  for (const id of ids) {
    const profileName = assignedProfile(id, config)
    const profile = config.profiles?.[profileName]
    if (!profile) throw new Error(`${id} resolves to missing profile ${profileName}`)
    const control = controls.get(id)
    const row = [id,`${CONTROL_MAP}#${id}`,control.name,control.approved_behavior,profileName,profileName === 'desktop_only' ? 'desktop' : profileName === 'governance_only' ? 'governance' : 'web',profile.final_proof_layer]
    for (const layer of LAYERS) {
      const obligation = profile.layers?.[layer]
      if (!obligation || !['APPLICABLE','N/A'].includes(obligation.status)) throw new Error(`${profileName} lacks a valid ${layer} obligation`)
      row.push(obligation.code,obligation.status,obligation.status === 'N/A' ? obligation.reason : obligation.obligation,(obligation.evidence_types || []).join(';'))
    }
    rows.push(row)
  }
  return `${rows.map((row) => row.map(csv).join(',')).join('\n')}\n`
}

export function verifyObligationMatrix() {
  const errors = []
  let derived
  try { derived = deriveObligationMatrix() } catch (error) { return [String(error.message || error)] }
  if (!fs.existsSync(at(MATRIX_PATH))) errors.push(`missing derived obligation matrix: ${MATRIX_PATH}`)
  else if (read(MATRIX_PATH) !== derived) errors.push('obligation matrix is stale; run derive-obligations.mjs')
  return errors
}

if (import.meta.url === `file://${process.argv[1]}`) {
  if (process.argv.includes('--check')) {
    if (!printResult('derive-obligations', verifyObligationMatrix())) process.exit(1)
  } else {
    fs.writeFileSync(at(MATRIX_PATH), deriveObligationMatrix())
    console.log(`wrote ${MATRIX_PATH}`)
  }
}
