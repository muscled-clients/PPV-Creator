'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signIn } from '@/lib/auth/actions'
import toast from 'react-hot-toast'
import { Mail, Lock, Eye, EyeOff, ArrowRight, Fingerprint } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional()
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true)
    
    try {
      const result = await signIn({
        email: data.email,
        password: data.password
      })

      if (result.error) {
        if (result.needsConfirmation) {
          toast.error(result.error, {
            duration: 6000,
            icon: '📧'
          })
        } else if (result.isPending) {
          toast(result.error, {
            icon: '⏳',
            duration: 6000,
            style: {
              background: '#FEF3C7',
              color: '#92400E',
              border: '1px solid #FCD34D'
            }
          })
        } else if (result.isSuspended) {
          toast.error(result.error, {
            icon: '🚫',
            duration: 6000
          })
        } else {
          toast.error(result.error)
        }
      } else if (result.success && result.redirectPath) {
        toast.success('Welcome back!', {
          icon: '👋'
        })
        router.push(result.redirectPath)
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
      console.error('Login error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email Address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-4 w-4 text-gray-400" />
          </div>
          <input
            {...register('email')}
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400"
            disabled={loading}
          />
        </div>
        {errors.email && (
          <p className="mt-1 text-xs text-red-600 animate-fade-in">{errors.email.message}</p>
        )}
      </div>

      {/* Password Field */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-4 w-4 text-gray-400" />
          </div>
          <input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            className="pl-10 pr-10 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400"
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center transition-colors"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            ) : (
              <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-xs text-red-600 animate-fade-in">{errors.password.message}</p>
        )}
      </div>

      {/* Remember Me & Forgot Password */}
      <div className="flex items-center justify-between">
        <div className="flex items-center group">
          <input
            {...register('rememberMe')}
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors"
            disabled={loading}
          />
          <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700 group-hover:text-gray-900 transition-colors cursor-pointer">
            Remember me
          </label>
        </div>

        <a href="/auth/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
          Forgot password?
        </a>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full relative group overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 p-[2px] transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
      >
        <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg px-4 py-3 text-white font-medium transition-all duration-300 flex items-center justify-center">
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Signing in...
            </>
          ) : (
            <>
              Sign In
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </div>
      </button>

      {/* Security Notice */}
      <div className="flex items-center justify-center text-xs text-gray-500 space-x-1">
        <Fingerprint className="w-3 h-3" />
        <span>Secured with 256-bit encryption</span>
      </div>

      {/* Sign Up Link */}
      <div className="text-center text-sm text-gray-600 pt-4">
        Don't have an account?{' '}
        <a href="/auth/register" className="font-medium text-blue-600 hover:text-blue-700 transition-colors">
          Sign up for free
        </a>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </form>
  )
}