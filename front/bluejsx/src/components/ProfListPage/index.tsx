import { FuncCompParam, getRefs, useConstProps } from "bluejsx"
import { supabase } from "../../utils/auth";
// import { ProfInfo, Sex } from "../../utils/profInfo"
import style from "./index.module.scss"
import { getFriendList, getPosition } from "./utils";

interface ProfInfo {
  id: string,
  name: string,
  card?: ReturnType<typeof ProfileCard>
}
const WSR = 0.6; //window shrink ratio
const WXR = 50;

export const ProfileCard = ({ profInfo }: FuncCompParam<{ profInfo: ProfInfo }>) => {
  const refs = getRefs<{
    cover: 'div',
  }>()
  const self = <div class={style.card}>
    <div ref={[refs, 'cover']} class={style.cover}>
      <h1>{profInfo.name}</h1>
      <h2>@{profInfo.id}</h2>
    </div>
  </div>
  const { cover } = refs
  useConstProps(self, {
    setPosLevel(level: number, numItems: number) {
      // if (level > 5 || level < -5) {
      //     self.style.visibility = 'hidden'
      // } else {
      const [y, z] = getPosition(level, numItems)

      self.style.visibility = 'visible'
      self.style.transform = `scale(${WSR}, ${WSR}) translateY(${y}px) translateZ(${z}px)`
      // }
    }
  })
  cover.onclick = () => {
    alert('show profile: '+profInfo.name)
  }
  return self
}
let SCROLL_RATIO = 100 / screen.width / WSR / WXR;
export const ProfListPage = () => {
  const refs = getRefs<{
    searchInput: 'input'
    profList: 'div'
  }>()
  const self = <div class={style.container}>
    <input type="text" placeholder='Search' class={style.search_input} ref={[refs, 'searchInput']} />
    <div class={style.prof_list} ref={[refs, 'profList']}>
    </div>
  </div>
  const { profList, searchInput } = refs
  let scrollYStart = 0
  let scrollLevel = 0

  let profiles: ProfInfo[] = [
    { id: 'loading', name: 'Loading...' },
  ]
  let shownProfiles: ProfInfo[] = profiles
  supabase.auth.onAuthStateChange((event) => {
    if (event !== 'SIGNED_OUT') {
      getFriendList().then(friends => {
        profiles.forEach(prof => {
          prof.card?.remove()
        })
        profiles = friends.map(({ at_id, name }) => ({ id: at_id, name }))
        initAllProfiles()
      })
    }
  })
  function addProfile(profInfo: ProfInfo) {
    const card = <ProfileCard profInfo={profInfo} />
    profList.appendChild(card)
    profInfo.card = card as ReturnType<typeof ProfileCard>
  }
  function scroll(level: number) {
    shownProfiles.forEach((value, index) => value.card?.setPosLevel(level + index, shownProfiles.length))
  }
  function initAllProfiles() {
    profiles.forEach(value => addProfile(value))
    shownProfiles = profiles
    scroll(0)
  }
  initAllProfiles()
  useConstProps(self, {
    addProfile,
  })
  profList.addEventListener('touchstart', event => {
    scrollYStart = event.changedTouches[0].screenY * SCROLL_RATIO
    profList.classList.add(style.scrolling)
  })
  profList.addEventListener('touchmove', event => {
    event.preventDefault();
    const moveLength = scrollYStart - event.changedTouches[0].screenY * SCROLL_RATIO + scrollLevel;
    scroll(moveLength)
  })
  profList.addEventListener('touchend', event => {
    scrollLevel = Math.round(scrollYStart - event.changedTouches[0].screenY * SCROLL_RATIO + scrollLevel) % shownProfiles.length;
    profList.classList.remove(style.scrolling)
    if (shownProfiles.length === 1) {
      scrollLevel = 0
    }
    scroll(scrollLevel)
  })
  searchInput.oninput = (e) => {
    scrollLevel = 0
    const searchText = searchInput.value.toLowerCase()
    if (searchText === '') {
      shownProfiles = profiles
      profiles.forEach(value => value.card.style.opacity = '1')
    } else {
      shownProfiles = []
      profiles.forEach(value => {
        if (
          value.name.toLowerCase().includes(searchText)
          || value.id.toLowerCase().includes(searchText)
        ) {
          shownProfiles.push(value)
          value.card.style.opacity = '1'
        } else {
          value.card.style.opacity = '0'
        }
      })
    }
    scroll(0)
  }

  return self
}