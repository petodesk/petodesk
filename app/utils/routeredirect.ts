export const getDashboardRoute = (role: string) => {
  if (role.startsWith('peto_')) return '/admindash'
  return '/dashboard'
}