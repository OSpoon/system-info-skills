import { mkdtemp, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { basename, join } from 'node:path'
import process from 'node:process'
import { cancel, group, intro, log, outro, tasks, text } from '@clack/prompts'
import pc from 'picocolors'

interface PackageJson {
  name: string
  description: string
  author?: { name: string, url?: string } | string
  repository?: { type: string, url: string }
  homepage?: string
  bugs?: { url: string }
  funding?: string
}

function parseGitHubRepository(value: string) {
  try {
    const url = new URL(value)
    const parts = url.pathname.replace(/\.git$/u, '').split('/').filter(Boolean)
    if (url.protocol === 'https:' && url.hostname === 'github.com' && !url.username && !url.password && !url.port && !url.search && !url.hash && parts.length === 2 && /^[\w-]+$/u.test(parts[0]) && !parts[0].includes('_') && /^[\w.-]+$/u.test(parts[1]))
      return { owner: parts[0], name: parts[1] }
  }
  catch {
    return undefined
  }
}

const root = process.cwd()
const packagePath = join(root, 'package.json')
const pkg = JSON.parse(await readFile(packagePath, 'utf8')) as PackageJson
const readmePath = join(root, 'README.md')
const contributingPath = join(root, 'CONTRIBUTING.md')
const licensePath = join(root, 'LICENSE.md')
const fundingPath = join(root, '.github/FUNDING.yml')
const previousName = pkg.name
const previousDescription = pkg.description
const currentAuthor = typeof pkg.author === 'object' ? pkg.author : undefined
const initialAuthor = typeof pkg.author === 'string' ? pkg.author : currentAuthor?.name ?? 'OSpoon'
const currentRepository = pkg.repository?.url.replace(/^git\+/u, '').replace(/\.git$/u, '')
const currentRepositoryInfo = currentRepository ? parseGitHubRepository(currentRepository) : undefined
const currentGithubUsername = currentAuthor?.url?.match(/^https:\/\/github\.com\/([\w-]+)\/?$/u)?.[1]
const suggestedName = basename(root).toLowerCase().replace(/[^a-z0-9._-]+/gu, '-').replace(/^[._-]+/u, '') || 'my-project'
const initialName = previousName === 'pkg-placeholder' ? suggestedName : previousName
const initialDescription = previousDescription === '_description_' ? '' : previousDescription
const initialGithubUsername = currentGithubUsername ?? currentRepositoryInfo?.owner ?? 'OSpoon'
const initialRepository = previousName === 'pkg-placeholder'
  ? `https://github.com/${currentRepositoryInfo?.owner ?? 'owner'}/${initialName.split('/').at(-1)}`
  : currentRepository

intro(pc.bgCyan(pc.black(' starter-skills ')))
log.info(`${pc.dim('Current project:')} ${pkg.name}`)
const answers = await group({
  name: () => text({
    message: 'Package name',
    initialValue: initialName,
    validate: value => !value || value.length > 214 || !/^(?:@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/u.test(value) || value.endsWith('.')
      ? 'Enter a valid package name.'
      : undefined,
  }),
  description: () => text({
    message: 'Package description',
    initialValue: initialDescription,
    placeholder: 'A short description',
    validate: value => value?.trim() && !/[\r\n]/u.test(value) ? undefined : 'Enter a one-line description.',
  }),
  author: () => text({
    message: 'Author name',
    initialValue: initialAuthor,
    validate: value => value?.trim() && !/[\r\n<>]/u.test(value) && !['[', ']', '\\'].some(char => value.includes(char)) ? undefined : 'Enter a valid author name.',
  }),
  githubUsername: () => text({
    message: 'GitHub username',
    initialValue: initialGithubUsername,
    validate: value => value && value.length <= 39 && /^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/u.test(value) ? undefined : 'Enter a valid GitHub username.',
  }),
  repository: () => text({
    message: 'GitHub repository URL',
    initialValue: initialRepository,
    placeholder: 'https://github.com/owner/repo',
    validate: value => value && parseGitHubRepository(value) ? undefined : 'Enter a GitHub repository URL in https://github.com/owner/repo format.',
  }),
}, {
  onCancel() {
    cancel('Initialization cancelled; no files were changed.')
    process.exit(0)
  },
})

const name = answers.name!
const description = answers.description!.trim()
const author = answers.author!.trim()
const githubUsername = answers.githubUsername!
const repository = parseGitHubRepository(answers.repository!)!
const repositoryUrl = `https://github.com/${repository.owner}/${repository.name}`
const repositoryPath = `${repository.owner}/${repository.name}`
const githubProfile = `https://github.com/${githubUsername}`
const [readme, contributing, license] = await Promise.all([
  readFile(readmePath, 'utf8'),
  readFile(contributingPath, 'utf8'),
  readFile(licensePath, 'utf8'),
])

pkg.name = name
pkg.description = description
pkg.author = { name: author, url: githubProfile }
pkg.funding = `https://github.com/sponsors/${githubUsername}`
pkg.repository = { type: 'git', url: `git+${repositoryUrl}.git` }
pkg.homepage = `${repositoryUrl}#readme`
pkg.bugs = { url: `${repositoryUrl}/issues` }

function updateProjectText(content: string) {
  return content
    .replaceAll('repo/pkg-placeholder', repositoryPath)
    .replaceAll(currentRepositoryInfo ? `${currentRepositoryInfo.owner}/${currentRepositoryInfo.name}` : 'OSpoon/pkg-placeholder', repositoryPath)
    .replaceAll(previousName, name)
}

const temporaryDirectory = await mkdtemp(join(root, '.init-'))
const licenseCopyright = `Copyright (c) ${new Date().getFullYear()} ${author} <${githubProfile}>`
const updates = [
  [packagePath, `${JSON.stringify(pkg, null, 2)}\n`],
  [readmePath, updateProjectText(readme).replace(previousDescription || '_description_', () => description).replace(/^\[MIT\]\(\.\/LICENSE(?:\.md)?\) License © .+$/mu, `[MIT](./LICENSE.md) License © [${author}](${githubProfile})`)],
  [contributingPath, updateProjectText(contributing)],
  [licensePath, license.replace(/^Copyright \(c\) .*$/mu, licenseCopyright)],
  [fundingPath, `github: [${githubUsername}]\n`],
] as const
const backups: Array<{ path: string, backup?: string }> = []
let keepTemporaryDirectory = false

async function updateFile(update: typeof updates[number], index: number) {
  const [path] = update
  const backup = join(temporaryDirectory, `${index}.bak`)
  try {
    await rename(path, backup)
    backups.push({ path, backup })
  }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT')
      throw error
    backups.push({ path })
  }
  await rename(join(temporaryDirectory, `${index}.new`), path)
}

try {
  for (const [index, [, content]] of updates.entries())
    await writeFile(join(temporaryDirectory, `${index}.new`), content)
  log.info(`${pc.dim('Project:')} ${pc.bold(name)} · ${repositoryPath}`)
  await tasks([
    {
      title: 'Package metadata',
      task: async () => {
        await updateFile(updates[0], 0)
        return 'Updated package.json'
      },
    },
    {
      title: 'Project documentation',
      task: async () => {
        await updateFile(updates[1], 1)
        await updateFile(updates[2], 2)
        await updateFile(updates[3], 3)
        return 'Updated README, contributing guide, and license'
      },
    },
    {
      title: 'GitHub funding',
      task: async () => {
        await updateFile(updates[4], 4)
        return 'Updated funding details'
      },
    },
  ])
}
catch (error) {
  const rollbackErrors: unknown[] = []
  for (const { path, backup } of backups.reverse()) {
    try {
      await rm(path, { force: true })
      if (backup)
        await rename(backup, path)
    }
    catch (rollbackError) {
      rollbackErrors.push(rollbackError)
    }
  }
  if (rollbackErrors.length) {
    keepTemporaryDirectory = true
    throw new AggregateError([error, ...rollbackErrors], `Initialization rollback was incomplete; recovery files remain in ${temporaryDirectory}.`)
  }
  throw error
}
finally {
  if (!keepTemporaryDirectory)
    await rm(temporaryDirectory, { recursive: true, force: true })
}

outro(`${pc.green(name)} is ready`)
