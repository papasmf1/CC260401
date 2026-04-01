import { NextResponse } from 'next/server';
import { getPosts, createPost } from '@/lib/store';

export async function GET() {
  return NextResponse.json(getPosts());
}

export async function POST(request: Request) {
  const body = await request.json();
  const { title, author, content } = body;
  if (!title || !author || !content) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  const post = createPost({ title, author, content });
  return NextResponse.json(post, { status: 201 });
}
