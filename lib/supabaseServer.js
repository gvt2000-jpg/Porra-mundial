<<<<<<< HEAD
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const hasServiceKey = Boolean(serviceRoleKey && !serviceRoleKey.includes('your-service-role-key'))
const apiKey = hasServiceKey ? serviceRoleKey : anonKey

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is required to initialize Supabase.')
}
if (!apiKey) {
  throw new Error('Supabase API key is missing. Set SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local.')
}
if (!hasServiceKey && serviceRoleKey) {
  console.warn('Using publishable/anon key because SUPABASE_SERVICE_ROLE_KEY appears to be a placeholder or invalid value.')
}

export const supabase = createClient(supabaseUrl, apiKey)
export const isUsingServiceRole = hasServiceKey
=======
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const hasServiceKey = Boolean(serviceRoleKey && !serviceRoleKey.includes('your-service-role-key'))
const apiKey = hasServiceKey ? serviceRoleKey : anonKey

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is required to initialize Supabase.')
}
if (!apiKey) {
  throw new Error('Supabase API key is missing. Set SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local.')
}
if (!hasServiceKey && serviceRoleKey) {
  console.warn('Using publishable/anon key because SUPABASE_SERVICE_ROLE_KEY appears to be a placeholder or invalid value.')
}

export const supabase = createClient(supabaseUrl, apiKey)
export const isUsingServiceRole = hasServiceKey
>>>>>>> f84f3f17b3d1d09e667e64e5fdd030f9dd1d3ae4
