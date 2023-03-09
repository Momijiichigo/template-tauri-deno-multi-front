import { User } from "@supabase/supabase-js"
import { AttrHolder, useAttrs } from "bluejsx"
import { supabase } from "./auth"

export type Users = {
    id: string,
    name: string,
    at_id: string,
    status: "shy" | "moderate" | "friendly",
    friends: string[],
    online: boolean
}
export type Locations = {
    id: string,
    location: string,
    nearby: string[],
}
export const getUsersTable = () => supabase.from<Users>('users')

export const myInfo = new AttrHolder() as AttrHolder<Users>
useAttrs(myInfo, {
    name: "",
    id: "",
    at_id: "",
    status: "",
    friends: [],
})
/**@ts-ignore */
window.myInfo=myInfo
export const setUpMyInfo = async (id: string) => {
    const { data, error } = await supabase
        .from<Users>('users')
        .select('id, name, at_id, status, friends')
        .eq('id', /* supabase.auth.user(). */id)
        .single()
    if(error){
        console.error(error)
        return;
    }
    
    myInfo.name = data.name
    myInfo.id = data.id
    myInfo.at_id = data.at_id
    myInfo.status = data.status
    myInfo.friends = data.friends
}

