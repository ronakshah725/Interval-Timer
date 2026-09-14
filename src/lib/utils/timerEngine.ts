import type { TimerBlock } from './types'

export interface TimerTick {
  /** Total elapsed seconds after this tick, clamped to the timer's total duration. */
  time: number
  /** Index of the block that is now active. */
  block: number
  /** True when the whole timer has finished. */
  finished: boolean
}

/**
 * Pure one-second advancement of timer playback.
 * Extracted from InterviewTimer so the progression logic is testable without
 * a DOM or fake timers.
 */
export function advanceTimer(
  blocks: TimerBlock[],
  currentTime: number,
  currentBlock: number,
): TimerTick {
  const newTime = currentTime + 1

  // End of the currently active block: sum of durations up to and including it.
  let blockEnd = 0
  for (let i = 0; i <= currentBlock; i++) {
    blockEnd += blocks[i].duration
  }

  let nextBlock = currentBlock
  if (newTime >= blockEnd && currentBlock < blocks.length - 1) {
    nextBlock = currentBlock + 1
  }

  const totalTime = blocks.reduce((sum, b) => sum + b.duration, 0)
  if (newTime >= totalTime) {
    return { time: totalTime, block: nextBlock, finished: true }
  }
  return { time: newTime, block: nextBlock, finished: false }
}
