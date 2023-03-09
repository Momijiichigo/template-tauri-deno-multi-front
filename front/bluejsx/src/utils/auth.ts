import { createClient } from '@supabase/supabase-js'
import { getUsersTable } from './utils'

// Create a single supabase client for interacting with your database 
export const supabase = createClient(
  'https://crgizxfojqxddyrlenta.supabase.co',
  import.meta.env.VITE_SUPABASE_KEY
)

export async function signInWithGoogle() {
  const { user, session, error } = await supabase.auth.signIn({
    provider: 'google',
  })

}

export enum TFErr {
  True, False, Error
}
export const userExists = async () => {
  const { data, error } = await getUsersTable()
    .select('id')
    .eq('id', supabase.auth.user().id)
  if (error) {
    console.error(error)
    return TFErr.Error;
  }
  if (data.length === 0) {
    return TFErr.False;
  }
  return TFErr.True;
}
