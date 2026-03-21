


export function formatDate(dateString: string) {
  if (!dateString) return "-"

  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateForAnnouncements(dateString: string) {
  if (!dateString) return "-"

  const date = new Date(dateString)

  const formatted = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  const now = new Date()
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

  let timeAgo = ""

  if (diff < 60) timeAgo = "now"
  else if (diff < 3600) timeAgo = `${Math.floor(diff / 60)} min ago`
  else if (diff < 86400) timeAgo = `${Math.floor(diff / 3600)} h ago`
  else if (diff < 604800) timeAgo = `${Math.floor(diff / 86400)} day(s) ago`

  return `${formatted} • ${timeAgo}`
}