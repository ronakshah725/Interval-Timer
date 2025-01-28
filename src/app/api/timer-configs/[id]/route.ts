import {NextRequest, NextResponse} from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    await prisma.timerBlock.deleteMany({
      where: { timerConfigId: id }
    });

    await prisma.timerConfig.delete({
      where: { id: id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: 'Failed to delete timer' }, { status: 500 });
  }
}