import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/router'
import { createPost, getPosts } from '@/lib/posts'
import { signout } from '@/lib/auth'

export default function Home() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [content, setContent] = useState('')
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        router.push('/login')
        return
      }

      setUser(data.user)

      const { data: posts } = await getPosts()
      setPosts(posts || [])
      setLoading(false)
    }

    init()
  }, [])

  const submitPost = async () => {
  try {
    await createPost(content)
    setContent('')
    const { data } = await getPosts()
    setPosts(data || [])
  } catch (err) {
    console.error('POST FAILED:', err)
    alert('Post failed — check console')
  }
}


  if (loading) return <p className="p-6">Loading...</p>

  return (
    <div className="p-6 max-w-xl mx-auto space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Feed</h1>
        <button
          className="border px-3 py-1 text-sm"
          onClick={async () => {
            await signout()
            router.push('/login')
          }}
        >
          Logout
        </button>
      </div>

      <textarea
        className="w-full border p-2"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind?"
      />

      <button
        className="bg-black text-white px-4 py-2"
        onClick={submitPost}
      >
        Post
      </button>

      <div className="space-y-2">
        {posts.map((p) => (
          <div key={p.id} className="border p-2">
            {p.content}
          </div>
        ))}
      </div>
    </div>
  )
}
