'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/contexts/AuthContext'
import { Eye, EyeOff, LogIn, UserPlus, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'

const loginSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(6, 'パスワードは6文字以上で入力してください'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const { signIn, signUp, resetPassword } = useAuth()
  const router = useRouter()
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setError(null)
    setLoading(true)

    try {
      if (isSignUp) {
        await signUp(data.email, data.password)
      } else {
        await signIn(data.email, data.password)
      }
      router.push('/dashboard')
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'エラーが発生しました'
      if (errorMessage.includes('auth/user-not-found')) {
        setError('ユーザーが見つかりません')
      } else if (errorMessage.includes('auth/wrong-password')) {
        setError('パスワードが正しくありません')
      } else if (errorMessage.includes('auth/email-already-in-use')) {
        setError('このメールアドレスは既に使用されています')
      } else if (errorMessage.includes('auth/invalid-credential')) {
        setError('メールアドレスまたはパスワードが正しくありません')
      } else {
        setError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    const email = getValues('email')
    if (!email) {
      setError('メールアドレスを入力してください')
      return
    }

    setLoading(true)
    try {
      await resetPassword(email)
      setResetSent(true)
      setError(null)
    } catch {
      setError('パスワードリセットメールの送信に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              Yamaguchi Project Manager
            </h1>
            <p className="text-gray-500 mt-2">
              {isSignUp ? '新規アカウント作成' : 'ログイン'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Reset Password Success */}
          {resetSent && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
              パスワードリセットメールを送信しました
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス
              </label>
              <div className="relative">
                <input
                  type="email"
                  {...register('email')}
                  className={cn(
                    'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors',
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  )}
                  placeholder="example@company.com"
                />
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                パスワード
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className={cn(
                    'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors pr-12',
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  )}
                  placeholder="6文字以上"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            {!isSignUp && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={handleResetPassword}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  パスワードを忘れた場合
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={cn(
                'w-full py-3 px-4 rounded-lg font-medium text-white flex items-center justify-center gap-2 transition-colors',
                loading
                  ? 'bg-primary-400 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700'
              )}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isSignUp ? (
                <>
                  <UserPlus className="w-5 h-5" />
                  アカウント作成
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  ログイン
                </>
              )}
            </button>
          </form>

          {/* Toggle */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError(null)
                setResetSent(false)
              }}
              className="text-sm text-gray-600 hover:text-primary-600"
            >
              {isSignUp
                ? '既にアカウントをお持ちの方はこちら'
                : '新規アカウントを作成'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-4">
          膜構造プロジェクト管理システム
        </p>
      </div>
    </div>
  )
}
