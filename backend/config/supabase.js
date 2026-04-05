import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://lalyadvbvsozuzqlmzxk.supabase.co'
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_LH-CUzA3Bezhd2_Mtt4ENA_4FClO11g'

export const supabase = createClient(supabaseUrl, supabaseKey)
