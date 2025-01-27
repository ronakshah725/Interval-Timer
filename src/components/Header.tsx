"use client"

import { ChevronLeft, Timer } from 'lucide-react';
import { Button } from './ui/button';

interface HeaderProps {
  showBack?: boolean;
  onBack?: () => void;
}

export function Header({ showBack, onBack }: HeaderProps) {
  return (
    <div className="w-full border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {showBack && (
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          <div className="flex items-center gap-2">
            <Timer className="h-6 w-6 text-blue-500" />
            <span className="text-xl font-bold">IntervalTimer</span>
          </div>
        </div>
      </div>
    </div>
  );
}