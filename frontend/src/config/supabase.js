import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://eguwujzkvtoovqwenexi.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_St5sfTBT5KWo_87quXBFfw_rhqnErF6'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
