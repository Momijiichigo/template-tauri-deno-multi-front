import { FuncCompParam, getRefs, useAttrs } from "bluejsx"
import { signInWithGoogle, supabase } from "../../utils/auth"
import { LoadingScreen } from "../App"
import style from './index.module.scss'
export const SignInPage = ({ loadingScreen }: FuncCompParam<{
  loadingScreen: ReturnType<typeof LoadingScreen>
}>) => {
  const refs = getRefs<{
    emailForm: 'form'
    emailInput: 'input'
    passwordInput: 'input'
    
  }>()
  const self = <div class={style.container}>
    <div class={style.options}>
      <form ref={[refs, 'emailForm']} class={style.emailForm}>
        <label>Sign In/Up with email verification</label>
        <input ref={[refs, 'emailInput']} type="email" placeholder="Email" />
        <input ref={[refs, 'passwordInput']} type="password" placeholder="Password" />
        <input type="submit" value="Send" />
      </form>
      <hr class={style.or_bar}/>
      <span class={`${style.button} ${style.google}`} onclick={signInWithGoogle}>G</span>
    </div>
  </div>
  const { emailForm, emailInput, passwordInput } = refs
  useAttrs(self, {
    hide: ()=>{}
  })
  emailForm.addEventListener('submit', async (event) => {
    event.preventDefault()
    loadingScreen.show = true
    loadingScreen.status = 'loading'
    const emailAndPass = {
      email: emailInput.value,
      password: passwordInput.value
    }
    const { user, error } = await supabase.auth.signIn(emailAndPass, {
      shouldCreateUser: true,
    })
    if (error) {
      console.error('log in failed... trying creating user')
      const { user, error } = await supabase.auth.signUp(emailAndPass)
      if (error) {
        console.error(error)
        loadingScreen.status = 'error'
        setTimeout(()=>loadingScreen.show = false, 1000)
        return;
      }
      location.reload()
    } else {
      loadingScreen.show = false
      self.hide()
    }
    //   const { user, error } = await supabase.auth.signUp({
    //     email,
    //     password,
    //   })
    // if(await signInWithEmail(emailInput.value, passwordInput.value)){
    //   loadingScreen.show = false
    //   self.hide()
    // } else {
    //   loadingScreen.status = 'error'
    //   // location.reload()
    // }
  })

  

  return self
}