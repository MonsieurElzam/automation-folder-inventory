#!/usr/bin/env node
/* Inventaire d'un dossier : volume par extension, plus gros fichiers, fichiers dupliqués (SHA-256). */
import { readdirSync, statSync, readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { extname, join } from 'node:path'
import { isMain, parseArgs, usage, fail } from '../lib/cli.mjs'

const SKIP = new Set(['node_modules', '.git', '.next', '.cache'])

export function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isSymbolicLink() || SKIP.has(entry.name)) continue
    const full = join(dir, entry.name)
    if (entry.isDirectory()) walk(full, out)
    else if (entry.isFile()) out.push({ path: full, size: statSync(full).size })
  }
  return out
}

export function findDuplicates(files) {
  const bySize = new Map()
  for (const f of files) if (f.size > 0) bySize.set(f.size, [...(bySize.get(f.size) ?? []), f])
  const groups = []
  for (const same of bySize.values()) {
    if (same.length < 2) continue
    const byHash = new Map()
    for (const f of same) {
      const h = createHash('sha256').update(readFileSync(f.path)).digest('hex')
      byHash.set(h, [...(byHash.get(h) ?? []), f.path])
    }
    for (const [hash, paths] of byHash) if (paths.length > 1) groups.push({ hash, size: same[0].size, paths })
  }
  return groups.sort((a, b) => b.size * b.paths.length - a.size * a.paths.length)
}

export const human = (n) => {
  const units = ['o', 'Ko', 'Mo', 'Go', 'To']
  let i = 0
  while (n >= 1024 && i < units.length - 1) { n /= 1024; i++ }
  return `${n.toFixed(i ? 1 : 0)} ${units[i]}`
}

export function inventory(files) {
  const ext = new Map()
  for (const f of files) {
    const e = extname(f.path).toLowerCase() || '(sans extension)'
    const cur = ext.get(e) ?? { n: 0, size: 0 }
    ext.set(e, { n: cur.n + 1, size: cur.size + f.size })
  }
  return {
    count: files.length,
    size: files.reduce((s, f) => s + f.size, 0),
    byExtension: [...ext].map(([e, v]) => ({ ext: e, ...v })).sort((a, b) => b.size - a.size),
    largest: [...files].sort((a, b) => b.size - a.size).slice(0, 10),
  }
}

if (isMain(import.meta.url)) {
  const args = parseArgs(process.argv.slice(2), ['help', 'dupes'])
  usage(`
Usage : node src/folder-inventory.mjs dossier [--dupes]
--dupes : cherche aussi les fichiers identiques (plus lent : calcule des empreintes).
Ignore node_modules, .git et les liens symboliques.`, args, 1)
  let files
  try { files = walk(args._[0]) } catch (e) { fail(e.message) }
  const inv = inventory(files)
  console.log(`${inv.count} fichiers, ${human(inv.size)}\n`)
  console.table(inv.byExtension.slice(0, 10).map((e) => ({ extension: e.ext, fichiers: e.n, volume: human(e.size) })))
  console.log('Plus gros fichiers :')
  inv.largest.forEach((f) => console.log(`  ${human(f.size).padStart(9)}  ${f.path}`))
  if (args.dupes) {
    const dup = findDuplicates(files)
    const waste = dup.reduce((s, g) => s + g.size * (g.paths.length - 1), 0)
    console.log(`\n${dup.length} groupe(s) de doublons — espace récupérable : ${human(waste)}`)
    dup.slice(0, 10).forEach((g) => { console.log(`  ${human(g.size)} × ${g.paths.length}`); g.paths.forEach((p) => console.log(`    ${p}`)) })
  }
}
