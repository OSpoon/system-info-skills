import process from 'node:process'
import mri from 'mri'
import { getSystemInfo, isSystemInfoCategory } from './index.ts'

const args = mri(process.argv.slice(2))
const [category = 'all', ...extra] = args._

if (extra.length || Object.keys(args).some(key => key !== '_') || !isSystemInfoCategory(category)) {
  console.error('Usage: system-info [os|cpu|memory|disk|network|all]')
  process.exitCode = 2
}
else {
  console.log(JSON.stringify(await getSystemInfo(category), null, 2))
}
