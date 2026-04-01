import { getSupabase } from './supabase';
import { Post } from '@/types';

function toPost(row: Record<string, unknown>): Post {
  return {
    id: row.id as number,
    title: row.title as string,
    author: row.author as string,
    content: row.content as string,
    createdAt: row.created_at as string,
    views: row.views as number,
  };
}

export async function getPosts(): Promise<Post[]> {
  const { data, error } = await getSupabase()
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(toPost);
}

export async function getPost(id: number): Promise<Post | null> {
  const { data, error } = await getSupabase()
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return null;
  return toPost(data);
}

export async function createPost(
  input: Omit<Post, 'id' | 'createdAt' | 'views'>
): Promise<Post> {
  const { data, error } = await getSupabase()
    .from('posts')
    .insert({ title: input.title, author: input.author, content: input.content })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return toPost(data);
}

export async function updatePost(
  id: number,
  input: Partial<Omit<Post, 'id' | 'createdAt' | 'views'>>
): Promise<Post | null> {
  const { data, error } = await getSupabase()
    .from('posts')
    .update(input)
    .eq('id', id)
    .select()
    .single();
  if (error) return null;
  return toPost(data);
}

export async function deletePost(id: number): Promise<boolean> {
  const { error } = await getSupabase().from('posts').delete().eq('id', id);
  return !error;
}

export async function incrementViews(id: number): Promise<void> {
  await getSupabase().rpc('increment_views', { post_id: id });
}
