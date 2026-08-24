import fs from 'node:fs'
import { at, extract, read, registryIds, sameSet, printResult } from './lib.mjs'

const sources = {
  permanent: {
    path: 'docs/authority/DIVERGENCE-AI-CONTROL-BEHAVIOR-MAP-v2.md',
    registry: 'docs/authority/PERMANENT-ID-REGISTRY.txt',
    regex: /^\|\s*((?:SPEC|USR|SRC|ROUTE|KB|ADV)-[A-Z0-9-]+)\s*\|/gm,
  },
  repair: {
    path: 'docs/authority/DIVERGENCE-AI-REPAIR-QUEUE-v2.md',
    registry: 'docs/authority/REPAIR-ID-REGISTRY.txt',
    regex: /^\|\s*(V2-RQ-\d+)\s*\|/gm,
  },
  decision: {
    path: 'docs/authority/DIVERGENCE-AI-DECISION-QUEUE-v2.md',
    registry: 'docs/authority/DECISION-ID-REGISTRY.txt',
    regex: /^\|\s*(V2-DQ-\d+)\s*\|/gm,
  },
  workflow: {
    path: 'docs/authority/DIVERGENCE-AI-SITE-CONTRACT-v2.md',
    registry: 'docs/authority/WORKFLOW-ID-REGISTRY.txt',
    regex: /^\|\s*((?:WF|V2-WF)-\d+)\s*\|/gm,
  },
  acceptance_test: {
    path: 'docs/authority/DIVERGENCE-AI-SITE-CONTRACT-v2.md',
    registry: 'docs/authority/ACCEPTANCE-TEST-ID-REGISTRY.txt',
    regex: /\b(ACC-[A-Z0-9-]*\d)\b/g,
  },
}

const sessions = {
  'V2-DQ-001': 'DS-01', 'V2-DQ-002': 'DS-01', 'V2-DQ-003': 'DS-01', 'V2-DQ-004': 'DS-01',
  'V2-DQ-005': 'DS-02', 'V2-DQ-006': 'DS-03', 'V2-DQ-007': 'DS-04',
}

const writeMode = process.argv.includes('--write')
const errors = []

if (writeMode && process.env.DIVERGENCE_GOVERNANCE_WRITE !== '1') {
  errors.push('Write mode requires DIVERGENCE_GOVERNANCE_WRITE=1 and governance authorization')
}

for (const [name, config] of Object.entries(sources)) {
  const derived = extract(read(config.path), config.regex)
  const installed = registryIds(config.registry)
  if (!sameSet(derived, installed)) errors.push(`${name} registry differs from derived source set`)
  if (writeMode && !errors.length) {
    const body = name === 'decision'
      ? derived.map((id) => `${id}|${sessions[id]}`).join('\n')
      : derived.join('\n')
    fs.writeFileSync(at(config.registry), `# mechanically derived from ${config.path}\n${body}\n`)
  }
}

if (!printResult('derive-registries', errors)) process.exit(1)
