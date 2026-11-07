import { execSync } from 'node:child_process'
import { defineConfig } from 'bumpp'

export default defineConfig({
  recursive: true,
  commit: 'chore: release v%s',
  tag: 'v%s',
  push: false,
  install: true,
  all: true,
  execute() {
    execSync('pnpm run build', { stdio: 'inherit' })
  },
})
