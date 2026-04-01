import fs from 'fs';
import path from 'path';
import { Post } from '@/types';

const dataDir = path.join(process.cwd(), 'data');
const dataPath = path.join(dataDir, 'posts.json');

const SAMPLE: Post[] = [
  {
    id: 1,
    title: '게시판에 오신 것을 환영합니다!',
    author: '관리자',
    content: 'DemoBoard에 오신 것을 환영합니다.\n\n이 게시판은 Next.js + Tailwind CSS + TypeScript로 만들어진 데모 게시판입니다.\n자유롭게 글을 작성하고, 수정하고, 삭제해 보세요.',
    createdAt: new Date('2026-03-01').toISOString(),
    views: 42,
  },
  {
    id: 2,
    title: 'Next.js App Router 사용법',
    author: '개발자',
    content: 'Next.js 14의 App Router를 사용하면 서버 컴포넌트와 클라이언트 컴포넌트를 효율적으로 나눌 수 있습니다.\n\n- 서버 컴포넌트: 데이터 페칭, 레이아웃\n- 클라이언트 컴포넌트: 상호작용, 상태 관리',
    createdAt: new Date('2026-03-10').toISOString(),
    views: 18,
  },
  {
    id: 3,
    title: 'Tailwind CSS 팁 모음',
    author: '디자이너',
    content: 'Tailwind CSS는 유틸리티 퍼스트 CSS 프레임워크입니다.\n\n자주 쓰는 클래스:\n- flex, grid: 레이아웃\n- text-sm, font-bold: 타이포그래피\n- bg-blue-600, text-white: 색상\n- rounded, shadow: 스타일',
    createdAt: new Date('2026-03-20').toISOString(),
    views: 31,
  },
];

export function getPosts(): Post[] {
  if (!fs.existsSync(dataPath)) {
    savePosts(SAMPLE);
    return [...SAMPLE];
  }
  try {
    return JSON.parse(fs.readFileSync(dataPath, 'utf-8')) as Post[];
  } catch {
    return [];
  }
}

export function getPost(id: number): Post | null {
  return getPosts().find((p) => p.id === id) ?? null;
}

export function savePosts(posts: Post[]): void {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  fs.writeFileSync(dataPath, JSON.stringify(posts, null, 2));
}

export function createPost(data: Omit<Post, 'id' | 'createdAt' | 'views'>): Post {
  const posts = getPosts();
  const id = posts.length > 0 ? Math.max(...posts.map((p) => p.id)) + 1 : 1;
  const post: Post = { id, ...data, createdAt: new Date().toISOString(), views: 0 };
  savePosts([...posts, post]);
  return post;
}

export function updatePost(
  id: number,
  data: Partial<Omit<Post, 'id' | 'createdAt' | 'views'>>
): Post | null {
  const posts = getPosts();
  const idx = posts.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  posts[idx] = { ...posts[idx], ...data };
  savePosts(posts);
  return posts[idx];
}

export function deletePost(id: number): boolean {
  const posts = getPosts();
  const filtered = posts.filter((p) => p.id !== id);
  if (filtered.length === posts.length) return false;
  savePosts(filtered);
  return true;
}

export function incrementViews(id: number): void {
  const posts = getPosts();
  const idx = posts.findIndex((p) => p.id === id);
  if (idx !== -1) {
    posts[idx].views++;
    savePosts(posts);
  }
}
