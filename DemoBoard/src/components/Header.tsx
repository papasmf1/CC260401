import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-blue-700 text-white shadow-md">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold tracking-tight hover:text-blue-200 transition-colors">
          📋 DemoBoard
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="hover:text-blue-200 transition-colors">
            게시판
          </Link>
          <Link
            href="/posts/new"
            className="bg-white text-blue-700 px-4 py-1.5 rounded font-semibold hover:bg-blue-50 transition-colors"
          >
            글쓰기
          </Link>
        </nav>
      </div>
    </header>
  );
}
