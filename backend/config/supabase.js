import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://eguwujzkvtoovqwenexi.supabase.co'
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_St5sfTBT5KWo_87quXBFfw_rhqnErF6'

export const supabase = createClient(supabaseUrl, supabaseKey)
