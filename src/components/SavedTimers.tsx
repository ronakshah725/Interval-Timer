import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Clock, Play, Edit, Trash2 } from 'lucide-react'
import { TimerConfig } from '~/lib/utils/types'
import { formatTime } from '~/lib/utils/time'

interface SavedTimersProps {
  timers: TimerConfig[]
  onSelect: (timer: TimerConfig) => void
  onDelete: (id: string) => void
}

export function SavedTimers({ timers, onSelect, onDelete }: SavedTimersProps) {
  if (timers.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <CardDescription>
            No saved timers yet. Create your first timer to get started!
          </CardDescription>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {timers.map((timer) => (
        <Card key={timer.id} className="group hover:shadow-lg transition-all">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="truncate">{timer.name}</span>
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>
                {timer.blocks.length} blocks ·{' '}
                {formatTime(
                  timer.blocks.reduce((sum, block) => sum + block.duration, 0),
                )}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onSelect(timer)}
              >
                <Play className="h-4 w-4 mr-2" />
                Start
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onSelect(timer)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => timer.id && onDelete(timer.id)}
                className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
