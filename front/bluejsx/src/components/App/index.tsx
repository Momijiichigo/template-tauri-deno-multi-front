import { Some, None, Option } from 'rusty-enums'
import { useAttrs, useConstProps } from 'bluejsx'
import { supabase, TFErr, userExists } from '../../utils/auth'
import MapPage from '../MapPage'
import Menu from '../Menu'
import Pages from '../Pages'
import { ProfListPage } from '../ProfListPage'
import { SettingsPage } from '../SettingsPage'
import { SignInPage } from '../SignInPage'
import { UserSetUpPage } from '../UserSetUpPage'
import style from './index.module.scss'
import { getUsersTable, setUpMyInfo, Users } from '../../utils/utils'


export default () => {
  /*  class={style.app_container} */
  const self = <div>
    <Pages ref='pages'>
      <MapPage ref='map' />
      <ProfListPage />
      <SettingsPage />
    </Pages>
    <Menu ref='menu'>
      <span class="material-symbols-outlined">
        map
      </span>
      <span class="material-symbols-outlined">
        web_stories
      </span>
      <span class="material-symbols-outlined">
        settings
      </span>
    </Menu>
    <LoadingScreen ref='loadingScreen' />
  </div>
  const { pages, menu, loadingScreen, map } = self.refs<{
    pages: typeof Pages,
    menu: typeof Menu,
    map: typeof MapPage,
    loadingScreen: typeof LoadingScreen,
  }>()

  menu.pageSetter = pages.switchPage
  useConstProps(self, {
    /**
     * Adds a page that will be displayed at the most front of the screen.
     * 
     * Tip: In the `getPage` function, define an empty property `hide`
     *  to the returning page object. This property will be replaced
     *  with actual-working function and be usable inside of `getPage`.
     * 
     * ```ts
     * const page = () =>{
     * }
     * ```
     * 
     * @param getPage a function that returns a page to be displayed.
     * @returns 
     */
    addFixedPage(getPage: () => Blue.JSX.Element & { hide?: () => void }) {
      const container = <div></div>
      self.append(container)
      container.classList.add(style.fixed_page, style.hide)

      let content: Option<Blue.JSX.Element> = None
      const hide = () => {
        container.classList.add(style.hide)
      }
      return {
        hide,
        show() {
          content.if_let('None', () => {
            const elem = container.appendChild(getPage())
            if ('hide' in elem) {
              elem.hide = hide
            }
            content = Some(elem)
          })
          container.classList.remove(style.hide)
        }
      }
    }
  })
  const getSignInPage = () => <SignInPage loadingScreen={loadingScreen} />
  const { show: showSignin, hide: hideSignin } = self.addFixedPage(getSignInPage)
  const getUserSetUpPage = () => <UserSetUpPage loadingScreen={loadingScreen} /> as ReturnType<typeof UserSetUpPage>

  const { show: showUserSetUp } = self.addFixedPage(getUserSetUpPage)
  const onAuthChange = async (_event: AuthChangeEvent, session: Session) => {
    loadingScreen.show = true
    if (session) {
      console.log('signed in');
      const user_exists = await userExists()
      if (user_exists === TFErr.Error) {
        loadingScreen.status = 'error'
      } else if (user_exists === TFErr.False) {
        hideSignin()
        showUserSetUp()
        setTimeout(() => {
          loadingScreen.show = false
        }, 500);
      } else {
        // user is created and signed in
        loadingScreen.show = false
        hideSignin()
        setUpMyInfo(session.user.id)
        map.updating = true
        const { data, error } = await getUsersTable()
          .update({
            online: true
          }, {
            returning: 'minimal'
          })
          .eq('id', supabase.auth.user().id)
      }


    } else {
      console.log('signed out');
      loadingScreen.show = false
      showSignin()
    }
  }
  supabase.auth.onAuthStateChange(onAuthChange)
  onAuthChange(null, supabase.auth.session())

  return self
}
const notifyOffline = async () => {
  async () => {
    const { data, error } = await getUsersTable()
      .upsert({
        online: false
      })
      .eq('id', supabase.auth.user().id)
  }
}
addEventListener('beforeunload', notifyOffline)


  type LoadStatus = 'loading' | 'loaded' | 'error'
export const LoadingScreen = () => {

  const statusIconId = new Text('autorenew')
  const message = new Text('Loading...')
  const self = <div class={style.loading_screen}>
    <div class={style.center_box}>
      <label>{message}</label>
      <span class="material-symbols-outlined status">
        {statusIconId}
      </span>
    </div>
  </div>
  useAttrs(self, {
    show: false,
    status: 'loading' as LoadStatus,
    message: 'Loading...' as string,
  })
  self.watch('show', show => {
    if (show) {
      self.classList.remove(style.hide)
    } else {
      self.classList.add(style.hide)
    }
  })
  self.watch('message', txt => {
    message.data = txt
  })
  self.watch('status', status => {
    switch (status) {
      case 'loading':
        statusIconId.data = 'autorenew'
        self.message = 'Loading...'
        break;
      case 'error':
        statusIconId.data = 'error'
        self.message = 'Error'
        break;
      default:
        break;
    }

  })

  return self
}
