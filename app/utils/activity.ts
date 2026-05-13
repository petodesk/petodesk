export async function touchCompanyActivity({
  supabase,
  company_id,
  user_id,
  activity,
}: any) {
  const { error } = await supabase.rpc('touch_company_activity', {
    p_company_id: company_id,
    p_user_id: user_id,
    p_activity: activity,
  })

  if (error) {
    console.error('touchCompanyActivity error:', error)
    throw error
  }
}