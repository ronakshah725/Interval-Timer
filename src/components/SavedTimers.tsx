"use client"

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Play, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { TimerConfig } from '@/lib/utils/types';
import { formatTime } from '@/lib/utils/time';

interface SavedTimersProps {
  onSelect: (timer: TimerConfig) => void;
  onDelete: (id: string) => void;
}

export function SavedTimers({ onSelect, onDelete }: SavedTimersProps) {
  const [timers, setTimers] = useState<TimerConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTimers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/timer-configs');
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch timers');
        }
        
        const data = await response.json();
        
        // Validate data structure
        if (!Array.isArray(data)) {
          throw new Error('Invalid data format received');
        }
        
        // Ensure each timer has required properties
        const validatedTimers = data.map(timer => ({
          ...timer,
          blocks: timer.blocks || [],
          notes: timer.notes || []
        }));
        
        setTimers(validatedTimers);
      } catch (err) {
        console.error('Error fetching timers:', err);
        setError(err instanceof Error ? err.message : 'Failed to load timers');
      } finally {
        setLoading(false);
      }
    };

    fetchTimers();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-pulse space-y-2 text-center">
          <div className="h-4 w-32 bg-gray-200 rounded mx-auto"></div>
          <p className="text-sm text-gray-500">Loading your timers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="flex items-center gap-3 p-4">
          <AlertTriangle className="text-red-500 h-5 w-5" />
          <div className="flex-1">
            <h3 className="font-medium text-red-800">Error Loading Timers</h3>
            <p className="text-sm text-red-600">{error}</p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

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
    );
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
                {timer.blocks.length} blocks · {
                  formatTime(timer.blocks.reduce((sum, block) => sum + block.duration, 0))
                }
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
  );
}