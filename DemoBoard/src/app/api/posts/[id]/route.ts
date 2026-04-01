import { NextResponse } from 'next/server';
import { getPost, updatePost, deletePost } from '@/lib/store';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const post = getPost(Number(params.id));
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(post);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json();
  const post = updatePost(Number(params.id), body);
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(post);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const ok = deletePost(Number(params.id));
  if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
