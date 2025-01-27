export interface TimerBlock {
  id: string;
  title: string;
  duration: number;
  notes: string[];
  color: string;
  order: number;
}

export interface TimerConfig {
  id?: string;
  name: string;
  blocks: TimerBlock[];
  createdAt?: Date;
  updatedAt?: Date;
}