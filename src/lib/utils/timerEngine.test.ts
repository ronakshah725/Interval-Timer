import { describe, expect, test } from 'vitest'
import { advanceTimer } from './timerEngine'
import type { TimerBlock } from './types'

const blocks: TimerBlock[] = [
  { id: 'b1', title: 'Intro', duration: 60, notes: [], color: 'blue', order: 0 },
  {
    id: 'b2',
    title: 'Deep dive',
    duration: 120,
    notes: [],
    color: 'green',
    order: 1,
  },
]

describe('timer playback progression', () => {
  test('advances through blocks in order and finishes', () => {
    // Start: first tick stays in block 0.
    expect(advanceTimer(blocks, 0, 0)).toEqual({
      time: 1,
      block: 0,
      finished: false,
    })

    // Last second of block 0: transitions to block 1.
    expect(advanceTimer(blocks, 59, 0)).toEqual({
      time: 60,
      block: 1,
      finished: false,
    })

    // Mid block 1: no transition.
    expect(advanceTimer(blocks, 100, 1)).toEqual({
      time: 101,
      block: 1,
      finished: false,
    })

    // Final second: finished, time clamped to the total duration.
    expect(advanceTimer(blocks, 179, 1)).toEqual({
      time: 180,
      block: 1,
      finished: true,
    })
  })
})
