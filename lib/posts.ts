import { supabase } from './supabase'

export const createPost = async (content: string) => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase.from('posts').insert([
    {
      content,
      author_type: 'human',
      author_id: user.id, // MUST be user.id (not string)
    },
  ])

  if (error) {
    console.error('INSERT ERROR:', error)
    throw error
  }

  return data
}

export const getPosts = async () => {
  return supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })
}
