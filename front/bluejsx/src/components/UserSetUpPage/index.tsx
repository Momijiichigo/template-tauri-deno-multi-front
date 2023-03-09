import { FuncCompParam, getRefs, useAttrs } from "bluejsx"
import { supabase } from "../../utils/auth"
import { getUsersTable, setUpMyInfo, Users } from "../../utils/utils"
import { LoadingScreen } from "../App"
import style from './index.module.scss'

export const UserSetUpPage = ({ loadingScreen }: FuncCompParam<{
  loadingScreen: ReturnType<typeof LoadingScreen>
}>) => {
  const refs = getRefs<{
    uinfoForm: 'form'
    nameInput: 'input'
    idInput: 'input'
  }>()
  const self = <div class={style.container}>
    <div class={style.slide_container}>
      <section>
        <div class={style.center}>
          <h1>Let's set up your account</h1>
        </div>
      </section>
      <section>
        <div class={style.center}>
          <h1>Account Information</h1>
          <form ref={[refs, 'uinfoForm']}>
            <div>
              <label for='name'>Account Name</label>
              <input ref={[refs, 'nameInput']} type='text' id='name' />
            </div>
            <div>
              <label for='account_id'>Account ID</label>
              <input ref={[refs, 'idInput']} type='text' id='account_id' />
            </div>
            <input type="submit" value="Next" />
          </form>
        </div>
      </section>
    </div>
  </div>
  const { uinfoForm, nameInput, idInput } = refs
  useAttrs(self, {
    hide: ()=>{}
  })
  uinfoForm.addEventListener('submit', async (event) => {
    event.preventDefault()
    loadingScreen.show = true
    loadingScreen.status = 'loading'
    const { data, error } = await supabase.rpc('at_id_exists', {
      req_id: idInput.value
    })
    if (error) {
      console.error(error)
      loadingScreen.status = 'error'
      return;
    }
    if (data) {
      alert('Account ID already exists')
      idInput.value = ''
      loadingScreen.show = false
      return;
    }
    const id = supabase.auth.user().id
    await getUsersTable().insert([{
      id,
      name: nameInput.value,
      at_id: idInput.value,
      status: 'moderate',
      friends: []
    }], {
      returning: 'minimal'
    })
    self.hide()
    setUpMyInfo(id)
    loadingScreen.show = false
  })
  return self
}