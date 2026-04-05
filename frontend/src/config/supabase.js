import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lalyadvbvsozuzqlmzxk.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_LH-CUzA3Bezhd2_Mtt4ENA_4FClO11g'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
