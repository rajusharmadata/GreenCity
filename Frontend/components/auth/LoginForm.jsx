'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { EmailInput, PasswordInput } from '../ui/InputField'
import SocialLogin from './SocialLogin'
import { login } from '../../utils/api'
export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      router.push('/dashboard')
    } catch (err) {
      const message =
        err?.response?.data?.error ||
        err?.message ||
        'Unable to login. Please try again.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <EmailInput value={email} onChange={(e) => setEmail(e.target.value)} />
      <PasswordInput
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error && (
        <p className="text-sm text-red-400 bg-red-950/40 border border-red-700/40 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-400 hover:bg-green-300 text-gray-900 font-bold py-3.5 rounded-xl transition-colors duration-200 text-sm tracking-wide mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>

      <SocialLogin />
    </form>
  )
}
