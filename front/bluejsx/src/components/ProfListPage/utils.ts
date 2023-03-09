import { supabase } from "../../utils/auth"
import { Users } from "../../utils/utils"
export const getFriendList = async () => {

  const { error, data: friends } = await supabase.rpc('get_friend_list')
  if (error) {
    return []
  }
  return friends

}
export function getPosition(level: number, numItems: number) {
  if (numItems === 1) {
    level = - 1 / (1 + 3 ** level)
  } else {
    level = level % numItems;
    if (level < 0) {
      level += numItems;
    }
  }
  const a = level * numItems / 5 - 6
  return [-(a ** 3 + a + 400), 100 - level * 10]
}