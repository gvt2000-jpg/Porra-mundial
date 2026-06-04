import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local')
  if (!fs.existsSync(envPath)) return {}
  const text = fs.readFileSync(envPath, 'utf8')
  return text.split(/\r?\n/).reduce((acc, line) => {
    const match = line.match(/^\s*([^#][^=]*)=(.*)$/)
    if (!match) return acc
    acc[match[1].trim()] = match[2].trim()
    return acc
  }, {})
}

const env = loadEnv()
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local or environment')
}

const supabase = createClient(supabaseUrl, supabaseKey)
const url = 'https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_qualification'

const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`)
const html = await res.text()
let idx = html.indexOf('id="Qualified_teams"')
if (idx === -1) idx = html.indexOf('Qualified teams')
if (idx === -1) throw new Error('Qualified teams section not found')
const section = html.slice(idx, idx + 120000)

const regex = /<th scope="row" data-sort-value="[^"]*">([\s\S]*?)<\/th>/g
const teams = []
let match
while ((match = regex.exec(section)) !== null) {
  const block = match[1]
  const labelMatch = block.match(/<a [^>]*>([^<]+)<\/a>/)
  const label = labelMatch ? labelMatch[1].trim() : block.replace(/<[^>]+>/g, '').trim()
  if (label && !teams.includes(label)) teams.push(label)
}

if (teams.length === 0) throw new Error('No teams parsed from qualification page')
console.log(`Found ${teams.length} team names`)
console.log(teams.join('\n'))

const rows = teams.map((name) => ({ name }))
const { data, error } = await supabase.from('teams').upsert(rows, { onConflict: 'name' })
if (error) throw error
console.log(`Upserted ${data?.length ?? 0} teams`)
