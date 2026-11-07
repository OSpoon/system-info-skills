import process from 'node:process'
import mri from 'mri'
import { ping } from './index.ts'

const { _: [input = 'ping'] } = mri(process.argv.slice(2))
const output = ping(input)
console.log(output)
