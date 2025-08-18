'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signUp } from '@/lib/auth/actions'
import { UserRole } from '@/lib/types/database'
import toast from 'react-hot-toast'
import { User, Building2, Mail, Lock, UserCircle, CheckCircle, Eye, EyeOff } from 'lucide-react'

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters').optional().or(z.literal('')),
  role: z.enum(['influencer', 'brand'] as const),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and conditions'
  })
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
})

type RegisterFormData = z.infer<typeof registerSchema>

export function RegisterForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [previousRole, setPreviousRole] = useState<string>('influencer')
  const [formCleared, setFormCleared] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    getValues,
    formState: { errors }
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'influencer',
      fullName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false
    }
  })

  const selectedRole = watch('role')
  const password = watch('password')
  
  // Calculate password strength
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0)
      return
    }
    
    let strength = 0
    if (password.length >= 8) strength++
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++
    if (password.match(/[0-9]/)) strength++
    if (password.match(/[^a-zA-Z0-9]/)) strength++
    
    setPasswordStrength(strength)
  }, [password])
  
  // Handle role change - clear ALL fields when switching roles
  useEffect(() => {
    if (selectedRole !== previousRole) {
      // Clear ALL form fields when switching roles
      setValue('fullName', '')
      setValue('username', '')
      setValue('email', '')
      setValue('password', '')
      setValue('confirmPassword', '')
      setValue('agreeToTerms', false)
      setPreviousRole(selectedRole)
      
      // Show notification that form was cleared
      setFormCleared(true)
      setTimeout(() => setFormCleared(false), 2000)
    }
  }, [selectedRole, previousRole, setValue])

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true)
    
    try {
      const result = await signUp({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        username: data.username,
        role: data.role as UserRole
      })

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Registration successful! Please check your email to verify your account.')
        router.push('/auth/login')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
      console.error('Registration error:', error)
    } finally {
      setLoading(false)
    }
  }

  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500']
  const strengthTexts = ['Weak', 'Fair', 'Good', 'Strong']

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Role Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          I want to join as
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="relative cursor-pointer">
            <input
              type="radio"
              {...register('role')}
              value="influencer"
              className="sr-only peer"
              id="role-influencer"
            />
            <div className="p-4 border-2 rounded-xl transition-all duration-200 peer-checked:border-purple-500 peer-checked:bg-gradient-to-br peer-checked:from-purple-50 peer-checked:to-pink-50 hover:border-gray-300 border-gray-200 group">
              <div className="flex items-center justify-between mb-2">
                <User className="w-5 h-5 text-purple-600 group-peer-checked:text-purple-700" />
                <div className="w-5 h-5 rounded-full border-2 border-gray-300 peer-checked:border-purple-500 peer-checked:bg-purple-500 flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100" />
                </div>
              </div>
              <div className="font-semibold text-gray-900">Influencer</div>
              <div className="text-xs text-gray-500 mt-1">Create & Earn</div>
            </div>
          </label>
          
          <label className="relative cursor-pointer">
            <input
              type="radio"
              {...register('role')}
              value="brand"
              className="sr-only peer"
              id="role-brand"
            />
            <div className="p-4 border-2 rounded-xl transition-all duration-200 peer-checked:border-blue-500 peer-checked:bg-gradient-to-br peer-checked:from-blue-50 peer-checked:to-indigo-50 hover:border-gray-300 border-gray-200 group">
              <div className="flex items-center justify-between mb-2">
                <Building2 className="w-5 h-5 text-blue-600 group-peer-checked:text-blue-700" />
                <div className="w-5 h-5 rounded-full border-2 border-gray-300 peer-checked:border-blue-500 peer-checked:bg-blue-500 flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100" />
                </div>
              </div>
              <div className="font-semibold text-gray-900">Brand</div>
              <div className="text-xs text-gray-500 mt-1">Launch Campaigns</div>
            </div>
          </label>
        </div>
        {formCleared && (
          <div className="mt-2 text-center">
            <p className="text-xs text-blue-600 animate-pulse">
              Form cleared for {selectedRole === 'brand' ? 'Brand' : 'Influencer'} registration
            </p>
          </div>
        )}
      </div>

      {/* Full Name */}
      <div key={`fullName-${selectedRole}`}>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
          {selectedRole === 'brand' ? 'Company Name' : 'Full Name'}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {selectedRole === 'brand' ? (
              <Building2 className="h-4 w-4 text-gray-400" />
            ) : (
              <UserCircle className="h-4 w-4 text-gray-400" />
            )}
          </div>
          <input
            {...register('fullName')}
            type="text"
            autoComplete={selectedRole === 'brand' ? 'organization' : 'name'}
            placeholder={selectedRole === 'brand' ? 'Your company name' : 'Your full name'}
            className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            disabled={loading}
          />
        </div>
        {errors.fullName && (
          <p className="mt-1 text-xs text-red-600">{errors.fullName.message}</p>
        )}
      </div>

      {/* Username (optional for influencers) */}
      {selectedRole === 'influencer' && (
        <div key="username-field">
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            Username <span className="text-gray-400">(optional)</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">@</span>
            </div>
            <input
              {...register('username')}
              type="text"
              autoComplete="username"
              placeholder="username"
              className="pl-8 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              disabled={loading}
            />
          </div>
          {errors.username && (
            <p className="mt-1 text-xs text-red-600">{errors.username.message}</p>
          )}
        </div>
      )}

      {/* Email */}
      <div key={`email-${selectedRole}`}>
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
            className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            disabled={loading}
          />
        </div>
        {errors.email && (
          <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div key={`password-${selectedRole}`}>
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
            autoComplete="new-password"
            placeholder="••••••••"
            className="pl-10 pr-10 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            ) : (
              <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            )}
          </button>
        </div>
        {password && (
          <div className="mt-2">
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                <div 
                  className={`h-1.5 rounded-full transition-all duration-300 ${strengthColors[passwordStrength - 1] || 'bg-gray-200'}`}
                  style={{ width: `${(passwordStrength / 4) * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-600">
                {strengthTexts[passwordStrength - 1] || 'Too weak'}
              </span>
            </div>
          </div>
        )}
        {errors.password && (
          <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
        )}
      </div>

      {/* Confirm Password */}
      <div key={`confirmPassword-${selectedRole}`}>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
          Confirm Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-4 w-4 text-gray-400" />
          </div>
          <input
            {...register('confirmPassword')}
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="••••••••"
            className="pl-10 pr-10 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            ) : (
              <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>
        )}
      </div>

      {/* Terms and Conditions */}
      <div className="flex items-start" key={`terms-${selectedRole}`}>
        <input
          {...register('agreeToTerms')}
          type="checkbox"
          className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors"
          disabled={loading}
        />
        <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-700">
          I agree to the{' '}
          <a href="/terms" className="text-blue-600 hover:text-blue-700 font-medium">
            Terms
          </a>{' '}
          and{' '}
          <a href="/privacy" className="text-blue-600 hover:text-blue-700 font-medium">
            Privacy Policy
          </a>
        </label>
      </div>
      {errors.agreeToTerms && (
        <p className="text-xs text-red-600">{errors.agreeToTerms.message}</p>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full relative group overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 p-[2px] transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg px-4 py-3 text-white font-medium transition-all duration-300">
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Creating account...
            </div>
          ) : (
            'Create Account'
          )}
        </div>
      </button>

      {/* Sign In Link */}
      <p className="text-center text-sm text-gray-600">
        Already have an account?{' '}
        <a href="/auth/login" className="font-medium text-blue-600 hover:text-blue-700 transition-colors">
          Sign in
        </a>
      </p>
    </form>
  )
}