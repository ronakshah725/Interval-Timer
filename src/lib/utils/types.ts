export interface TimerBlock {
  id: string
  title: string
  duration: number
  notes: string[]
  color: string
  order: number
}

export interface TimerConfig {
  id?: string
  name: string
  blocks: TimerBlock[]
  // ISO strings: server functions serialize Dates over the wire.
  createdAt?: string
  updatedAt?: string
}
