import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.timerBlock.deleteMany({
      where: { timerConfigId: params.id }
    });
    
    await prisma.timerConfig.delete({
      where: { id: params.id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete timer' }, { status: 500 });
  }
}