export async function logActivity({
  supabase,
  company_id,
  user_id,
  action_type,
  module,
  description,
  metadata = {}
}: any) {
  await supabase.from('activity_logs').insert({
    company_id,
    user_id,
    action_type,
    module,
    description,
    metadata
  })
}


