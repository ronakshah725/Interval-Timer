"use client"

import { useState } from 'react';
import InterviewTimer from '@/components/InterviewTimer';
import { SavedTimers } from '@/components/SavedTimers';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { TimerConfig } from '@/lib/utils/types';
import { Header } from '@/components/Header';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [view, setView] = useState<'list' | 'timer'>('list');
  const [selectedTimer, setSelectedTimer] = useState<TimerConfig | null>(null);
  const router = useRouter();

  const handleNewTimer = () => {
    setSelectedTimer(null);
    setView('timer');
  };

  const handleSelectTimer = (timer: TimerConfig) => {
    setSelectedTimer(timer);
    setView('timer');
  };

  const handleSaveTimer = async (timer: TimerConfig) => {
    try {
      console.log('Saving timer:', timer);  // Debug log

      const response = await fetch('/api/timer-configs', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(timer),
      });

      console.log('Response status:', response.status);  // Debug log

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Invalid response type from server');
      }

      const data = await response.json();
      console.log('Response data:', data);  // Debug log

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save timer');
      }

      setView('list');
      router.refresh();
    } catch (error) {
      console.error('Save error details:', error);
      // You could add a toast notification here
      throw error; // Re-throw to be handled by the component
    }
  };

  const handleDeleteTimer = async (id: string) => {
    if (!confirm('Are you sure you want to delete this timer?')) return;

    try {
      const response = await fetch(`/api/timer-configs/${id}`, { 
        method: 'DELETE',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete timer');
      }

      router.refresh();
    } catch (error) {
      console.error('Delete error:', error);
      // You could add a toast notification here
    }
  };

  const handleBack = () => {
    if (confirm('Are you sure you want to go back? Any unsaved changes will be lost.')) {
      setView('list');
      setSelectedTimer(null);
    }
  };

  if (view === 'timer') {
    return (
      <div className="min-h-screen flex flex-col">
        <Header showBack onBack={handleBack} />
        <main className="flex-1 container mx-auto px-4 py-8 flex flex-col items-center">
          <InterviewTimer 
            initialTimer={selectedTimer}
            onSave={handleSaveTimer}
            onCancel={handleBack}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            My Timers
          </h1>
          <Button onClick={handleNewTimer} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Timer
          </Button>
        </div>
        <SavedTimers onSelect={handleSelectTimer} onDelete={handleDeleteTimer} />
      </main>
    </div>
  );
}