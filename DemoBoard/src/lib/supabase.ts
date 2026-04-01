import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_client) {
    const url =
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.SUPABASE_URL;
    const key =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
      process.env.SUPABASE_PUBLISHABLE_DEFAULT_KEY;
    if (!url || !key) {
      throw new Error(
        'Supabase 환경변수가 설정되지 않았습니다. ' +
        'NEXT_PUBLIC_SUPABASE_URL 과 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY 를 확인하세요.'
      );
    }
    _client = createClient(url, key);
  }
  return _client;
}
