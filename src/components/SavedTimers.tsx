"use client"

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Edit, Trash2 } from 'lucide-react';
import { formatTime } from '@/lib/utils';

interface SavedTimersProps {
  onSelect: (timer: any) => void;
  onDelete: (id: string) => void;
}

export function SavedTimers({ onSelect, onDelete }: SavedTimersProps) {
  const [timers, setTimers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchTimers();
  }, []);

  const fetchTimers = async () => {
    try {
      const response = await fetch('/api/timer-configs');
      const data = await response.json();
      setTimers(data);
    } catch (error) {
      console.error('Failed to fetch timers:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading saved timers...</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {timers.map((timer: any) => (
        <Card key={timer.id} className="transition-shadow hover:shadow-lg">
          <CardHeader>
            <CardTitle>{timer.name}</CardTitle>
            <CardDescription>
              {timer.blocks.length} blocks · {
                formatTime(timer.blocks.reduce((sum: number, block: any) => sum + block.duration, 0))
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => onSelect(timer)}>
                <Play className="w-4 h-4 mr-2" />
                Start
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => onSelect(timer)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => onDelete(timer.id)}
                className="text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}