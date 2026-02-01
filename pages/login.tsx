import { useState } from 'react'
import { signup, signin } from '@/lib/auth'
import { useRouter } from 'next/router'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleSignin = async () => {
    const { error } = await signin(email, password)
    if (!error) router.push('/')
  }

  const handleSignup = async () => {
    const { error } = await signup(email, password)
    if (!error) router.push('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-80 space-y-4">
        <h1 className="text-xl font-bold text-center">Login</h1>

        <input
          className="w-full border p-2"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full border p-2"
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="w-full bg-black text-white p-2"
          onClick={handleSignin}
        >
          Sign In
        </button>

        <button
          className="w-full border p-2"
          onClick={handleSignup}
        >
          Sign Up
        </button>
      </div>
    </div>
  )
}
