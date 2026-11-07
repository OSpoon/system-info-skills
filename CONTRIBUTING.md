# Contributing

Use this repository's GitHub issues and pull requests to discuss contributions.

## Agent Skills documentation

This repository follows the [Agent Skills format](https://agentskills.io/). Read the [official documentation](https://agentskills.io/) for the full guide set.

- [Quickstart](https://agentskills.io/skill-creation/quickstart)
- [Format specification](https://agentskills.io/specification)
- [Best practices for skill creators](https://agentskills.io/skill-creation/best-practices)
- [Optimizing skill descriptions](https://agentskills.io/skill-creation/optimizing-descriptions)
- [Using scripts in skills](https://agentskills.io/skill-creation/using-scripts)
- [Evaluating skill output quality](https://agentskills.io/skill-creation/evaluating-skills)

## Skill versioning and release

The version in the root `package.json` is the source of truth for the single skill's releases. The package remains private and is not published to npm.

- **Patch**: wording fixes and compatible corrections that do not change the skill's trigger or output contract.
- **Minor**: backward-compatible workflow, reference, asset, or script additions.
- **Major**: breaking changes to triggers, required inputs, expected outputs, or script behavior.

Use Conventional Commit subjects. Bumpp handles version bumps, release commits, and local tags. Its `execute` hook builds the skill helper; the `version` lifecycle script generates `CHANGELOG.md` with Changelogen before the release commit and tag. A release tag must match the package version, using `v<version>`. For example, version `0.2.0` is tagged `v0.2.0`.

After preparing the skill changes, run `pnpm release --release patch`. Bumpp installs dependencies, builds the skill helper, generates the changelog from the latest tag to `HEAD`, creates the release commit, and tags it `v<version>`. With `all: true`, all current changes are included in that commit, so keep only intended release changes in the working tree. `push: false` leaves the commit and tag local. Review the commit and changelog, push them when ready, then publish the GitHub Release manually:

```sh
pnpm release --release patch
```

Install the latest version from the default branch:

```sh
npx skills add repo/pkg-placeholder --skill <skill-name>
```

Pin a released version by using its tag in the GitHub tree URL:

```sh
npx skills add https://github.com/repo/pkg-placeholder/tree/v0.1.0/skills/ping
```
