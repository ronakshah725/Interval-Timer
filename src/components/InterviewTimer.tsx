"use client"

import React, {useEffect, useState} from 'react';
import {Clock, Moon, Pause, Play, Plus, RotateCcw, Settings, Sun, X} from 'lucide-react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {useTheme} from 'next-themes';

type TimerBlock = {
  id: string;
  title: string;
  duration: number;
  notes: string[];
  color: string;
  order: number;
};

const DEFAULT_COLORS = [
  'blue',
  'green',
  'yellow',
  'purple',
  'pink'
];

const InterviewTimer = () => {
  const [blocks, setBlocks] = useState<TimerBlock[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentBlock, setCurrentBlock] = useState(0);
  const [isEditing, setIsEditing] = useState(true);
  const [timerName, setTimerName] = useState('');
  const [totalDuration, setTotalDuration] = useState(0);
  const { theme, setTheme } = useTheme();

  const updateTotalDuration = (updatedBlocks: TimerBlock[]) => {
    const total = updatedBlocks.reduce((sum, block) => sum + block.duration, 0);
    setTotalDuration(total);
  };

  const addBlock = () => {
    const newBlock: TimerBlock = {
      id: Date.now().toString(),
      title: `Block ${blocks.length + 1}`,
      duration: 300,
      notes: [],
      color: DEFAULT_COLORS[blocks.length % DEFAULT_COLORS.length],
      order: blocks.length
    };
    const updatedBlocks = [...blocks, newBlock];
    setBlocks(updatedBlocks);
    updateTotalDuration(updatedBlocks);
  };

  const removeBlock = (index: number) => {
    const updatedBlocks = blocks.filter((_, i) => i !== index)
      .map((block, i) => ({ ...block, order: i }));
    setBlocks(updatedBlocks);
    updateTotalDuration(updatedBlocks);
  };

  const updateBlock = (index: number, field: keyof TimerBlock, value: any) => {
    const updatedBlocks = [...blocks];
    updatedBlocks[index] = { ...updatedBlocks[index], [field]: value };
    setBlocks(updatedBlocks);
    if (field === 'duration') {
      updateTotalDuration(updatedBlocks);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getBlockProgress = (blockIndex: number) => {
    let startTime = 0;
    for (let i = 0; i < blockIndex; i++) {
      startTime += blocks[i].duration;
    }
    const blockTime = currentTime - startTime;
    return Math.min(100, Math.max(0, (blockTime / blocks[blockIndex].duration) * 100));
  };

  const getBlockElapsedTime = (blockIndex: number) => {
    let startTime = 0;
    for (let i = 0; i < blockIndex; i++) {
      startTime += blocks[i].duration;
    }
    return Math.max(0, Math.min(blocks[blockIndex].duration, currentTime - startTime));
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1;
          let timeSum = 0;
          
          for (let i = 0; i < blocks.length; i++) {
            timeSum += blocks[i].duration;
            if (newTime <= timeSum) {
              setCurrentBlock(i);
              break;
            }
          }
          
          if (newTime >= timeSum) {
            setIsRunning(false);
            return timeSum;
          }
          return newTime;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, blocks]);

  if (isEditing) {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-2">
            <CardTitle>Interview Timer Setup</CardTitle>
            <CardDescription>
              Total Duration: {formatTime(totalDuration)}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
            <Button 
              onClick={() => blocks.length > 0 && setIsEditing(false)}
              disabled={blocks.length === 0}
            >
              Start Timer
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Input
            value={timerName}
            onChange={(e) => setTimerName(e.target.value)}
            placeholder="Timer Name"
            className="font-medium"
          />
          
          <div className="space-y-4">
            {blocks.map((block, index) => (
              <Card key={block.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    <div className={`w-2 h-8 rounded bg-${block.color}-500`} />
                    <Input
                      value={block.title}
                      onChange={(e) => updateBlock(index, 'title', e.target.value)}
                      className="max-w-[200px]"
                      placeholder="Block Title"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <Input
                      type="number"
                      value={Math.floor(block.duration / 60)}
                      onChange={(e) => updateBlock(index, 'duration', parseInt(e.target.value) * 60)}
                      className="w-20"
                      min="1"
                    />
                    <span className="text-sm text-gray-500">min</span>
                    <Button 
                      variant="ghost"
                      size="icon"
                      onClick={() => removeBlock(index)}
                      className="text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          <Button 
            variant="outline" 
            onClick={addBlock} 
            className="w-full flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" /> Add Block
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle>{timerName}</CardTitle>
          <CardDescription className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {formatTime(currentTime)} / {formatTime(totalDuration)}
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
          <Button
            size="icon"
            onClick={() => setIsRunning(!isRunning)}
          >
            {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button
            size="icon"
            onClick={() => {
              setIsRunning(false);
              setCurrentTime(0);
              setCurrentBlock(0);
            }}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            onClick={() => setIsEditing(true)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {blocks.map((block, index) => {
            const progress = getBlockProgress(index);
            const elapsedTime = getBlockElapsedTime(index);
            
            return (
              <Card 
                key={block.id}
                className={`p-4 ${currentBlock === index ? 'border-2 dark:border-white border-gray-900' : ''}`}
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium dark:text-white">{block.title}</h3>
                    <div className="flex items-center gap-2 text-sm dark:text-gray-300 text-gray-600">
                      <span>{formatTime(elapsedTime)}</span>
                      <span>/</span>
                      <span>{formatTime(block.duration)}</span>
                    </div>
                  </div>
                  <div className="relative w-full h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <div
                      className={`absolute inset-0 transition-all duration-1000 ease-linear bg-${block.color}-500 dark:bg-${block.color}-400`}
                      style={{
                        width: `${progress}%`
                      }}
                    />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default InterviewTimer;