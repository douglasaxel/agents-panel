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

- **Model-invoked.** Claude picks a tier on its own whenever it delegates implementation, in or out of a skill. The plugin adds a short routing table to the system prompt of every session that has the `Agent` tool.
- **Other agents stay available.** Research, review, docs, planning, or a task no tier fits still go to `general-purpose`, `Explore`, `Plan` or any other agent, with `model` and `effort` passed as usual. Asking for a specific agent always wins.
- **Matt-flow aware.** Each agent reads the ticket it is pointed at, plus `GLOSSARY.md` and ADRs when the repo has them, leaves `/code-review` to the caller, and follows the brief's git instructions (no commit when the brief is silent, never a push).
- **Test-first when there are tests.** In a project with a test setup, agents build with `/tdd` (`/diagnosing-bugs` for bugs on heavy and fable). Without one, they do not add one unless asked: they verify with a typecheck, a build or by running the code, and say so in the report.
- **Safe in parallel.** The routing table tells Claude to run tasks that touch the same files one after another, or with `isolation: "worktree"`, unless the flow already gives each implementer its own worktree (as `/implement-spec` does).
- **Escalates instead of guessing.** A worker out of its depth answers `needs higher tier`, and Claude hands the task one tier up.
- **Agents panel** (`/tiers` toggles it): every subagent of the session, with model, effort, self-reported steps, context, estimated cost and time. It opens on its own whenever any subagent starts, of any type, and when `/implement-spec` runs; closed, it opens again with the next subagent.
- **`/implement-spec` hook.** When that skill loads, the plugin appends a short note to its prompt: run implementers as `tiers:*` and report the tickets to the progress bar.
- **Progress bar** above the prompt, driven by the `mcp__tiers__progress` tool: Claude reports the planned tasks, then each accepted one.

## Install

In a Claude Code terminal session:

```
/plugin install tiers --marketplace douglasaxel/claude-tiers
```

Answer `y` to add the marketplace, then pick the user scope. Restart the session so the agents load.

Without access to Fable, change `model:` in `agents/fable.md`.

## Use with Matt Pocock's skills

`/grill-with-docs` → `/to-spec` → `/to-tickets` → `/implement-spec`. When `/implement-spec` spawns implementer subagents, they run as `tiers:*`. `/implement` uses them too.

`/implement-spec` ships in mattpocock-skills 1.3 and later. If it does not show up, the copy in `claude-plugins-official` may lag behind: install from Matt's own marketplace instead.

```
claude plugin uninstall mattpocock-skills@claude-plugins-official
claude plugin marketplace add https://github.com/mattpocock/skills.git
claude plugin install mattpocock-skills@mattpocock
```

If your settings already list a `mattpocock` marketplace, add it from the exact source listed there.

## Use without a workflow

Ask Claude to implement something with subagents and it picks the tiers by itself. Name one to choose it yourself: "use `tiers:heavy` to find the root cause".

## Customize

| To change | Edit |
| --- | --- |
| A tier's model or effort | `model:` and `effort:` in `agents/<tier>.md`, and `TIER_MODEL` in `hooks/register.tsx` (what the panel shows for planned tasks) |
| How Claude picks a tier | `ROUTING` in `hooks/register.tsx` |
| What `/implement-spec` is told | `IMPLEMENT_SPEC_NOTE` in `hooks/register.tsx` |
| The panel's language | the `language` option: `auto` (follows Claude Code's `language` setting), `en` or `pt` |

## Develop

```
claude plugin validate .
claude plugin test .
claude --plugin-dir .
```

Mods are built on function hooks, an early-access Claude Code API (tested on 2.1.296); it may change between releases.

## Credits

The agents panel and progress bar are adapted from [savvy-progress](https://github.com/johnnyvizz/claude-kit) by johnnyvizz (MIT).
