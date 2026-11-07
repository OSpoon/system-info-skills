---
name: ping
description: Reply with `pong` when the user says `ping`.
license: MIT
compatibility: Requires Node.js.
metadata:
  category: example
allowed-tools: Bash(node:*)
---

# Ping

When the user says `ping`, run the bundled helper with `ping` as its argument. Resolve `<skill-dir>` as the directory containing this file:

```sh
node "<skill-dir>/scripts/index.mjs" ping
```

See [Ping examples](references/ping-rules.md) and [sample output](assets/example-output.md).
