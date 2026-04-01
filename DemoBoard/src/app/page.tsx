import Link from 'next/link';
import { getPosts } from '@/lib/store';

const PAGE_SIZE = 10;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

interface HomeProps {
  searchParams: { q?: string; page?: string };
}

export default function HomePage({ searchParams }: HomeProps) {
  const q = searchParams.q ?? '';
  const page = Math.max(1, Number(searchParams.page ?? 1));

  let posts = getPosts().slice().reverse();
  if (q) {
    posts = posts.filter(
      (p) =>
        p.title.includes(q) ||
        p.author.includes(q) ||
        p.content.includes(q)
    );
  }

  const total = posts.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const paginated = posts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      {/* 상단 헤더 */}
      <div className="px-6 py-4 border-b flex items-center justify-between bg-gray-50">
        <h1 className="text-lg font-bold text-gray-800">자유게시판</h1>
        <span className="text-sm text-gray-500">총 {total}개의 글</span>
      </div>

      {/* 검색 */}
      <div className="px-6 py-3 border-b">
        <form method="get" className="flex gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="제목, 작성자, 내용 검색..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
          >
            검색
          </button>
          {q && (
            <Link
              href="/"
              className="px-3 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
            >
              초기화
            </Link>
          )}
        </form>
      </div>

      {/* 게시글 테이블 */}
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-gray-500 text-xs uppercase border-b">
            <th className="w-14 py-3 text-center">번호</th>
            <th className="py-3 text-left px-4">제목</th>
            <th className="w-24 py-3 text-center">작성자</th>
            <th className="w-28 py-3 text-center">작성일</th>
            <th className="w-14 py-3 text-center">조회</th>
          </tr>
        </thead>
        <tbody>
          {paginated.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-20 text-center text-gray-400">
                {q ? `"${q}"에 대한 검색 결과가 없습니다.` : '게시글이 없습니다.'}
              </td>
            </tr>
          ) : (
            paginated.map((post, i) => (
              <tr
                key={post.id}
                className="border-b last:border-0 hover:bg-blue-50 transition-colors"
              >
                <td className="py-3 text-center text-gray-400">
                  {total - (page - 1) * PAGE_SIZE - i}
                </td>
                <td className="py-3 px-4">
                  <Link
                    href={`/posts/${post.id}`}
                    className="text-gray-800 hover:text-blue-600 font-medium transition-colors"
                  >
                    {post.title}
                  </Link>
                </td>
                <td className="py-3 text-center text-gray-600">{post.author}</td>
                <td className="py-3 text-center text-gray-500">{formatDate(post.createdAt)}</td>
                <td className="py-3 text-center text-gray-400">{post.views}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="py-4 flex justify-center gap-1 border-t">
          {page > 1 && (
            <Link
              href={`/?page=${page - 1}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
              className="px-3 py-1.5 border rounded text-sm text-gray-600 hover:bg-gray-100"
            >
              이전
            </Link>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/?page=${p}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
              className={`px-3 py-1.5 rounded text-sm border ${
                p === page
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {p}
            </Link>
          ))}
          {page < totalPages && (
            <Link
              href={`/?page=${page + 1}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
              className="px-3 py-1.5 border rounded text-sm text-gray-600 hover:bg-gray-100"
            >
              다음
            </Link>
          )}
        </div>
      )}

      {/* 하단 글쓰기 */}
      <div className="px-6 py-4 border-t flex justify-end bg-gray-50">
        <Link
          href="/posts/new"
          className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          글쓰기
        </Link>
      </div>
    </div>
  );
}
