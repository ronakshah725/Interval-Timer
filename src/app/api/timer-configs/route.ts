import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TimerConfig } from '@/lib/utils/types';

export async function GET() {
  try {
    const configs = await prisma.timerConfig.findMany({
      include: {
        blocks: {
          orderBy: { order: 'asc' }
        }
      }
    });
    
    return NextResponse.json(configs);
  } catch (error) {
    console.error('Failed to fetch timers:', error);
    return new NextResponse(
      JSON.stringify({ message: 'Failed to fetch timers' }), 
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data: TimerConfig = await request.json();

    if (data.id) {
      // Update existing timer
      try {
        // First delete existing blocks
        await prisma.timerBlock.deleteMany({
          where: { timerConfigId: data.id }
        });

        // Then update timer with new blocks
        const updatedConfig = await prisma.timerConfig.update({
          where: { id: data.id },
          data: {
            name: data.name,
            blocks: {
              create: data.blocks.map(block => ({
                title: block.title,
                duration: block.duration,
                notes: block.notes || [],
                color: block.color,
                order: block.order
              }))
            }
          },
          include: { blocks: true }
        });

        return NextResponse.json(updatedConfig);
      } catch (updateError) {
        console.error('Failed to update timer:', updateError);
        return new NextResponse(
          JSON.stringify({ message: 'Failed to update timer' }), 
          { status: 500 }
        );
      }
    }

    // Create new timer
    const newConfig = await prisma.timerConfig.create({
      data: {
        name: data.name,
        blocks: {
          create: data.blocks.map(block => ({
            title: block.title,
            duration: block.duration,
            notes: block.notes || [],
            color: block.color,
            order: block.order
          }))
        }
      },
      include: { blocks: true }
    });

    return NextResponse.json(newConfig);
  } catch (error) {
    console.error('Failed to process timer:', error);
    return new NextResponse(
      JSON.stringify({ message: 'Failed to process timer request' }), 
      { status: 500 }
    );
  }
}