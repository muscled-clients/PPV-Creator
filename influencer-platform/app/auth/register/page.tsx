import { RegisterForm } from '@/components/auth/register-form'
import { Sparkles } from 'lucide-react'

export const metadata = {
  title: 'Register - Influencer Platform',
  description: 'Create your account as an influencer or brand',
}

export default function RegisterPage() {
  return (
    <div>
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 mb-4">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Join Our Community
        </h2>
        <p className="text-gray-600">
          Start your journey as an influencer or brand today
        </p>
      </div>
      <RegisterForm />
    </div>
  )
}