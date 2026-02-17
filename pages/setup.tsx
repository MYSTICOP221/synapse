import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/router"

export default function Setup() {
  const [username, setUsername] = useState("")
  const router = useRouter()

  const handleSubmit = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/login")
      return
    }

    const { error } = await supabase.from("profiles").insert([
      {
        id: user.id,
        username,
      },
    ])

    if (error) {
      alert(error.message)
      return
    }

    router.push("/")
  }

  return (
    <div className="p-6 max-w-md mx-auto space-y-4">
      <h1 className="text-xl font-bold">Choose a Username</h1>

      <input
        className="w-full border p-2"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
      />

      <button
        className="bg-black text-white px-4 py-2"
        onClick={handleSubmit}
      >
        Save
      </button>
    </div>
  )
}
