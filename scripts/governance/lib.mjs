import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

export function at(relativePath) {
  return path.join(ROOT, relativePath)
}

export function read(relativePath) {
  return fs.readFileSync(at(relativePath), 'utf8')
}

export function readJson(relativePath) {
  return JSON.parse(read(relativePath))
}

export function exists(relativePath) {
  return fs.existsSync(at(relativePath))
}

export function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex')
}

export function git(args, options = {}) {
  const result = spawnSync('git', ['-C', ROOT, ...args], { encoding: 'utf8', ...options })
  if (result.status !== 0 && !options.allowFailure) {
    throw new Error(`git ${args.join(' ')} failed: ${(result.stderr || result.stdout).trim()}`)
  }
  return { status: result.status, stdout: result.stdout.trim(), stderr: result.stderr.trim() }
}

export function registryLines(relativePath) {
  return read(relativePath)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
}

export function registryIds(relativePath) {
  return registryLines(relativePath).map((line) => line.split('|')[0])
}

export function uniqueSorted(values) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b, 'en', { numeric: true }))
}

export function extract(text, regex) {
  const values = []
  for (const match of text.matchAll(regex)) values.push(match[1])
  return uniqueSorted(values)
}

export function sameSet(actual, expected) {
  if (actual.length !== expected.length) return false
  const a = uniqueSorted(actual)
  const b = uniqueSorted(expected)
  return a.every((value, index) => value === b[index])
}

export function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let quoted = false
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"'
        i += 1
      } else if (char === '"') quoted = false
      else field += char
    } else if (char === '"') quoted = true
    else if (char === ',') {
      row.push(field)
      field = ''
    } else if (char === '\n') {
      row.push(field.replace(/\r$/, ''))
      rows.push(row)
      row = []
      field = ''
    } else field += char
  }
  if (quoted) throw new Error('CSV has an unterminated quoted field')
  if (field || row.length) {
    row.push(field)
    rows.push(row)
  }
  return rows
}

export function validStatus(value) {
  return value === 'PROVEN'
    || value === 'IMPLEMENTED — NOT FULLY PROVEN'
    || value === 'PARTIAL'
    || value === 'NOT STARTED'
    || value === 'CONFLICT — UNRESOLVED'
    || value === 'UNKNOWN — INSPECTION REQUIRED'
    || /^BLOCKED — .+/.test(value)
    || /^N\/A AT THIS DEPTH — .+/.test(value)
}

export function globToRegExp(pattern) {
  let output = '^'
  for (let index = 0; index < pattern.length; index += 1) {
    const char = pattern[index]
    if (char === '*' && pattern[index + 1] === '*') {
      index += 1
      if (pattern[index + 1] === '/') {
        index += 1
        output += '(?:.*/)?'
      } else output += '.*'
    } else if (char === '*') output += '[^/]*'
    else if (char === '?') output += '[^/]'
    else output += char.replace(/[|\\{}()[\]^$+?.]/g, '\\$&')
  }
  return new RegExp(`${output}$`)
}

export function matchesAnyGlob(file, patterns) {
  return patterns.some((pattern) => globToRegExp(pattern).test(file))
}

export function requireCondition(condition, message, errors) {
  if (!condition) errors.push(message)
}

export function trackedFiles() {
  return git(['ls-files']).stdout.split(/\r?\n/).filter(Boolean)
}

export function printResult(name, errors) {
  if (errors.length) {
    console.error(`${name}: FAIL`)
    for (const error of errors) console.error(`- ${error}`)
    return false
  }
  console.log(`${name}: PASS`)
  return true
}
