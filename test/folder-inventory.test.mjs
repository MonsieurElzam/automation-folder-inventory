import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, mkdtempSync, writeFileSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const sample = (n) => readFileSync(new URL(`../samples/${n}`, import.meta.url), 'utf8')
const mod = (n) => import(`../src/${n}.mjs`)

test('10 inventaire : volumes, doublons, dossiers ignorés', async () => {
  const { walk, inventory, findDuplicates } = await mod('folder-inventory')
  const dir = mkdtempSync(join(tmpdir(), 'inv-'))
  writeFileSync(join(dir, 'a.txt'), 'identique')
  writeFileSync(join(dir, 'b.txt'), 'identique')
  writeFileSync(join(dir, 'c.md'), 'autre contenu')
  mkdirSync(join(dir, 'node_modules')); writeFileSync(join(dir, 'node_modules', 'x.js'), 'ignoré')
  const files = walk(dir)
  assert.equal(files.length, 3)
  assert.equal(inventory(files).byExtension[0].ext, '.txt' === inventory(files).byExtension[0].ext ? '.txt' : '.md')
  const dup = findDuplicates(files)
  assert.equal(dup.length, 1)
  assert.equal(dup[0].paths.length, 2)
})
