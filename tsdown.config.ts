import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { defineConfig } from 'tsdown'

const [skill, ...extraSkills] = readdirSync('skills')
  .filter(name => existsSync(join('skills', name, 'SKILL.md')))

if (!skill || extraSkills.length)
  throw new Error('Expected exactly one skill under skills/.')

/* Multi-skill variant: src/<name>/cli.ts -> skills/<name>/scripts/index.mjs.
Keep knip.json entries aligned; custom entries replace defaults.
const names = readdirSync('skills').filter(name =>
  existsSync(join('skills', name, 'SKILL.md')) && existsSync(join('src', name, 'cli.ts')),
)
export default defineConfig(names.map(name => ({
  entry: { index: join('src', name, 'cli.ts') },
  outDir: join('skills', name, 'scripts'),
  format: 'esm', clean: true, hash: false,
})))
*/

export default defineConfig({
  entry: { index: 'src/cli.ts' },
  outDir: join('skills', skill, 'scripts'),
  format: 'esm',
  clean: true,
  hash: false,
})
