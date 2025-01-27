import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const configs = await prisma.timerConfig.findMany({
    include: {
      blocks: {
        orderBy: {
          order: 'asc'
        }
      }
    }
  });
  return NextResponse.json(configs);
}

export async function POST(request: Request) {
  const data = await request.json();
  const config = await prisma.timerConfig.create({
    data: {
      name: data.name,
      blocks: {
        create: data.blocks.map((block: any) => ({
          title: block.title,
          duration: block.duration,
          notes: block.notes,
          color: block.color,
          order: block.order
        }))
      }
    },
    include: { blocks: true }
  });
  return NextResponse.json(config);
}