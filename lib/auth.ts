import {supabase} from  './supabase'

export const signup = async (email: string, password: string) => {
  const res = await supabase.auth.signUp({ email, password })
  console.log('SIGNUP FULL RESPONSE:', res)
  return res
}


export const signin= async(email:string,password:string) => {
    return supabase.auth.signInWithPassword({email,password})
    

}

export const signout = async () => {
    return supabase.auth.signOut()
}