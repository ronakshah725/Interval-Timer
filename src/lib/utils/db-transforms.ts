import { TimerConfig } from './types';

export const serializeTimer = (timer: TimerConfig) => ({
  ...timer,
  blocks: timer.blocks.map(block => ({
    ...block,
    notes: JSON.stringify(block.notes)
  }))
});

export const deserializeTimer = (dbTimer: any): TimerConfig => ({
  id: dbTimer.id,
  name: dbTimer.name,
  blocks: dbTimer.blocks.map((block: any) => ({
    id: block.id,
    title: block.title,
    duration: block.duration,
    notes: JSON.parse(block.notes || '[]'),
    color: block.color,
    order: block.order
  })),
  createdAt: new Date(dbTimer.createdAt),
  updatedAt: new Date(dbTimer.updatedAt)
});