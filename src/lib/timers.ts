import { createServerFn } from '@tanstack/react-start'
import { getPrisma } from './db'
import type { TimerBlock, TimerConfig } from './utils/types'

type DbBlock = {
  id: string
  title: string
  duration: number
  notes: string
  color: string
  order: number
}

type DbTimer = {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
  blocks: DbBlock[]
}

function safeParseNotes(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

// Server functions serialize over the wire: convert Dates to ISO strings and
// decode the JSON-stringified notes column so the client gets clean types.
function toClientTimer(t: DbTimer): TimerConfig {
  return {
    id: t.id,
    name: t.name,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    blocks: t.blocks.map((b) => ({
      id: b.id,
      title: b.title,
      duration: b.duration,
      notes: safeParseNotes(b.notes),
      color: b.color,
      order: b.order,
    })),
  }
}

const blocksWithOrder = {
  include: { blocks: { orderBy: { order: 'asc' as const } } },
}

function toBlockCreate(block: TimerBlock) {
  return {
    title: block.title,
    duration: block.duration,
    notes: JSON.stringify(block.notes || []),
    color: block.color,
    order: block.order,
  }
}

export const listTimersFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const configs = await getPrisma().timerConfig.findMany(blocksWithOrder)
    return configs.map(toClientTimer)
  },
)

export const saveTimerFn = createServerFn({ method: 'POST' })
  .validator((data: TimerConfig) => data)
  .handler(async ({ data }) => {
    const prisma = getPrisma()

    if (data.id) {
      // Update: replace blocks, then update the config (same as before).
      await prisma.timerBlock.deleteMany({
        where: { timerConfigId: data.id },
      })
      const updated = await prisma.timerConfig.update({
        where: { id: data.id },
        data: {
          name: data.name,
          blocks: { create: data.blocks.map(toBlockCreate) },
        },
        ...blocksWithOrder,
      })
      return toClientTimer(updated)
    }

    const created = await prisma.timerConfig.create({
      data: {
        name: data.name,
        blocks: { create: data.blocks.map(toBlockCreate) },
      },
      ...blocksWithOrder,
    })
    return toClientTimer(created)
  })

export const deleteTimerFn = createServerFn({ method: 'POST' })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const prisma = getPrisma()
    await prisma.timerBlock.deleteMany({
      where: { timerConfigId: data.id },
    })
    await prisma.timerConfig.delete({ where: { id: data.id } })
    return { success: true }
  })
