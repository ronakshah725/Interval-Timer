"use client"

import { useState } from 'react';
import InterviewTimer from '@/components/InterviewTimer';
import { SavedTimers } from '@/components/SavedTimers';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function Home() {
  const [view, setView] = useState<'list' | 'timer'>('list');
  const [selectedTimer, setSelectedTimer] = useState(null);

  const handleNewTimer = () => {
    setSelectedTimer(null);
    setView('timer');
  };

  const handleSelectTimer = (timer: any) => {
    setSelectedTimer(timer);
    setView('timer');
  };

  const handleDeleteTimer = async (id: string) => {
    try {
      await fetch(`/api/timer-configs/${id}`, { method: 'DELETE' });
      // Refresh list after deletion
      window.location.reload();
    } catch (error) {
      console.error('Failed to delete timer:', error);
    }
  };

  if (view === 'timer') {
    return (
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <InterviewTimer initialTimer={selectedTimer} onSave={() => setView('list')} />
      </main>
    );
  }

  return (
    <main className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Interview Timers</h1>
        <Button onClick={handleNewTimer} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Timer
        </Button>
      </div>
      <SavedTimers onSelect={handleSelectTimer} onDelete={handleDeleteTimer} />
    </main>
  );
}