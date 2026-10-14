# tiers

A live agents panel for [Claude Code](https://claude.com/claude-code): every subagent of the session at a glance, its transcript on a click, and a progress bar above the prompt.

## What ships

- **Agents panel** (`/tiers` toggles it). Every subagent of the session, of any type: running, finished and planned, with model, effort, context, estimated cost and time. It opens on its own whenever a subagent starts; closed, it opens again with the next one.
- **Live transcript.** Press `Transcript ›` under any subagent to open a second pane with its conversation: the brief, what it says, each tool call with its result. It follows the agent while it runs (the last 80 lines; older ones are counted above).
- **Progress bar** above the prompt, driven by the `mcp__tiers__progress` tool. Ask Claude to report a multi-step job there ("show the plan in the tiers progress bar") and it lists the tasks, then marks each one done.

The plugin adds no agents and nothing to the system prompt: Claude delegates exactly as it would without it.

## Install

In a Claude Code terminal session:

```
/plugin install tiers --marketplace douglasaxel/claude-tiers
```

Answer `y` to add the marketplace, then pick the user scope.

## Options

`language`: `auto` (follows Claude Code's `language` setting, then the system locale), `en` or `pt`.

## Develop

```
claude plugin validate .
claude plugin test .
claude --plugin-dir .
```

Mods are built on function hooks, an early-access Claude Code API (tested on 2.1.296); it may change between releases.

## Credits

The agents panel and progress bar are adapted from [savvy-progress](https://github.com/johnnyvizz/claude-kit) by johnnyvizz (MIT).
