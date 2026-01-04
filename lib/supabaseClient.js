import { createClient } from '@supabase/supabase-js';

// Hardcoded for immediate usage
const supabaseUrl = 'https://csiaklwrdesznpwkpbei.supabase.co';
const supabaseAnonKey = 'sb_publishable_Sxix9MEjztWB0BHanMuM3A_jtkT2oh2';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
