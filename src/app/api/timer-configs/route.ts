import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TimerBlock } from "@/lib/utils/types";

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
    return NextResponse.json(
      { message: 'Failed to fetch timers' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (data.id) {
      // Update existing timer
      try {
        await prisma.timerBlock.deleteMany({
          where: { timerConfigId: data.id }
        });

        const updatedConfig = await prisma.timerConfig.update({
          where: { id: data.id },
          data: {
            name: data.name,
            blocks: {
              create: data.blocks.map((block: TimerBlock) => ({
                title: block.title,
                duration: block.duration,
                notes: JSON.stringify(block.notes || []),
                color: block.color,
                order: block.order
              }))
            }
          },
          include: { blocks: true }
        });

        console.log('Updated config:', updatedConfig);  // Debug log
        return NextResponse.json(updatedConfig);
      } catch (updateError) {
        console.error('Update error:', updateError);  // Debug log
        return NextResponse.json(
          { message: 'Failed to update timer', error: updateError }, 
          { status: 500 }
        );
      }
    } else {
      // Create new timer
      const newConfig = await prisma.timerConfig.create({
        data: {
          name: data.name,
          blocks: {
            create: data.blocks.map((block: TimerBlock) => ({
              title: block.title,
              duration: block.duration,
              notes: JSON.stringify(block.notes || []),
              color: block.color,
              order: block.order
            }))
          }
        },
        include: { blocks: true }
      });

      console.log('Created config:', newConfig);  // Debug log
      return NextResponse.json(newConfig);
    }
  } catch (error) {
    console.error('Save error:', error);  // Debug log
    return NextResponse.json(
      { message: 'Failed to save timer', error: String(error) }, 
      { status: 500 }
    );
  }
}