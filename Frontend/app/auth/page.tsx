import AuthCard from '../../components/auth/AuthCard'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-4 py-16 ">
      {/* Heading */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-white mb-3">Welcome back</h1>
        <p className="text-gray-400 text-sm">
          Enter your details to access your GreenCity portal.
        </p>
      </div>

      {/* Auth Card */}
      <AuthCard />

      {/* Legal */}
      <p className="mt-8 text-xs text-gray-500 text-center max-w-sm">
        By continuing, you agree to GreenCity&apos;s{' '}
        <Link
          href="/terms"
          className="text-gray-300 underline underline-offset-2 hover:text-white"
        >
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link
          href="/privacy"
          className="text-gray-300 underline underline-offset-2 hover:text-white"
        >
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  )
}
