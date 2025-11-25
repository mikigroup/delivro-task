import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

console.log('[SUPABASE SERVER] Initializing...');
console.log('[SUPABASE SERVER] URL exists:', !!supabaseUrl);
console.log('[SUPABASE SERVER] URL length:', supabaseUrl?.length || 0);
console.log('[SUPABASE SERVER] Service role key exists:', !!supabaseServiceRoleKey);
console.log('[SUPABASE SERVER] Service role key length:', supabaseServiceRoleKey?.length || 0);

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('[SUPABASE SERVER] Missing environment variables!');
  throw new Error('Missing Supabase environment variables');
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

console.log('[SUPABASE SERVER] Client created successfully');

