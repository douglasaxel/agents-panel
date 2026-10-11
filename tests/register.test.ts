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
