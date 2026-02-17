import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/router'
import { createPost, getPosts, deletePost, updatePost } from '@/lib/posts'
import { signout } from '@/lib/auth'

export default function Home() {
  const router = useRouter()

  const [user, setUser] = useState<any>(null)
  const [content, setContent] = useState('')
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')

  useEffect(() => {
    let channel: any

    const init = async () => {
      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        router.push('/login')
        return
      }

      setUser(data.user)

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle()

      if (!profile) {
        router.push('/setup')
        return
      }

      const { data: posts } = await getPosts()
      setPosts(posts || [])
      setLoading(false)

      channel = supabase
        .channel('posts-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'posts' },
          async () => {
            const { data } = await getPosts()
            setPosts(data || [])
          }
        )
        .subscribe()
    }

    init()

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [])

  const submitPost = async () => {
    if (!content.trim()) return

    try {
      await createPost(content)
      setContent('')
    } catch (err) {
      console.error('POST FAILED:', err)
      alert('Post failed — check console')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading feed...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">
            🚀 DevFeed
          </h1>

          <button
            className="bg-white border px-4 py-1.5 rounded-lg text-sm hover:bg-gray-100 transition"
            onClick={async () => {
              await signout()
              router.push('/login')
            }}
          >
            Logout
          </button>
        </div>

        {/* Create Post */}
        <div className="bg-white p-4 rounded-xl shadow-sm space-y-3">
          <textarea
            className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-black"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
          />

          <div className="flex justify-end">
            <button
              className="bg-black text-white px-5 py-2 rounded-lg hover:opacity-90 transition"
              onClick={submitPost}
            >
              Post
            </button>
          </div>
        </div>

        {/* Posts */}
        <div className="space-y-4">
          {posts.map((p) => (
            <div
              key={p.id}
              className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition space-y-3"
            >
              <div className="text-sm font-medium text-gray-700">
                @{p.profiles?.username}
              </div>

              {editingId === p.id ? (
                <>
                  <textarea
                    className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-black"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                  />

                  <div className="space-x-4">
                    <button
                      className="text-green-600 text-sm hover:underline"
                      onClick={async () => {
                        await updatePost(p.id, editContent)
                        setEditingId(null)
                      }}
                    >
                      Save
                    </button>

                    <button
                      className="text-gray-500 text-sm hover:underline"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-gray-800">{p.content}</div>
              )}

              {user && p.author_id === user.id && (
                <div className="space-x-4">
                  <button
                    className="text-blue-600 text-sm hover:underline"
                    onClick={() => {
                      setEditingId(p.id)
                      setEditContent(p.content)
                    }}
                  >
                    Edit
                  </button>

                  <button
                    className="text-red-500 text-sm hover:underline"
                    onClick={async () => {
                      await deletePost(p.id)
                    }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
