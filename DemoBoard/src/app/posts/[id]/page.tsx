import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPost, incrementViews } from '@/lib/store';
import DeleteButton from '@/components/DeleteButton';

export const dynamic = 'force-dynamic';

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default async function PostPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (isNaN(id)) notFound();

  await incrementViews(id);
  const post = await getPost(id);
  if (!post) notFound();

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      {/* 제목 영역 */}
      <div className="px-6 py-5 border-b bg-gray-50">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">{post.title}</h1>
        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
          <span>
            작성자:{' '}
            <strong className="text-gray-700 font-semibold">{post.author}</strong>
          </span>
          <span>작성일: {formatDate(post.createdAt)}</span>
          <span>조회수: {post.views}</span>
        </div>
      </div>

      {/* 본문 */}
      <div className="px-6 py-8 min-h-48 text-gray-700 whitespace-pre-wrap leading-relaxed text-[15px]">
        {post.content}
      </div>

      {/* 하단 버튼 */}
      <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
        <Link
          href="/"
          className="text-sm text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-1"
        >
          ← 목록으로
        </Link>
        <div className="flex gap-2">
          <Link
            href={`/posts/${post.id}/edit`}
            className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
          >
            수정
          </Link>
          <DeleteButton id={post.id} />
        </div>
      </div>
    </div>
  );
}
