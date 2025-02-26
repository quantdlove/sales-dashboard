import { createClient } from '@supabase/supabase-js'

export async function GET() {
  // 1) Grab environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  // 2) Create Supabase client with the service_role key
  const supabase = createClient(supabaseUrl, serviceRoleKey)

  // 3) Query your "Leads" table
  const { data, error } = await supabase
    .from('Leads')
    .select('*') // or specify columns, e.g. .select('id, name, ...')
    // .order('id', { ascending: false }) // optional: sort by ID descending

  // 4) Handle any errors
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // 5) Return the data as JSON
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
