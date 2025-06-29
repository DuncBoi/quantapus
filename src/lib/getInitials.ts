import type { User } from '@supabase/supabase-js'

export function getInitials(user: User) {

    const display: string = user.user_metadata?.full_name
    ?? user.user_metadata?.name
    ?? user.email

  return display
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}
