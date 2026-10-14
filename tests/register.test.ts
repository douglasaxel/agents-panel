import { expect, test } from 'claude-code/testing'

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

for (const surface of ['terminal', 'desktop'] as const) {
  test(`${surface}: the transcript button opens the subagent's conversation`, async ($, on) => {
    const opened: { id: string; title?: string }[] = []
    on('agent.spawn', () => ({ model: 'claude-sonnet-5-5', agentId: 'a1' }))
    on('clock.now', () => ({ value: 1000 }))
    on('ui.panes', () => ({ value: [] }))
    on('ui.scroll', () => ({}))
    on('ui.open', (_, e) => {
      opened.push({ id: e.id, title: e.title })
      return { value: { isPlaced: true } }
    })
    on('session.messages', () => ({
      value: [
        { role: 'user', text: 'Add the filter', toolUses: [] },
        {
          role: 'assistant',
          text: 'Reading the module first.',
          toolUses: [{ tool_use_id: 'u1', tool: 'Read', input: { file_path: 'src/filter.ts' }, text: 'export const filter = 1' }],
        },
      ],
    }))
    await $.agent.spawn({
      tool_use_id: 't1',
      prompt: 'Add the filter',
      description: 'Global filters',
      subagentType: 'tiers:medium',
      provider: { plugin: 'engine', tier: 'builtin' },
      parentModel: 'claude-opus-5-5',
      background: false,
      fork: false,
    })

    const agentsPane = await $.ui.mount({ plugin: 'tiers', surface, component: 'Pane', requestId: 'tiers-agents', props: {} as never })
    await agentsPane.press({ key: 'tr-a1' })
    expect(opened.at(-1)?.id).toBe('tiers-transcript')
    expect(opened.at(-1)?.title).toContain('Global filters')

    const transcript = await $.ui.mount({ plugin: 'tiers', surface, component: 'Pane', requestId: 'tiers-transcript', props: {} as never })
    expect(await transcript.find({ text: 'Reading the module first.' })).toBeDefined()
    expect(await transcript.find({ text: /Read\(src\/filter\.ts\)/ })).toBeDefined()
  })
}
