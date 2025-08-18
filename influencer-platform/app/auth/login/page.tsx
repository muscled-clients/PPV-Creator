import { LoginForm } from '@/components/auth/login-form'
import { LogIn } from 'lucide-react'

export const metadata = {
  title: 'Login - Influencer Platform',
  description: 'Sign in to your account',
}

export default function LoginPage() {
  return (
    <div>
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 mb-4">
          <LogIn className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome Back!
        </h2>
        <p className="text-gray-600">
          Sign in to access your dashboard
        </p>
      </div>
      <LoginForm />
    </div>
  )
}