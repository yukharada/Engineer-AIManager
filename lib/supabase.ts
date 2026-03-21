import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  // Only throw in browser environment to avoid build issues if envs are missing during static analysis
  if (typeof window !== 'undefined') {
    console.warn('Supabase環境変数が設定されていません');
  }
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder');

// 個人用アプリなので、固定のユーザーIDを使用
// 本番環境では認証後の実際のユーザーIDを使用することを推奨
export const FIXED_USER_ID = 'c0a80121-0000-0000-0000-000000000001';
