import { expect, test } from 'claude-code/testing'

const BASE = {
  sections: [
    { id: 'intro', text: 'intro', scope: 'shared' },
    { id: 'env', text: 'env', scope: 'session' },
  ],
} as const

const compose = (tools: string[]) => ({
  model: 'claude-opus-5-5',
  promptModel: 'claude-opus-5-5',
  surfaces: [],
  tools,
  outputStyle: null,
  traits: [],
})

test('routing section lands before the cache boundary when Agent is offered', async ($, on) => {
  on('prompt.compose', () => BASE)
  const { sections } = await $.prompt.compose(compose(['Agent', 'Read']))
  expect(sections.map(s => s.id)).toEqual(['intro', 'tiers:routing', 'env'])
})

test('no routing section without the Agent tool', async ($, on) => {
  on('prompt.compose', () => BASE)
  const { sections } = await $.prompt.compose(compose(['Read']))
  expect(sections.map(s => s.id)).toEqual(['intro', 'env'])
})

test('progress tool tracks planned and accepted tasks', async ($, on) => {
  on('ui.panes', () => ({ value: [] }))
  on('ui.open', () => ({ value: { isPlaced: false, reason: 'test' } }))
  await $.tool.call({
    tool: 'mcp__tiers__progress',
    title: 'Checkout',
    phase: 'delegate',
    tasks: [
      { title: 'Schema', tier: 'medium' },
      { title: 'API', tier: 'tiers:careful', after: [1] },
    ],
  })
  const r = await $.tool.call({ tool: 'mcp__tiers__progress', done: 1 })
  expect(r.result).toBe('ok: Tasks 1/2')
})

test('implement-spec opens the agents panel and asks for tiers', async ($, on) => {
  const opened: string[] = []
  on('skill.prompt', (_, e) => ({ text: e.text }))
  on('ui.panes', () => ({ value: [] }))
  on('ui.open', (_, e) => {
    opened.push(e.id)
    return { value: { isPlaced: true } }
  })
  const { text } = await $.skill.prompt({ skill: 'mattpocock-skills:implement-spec', text: 'SPEC' })
  expect(text.startsWith('SPEC')).toBe(true)
  expect(text).toContain('tiers:*')
  expect(opened).toEqual(['tiers-agents'])
})

test('other skills pass through untouched', async ($, on) => {
  on('skill.prompt', (_, e) => ({ text: e.text }))
  const { text } = await $.skill.prompt({ skill: 'mattpocock-skills:implement', text: 'X' })
  expect(text).toBe('X')
})

test('any subagent opens the agents panel', async ($, on) => {
  const opened: string[] = []
  on('agent.spawn', () => ({ model: 'claude-sonnet-5-5', agentId: 'a1' }))
  on('clock.now', () => ({ value: 1000 }))
  on('ui.panes', () => ({ value: [] }))
  on('ui.open', (_, e) => {
    opened.push(e.id)
    return { value: { isPlaced: true } }
  })
  await $.agent.spawn({
    tool_use_id: 't1',
    prompt: 'look around',
    description: 'Explore repo',
    subagentType: 'general-purpose',
    provider: { plugin: 'engine', tier: 'builtin' },
    parentModel: 'claude-opus-5-5',
    background: false,
    fork: false,
  })
  expect(opened).toEqual(['tiers-agents'])
})
