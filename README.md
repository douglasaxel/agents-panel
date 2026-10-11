# tiers

Tiered implementer subagents for [Claude Code](https://claude.com/claude-code), built to slot under [Matt Pocock's skills](https://github.com/mattpocock/skills), plus a live agents panel and a progress bar above the prompt.

## What ships

| Agent | Model / effort | For |
| --- | --- | --- |
| `tiers:light` | Haiku / low | Mechanical edits, renames, config, running builds and tests |
| `tiers:medium` | Sonnet / high | A well-specified ticket, a bug with a known cause |
| `tiers:careful` | Opus / high | Clear approach, delicate execution: multi-file refactors, invariants |
| `tiers:heavy` | Opus / xhigh | Unfamiliar code, unclear root cause, investigation |
| `tiers:fable` | Fable / high | Reserve: very complex logic, bugs that survived `tiers:heavy` |

- **Model-invoked.** Claude picks a tier on its own whenever it delegates implementation. The plugin adds a short routing table to the system prompt, so `/implement-spec`'s implementer subagents land on the right tier.
- **Matt-flow aware.** Each agent reads the ticket it is pointed at, plus `GLOSSARY.md` and ADRs, builds test-first with `/tdd` (`/diagnosing-bugs` for bugs on heavy and fable), leaves `/code-review` to the caller, and follows the brief's git instructions.
- **Escalates instead of guessing.** A worker out of its depth answers `needs higher tier`.
- **Agents panel** (`/tiers`): every subagent of the session, with model, effort, self-reported steps, context, estimated cost and time. It opens on its own when a tier agent starts.
- **Progress bar** above the prompt, driven by the `mcp__tiers__progress` tool.

Without access to Fable, change `model:` in `agents/fable.md`.

## Install

In a Claude Code terminal session:

```
/plugin install tiers --marketplace douglasaxel/claude-tiers
```

Answer `y` to add the marketplace, then pick the user scope. Restart the session so the agents load.

## Use with Matt Pocock's skills

`/grill-with-docs` → `/to-spec` → `/to-tickets` → `/implement-spec`. When `/implement-spec` spawns implementer subagents, they run as `tiers:*`. `/implement` and ad-hoc delegation use them too.

## Develop

```
claude plugin validate .
claude plugin test .
claude --plugin-dir .
```

Mods are built on function hooks, an early-access Claude Code API (tested on 2.1.296); it may change between releases.

## Credits

The agents panel and progress bar are adapted from [savvy-progress](https://github.com/johnnyvizz/claude-kit) by johnnyvizz (MIT).
