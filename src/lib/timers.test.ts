import { beforeEach, describe, expect, test, vi } from 'vitest'

// Hoisted mock Prisma client: no real DB in the test environment.
// The data-operation functions in ./timers call getPrisma() from ./db,
// so mocking that module boundary intercepts every DB call.
const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    timerConfig: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    timerBlock: {
      deleteMany: vi.fn(),
    },
  },
}))

vi.mock('./db', () => ({
  getPrisma: () => mockPrisma,
}))

import { deleteTimer, listTimers, saveTimer } from './timers'
import type { TimerConfig } from './utils/types'

// What Prisma returns: Dates as Date objects, notes as a JSON string column.
const dbTimer = (overrides = {}) => ({
  id: 'timer-1',
  name: 'Coding',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-02T00:00:00.000Z'),
  blocks: [
    {
      id: 'b1',
      title: 'Intro',
      duration: 300,
      notes: '["warm up","breath"]',
      color: 'blue',
      order: 0,
    },
    {
      id: 'b2',
      title: 'Deep dive',
      duration: 900,
      notes: '[]',
      color: 'green',
      order: 1,
    },
  ],
  ...overrides,
})

// What the client sends: notes as string arrays, no id on create.
const clientTimer: TimerConfig = {
  name: 'Coding',
  blocks: [
    {
      id: 'x1',
      title: 'Intro',
      duration: 300,
      notes: ['warm up', 'breath'],
      color: 'blue',
      order: 0,
    },
    {
      id: 'x2',
      title: 'Deep dive',
      duration: 900,
      notes: [],
      color: 'green',
      order: 1,
    },
  ],
}

describe('timer CRUD round-trip', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('save (create) → list → save (update) → delete', async () => {
    // CREATE
    mockPrisma.timerConfig.create.mockResolvedValue(dbTimer())
    const created = await saveTimer(clientTimer)

    expect(mockPrisma.timerConfig.create).toHaveBeenCalledTimes(1)
    const createArg = mockPrisma.timerConfig.create.mock.calls[0][0]
    expect(createArg.data.name).toBe('Coding')
    // blocks created in order, notes JSON-stringified for the TEXT column
    expect(createArg.data.blocks.create).toHaveLength(2)
    expect(createArg.data.blocks.create[0]).toMatchObject({
      title: 'Intro',
      duration: 300,
      order: 0,
      notes: '["warm up","breath"]',
    })
    expect(createArg.data.blocks.create[1]).toMatchObject({
      title: 'Deep dive',
      duration: 900,
      order: 1,
      notes: '[]',
    })
    // contract: Dates serialized to ISO strings, notes decoded for the client
    expect(created.createdAt).toBe('2026-01-01T00:00:00.000Z')
    expect(created.updatedAt).toBe('2026-01-02T00:00:00.000Z')
    expect(created.blocks[0].notes).toEqual(['warm up', 'breath'])
    expect(created.blocks[1].notes).toEqual([])

    // LIST
    mockPrisma.timerConfig.findMany.mockResolvedValue([dbTimer()])
    const listed = await listTimers()
    expect(mockPrisma.timerConfig.findMany).toHaveBeenCalledTimes(1)
    expect(listed).toHaveLength(1)
    expect(listed[0].id).toBe('timer-1')
    expect(listed[0].createdAt).toBe('2026-01-01T00:00:00.000Z')
    expect(listed[0].blocks[0].notes).toEqual(['warm up', 'breath'])

    // UPDATE (blocks are replaced, then the config is updated)
    mockPrisma.timerBlock.deleteMany.mockResolvedValue({ count: 2 })
    mockPrisma.timerConfig.update.mockResolvedValue(
      dbTimer({ name: 'Coding v2' }),
    )
    const updated = await saveTimer({
      ...clientTimer,
      id: 'timer-1',
      name: 'Coding v2',
    })
    expect(mockPrisma.timerBlock.deleteMany).toHaveBeenCalledWith({
      where: { timerConfigId: 'timer-1' },
    })
    expect(mockPrisma.timerConfig.update).toHaveBeenCalledTimes(1)
    const updateArg = mockPrisma.timerConfig.update.mock.calls[0][0]
    expect(updateArg.where).toEqual({ id: 'timer-1' })
    expect(updateArg.data.blocks.create).toHaveLength(2)
    expect(updateArg.data.blocks.create[0].order).toBe(0)
    expect(updateArg.data.blocks.create[1].order).toBe(1)
    expect(updated.name).toBe('Coding v2')
    expect(updated.blocks[0].notes).toEqual(['warm up', 'breath'])

    // DELETE (blocks first, then the config)
    mockPrisma.timerBlock.deleteMany.mockResolvedValue({ count: 2 })
    mockPrisma.timerConfig.delete.mockResolvedValue(dbTimer())
    const result = await deleteTimer('timer-1')
    expect(mockPrisma.timerBlock.deleteMany).toHaveBeenCalledWith({
      where: { timerConfigId: 'timer-1' },
    })
    expect(mockPrisma.timerConfig.delete).toHaveBeenCalledWith({
      where: { id: 'timer-1' },
    })
    expect(result).toEqual({ success: true })
  })
})

describe('timer input validation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('rejects timers with no blocks or non-positive durations before touching the DB', async () => {
    await expect(saveTimer({ name: 'Empty', blocks: [] })).rejects.toThrow(
      /at least one block/,
    )
    await expect(
      saveTimer({
        name: 'Zero duration',
        blocks: [
          {
            id: 'z',
            title: 'Zero',
            duration: 0,
            notes: [],
            color: 'blue',
            order: 0,
          },
        ],
      }),
    ).rejects.toThrow(/positive duration/)
    await expect(
      saveTimer({
        name: 'Negative duration',
        blocks: [
          {
            id: 'n',
            title: 'Negative',
            duration: -60,
            notes: [],
            color: 'blue',
            order: 0,
          },
        ],
      }),
    ).rejects.toThrow(/positive duration/)

    // The DB was never touched.
    expect(mockPrisma.timerConfig.create).not.toHaveBeenCalled()
    expect(mockPrisma.timerConfig.update).not.toHaveBeenCalled()
    expect(mockPrisma.timerBlock.deleteMany).not.toHaveBeenCalled()
  })
})
