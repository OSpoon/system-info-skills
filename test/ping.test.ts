import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

function run(...args: string[]) {
  return spawnSync(process.execPath, [fileURLToPath(new URL('../skills/ping/scripts/index.mjs', import.meta.url)), ...args], { encoding: 'utf8' })
}

describe('bundled ping script', () => {
  it('returns pong for ping', () => {
    const result = run('ping')
    expect(result.status).toBe(0)
    expect(result.stdout).toBe('pong\n')
  })
})
