import { getRefs } from "bluejsx"
import { supabase } from "../../utils/auth"
import style from "./index.module.scss"
export const SettingsPage = () => {
  const refs = getRefs<{
    container: 'div'
  }>()
  const self = <div class={style.container}>
    <button onclick={()=>{
      supabase.auth.signOut()
    }}>sign out</button>
  </div>

  return self
}