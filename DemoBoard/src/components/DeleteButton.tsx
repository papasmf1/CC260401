'use client';

import { useRouter } from 'next/navigation';

export default function DeleteButton({ id }: { id: number }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    await fetch(`/api/posts/${id}`, { method: 'DELETE' });
    router.push('/');
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
    >
      삭제
    </button>
  );
}
