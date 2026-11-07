---
name: system-info
description: Read local host operating system, CPU, memory, filesystem capacity, or network interface information when requested.
license: MIT
compatibility: Requires Node.js.
metadata:
  category: system
allowed-tools: Bash(node:*)
---

# System Info

When the user asks for local system information, run the helper for only the requested category. Use `all` only for a broad system overview. Resolve `<skill-dir>` as the directory containing this file:

```sh
node "<skill-dir>/scripts/index.mjs" <category>
```

Categories: `os`, `cpu`, `memory`, `disk`, `network`, `all`.

The command is read-only. `disk` reports the filesystem containing the command's current working directory. `network` lists local interface addresses only; it does not test internet connectivity or include MAC addresses. Results describe the environment running the command.
