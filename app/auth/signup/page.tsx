'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Scale, Mail, Lock, User, Briefcase } from 'lucide-react'
import Link from 'next/link'

interface Profession {
  id: string
  name: string
  icon: React.ComponentType<any>
}

const PROFESSIONS: Profession[] = [
  { id: 'general', name: 'Algemeen publiek', icon: User },
  { id: 'lawyer', name: 'Advocaat', icon: Briefcase },
  { id: 'police', name: 'Politieagent', icon: Scale },
  { id: 'judge', name: 'Rechter/Jurist', icon: Scale },
  { id: 'civil_servant', name: 'Ambtenaar', icon: User }
]

export default function SignUp() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    profession: 'general'
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Wachtwoorden komen niet overeen')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Wachtwoord moet minimaal 6 tekens bevatten')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          profession: formData.profession
        })
      })

      const data = await response.json()

      if (response.ok) {
        // Auto-login after successful registration
        const result = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false,
        })

        if (result?.error) {
          setError('Account aangemaakt, maar kon niet automatisch inloggen')
        } else {
          router.push('/')
        }
      } else {
        setError(data.error || 'Er is een fout opgetreden')
      }
    } catch (err) {
      setError('Er is een fout opgetreden')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/' })
  }

  return (
    <div className="min-h-screen bg-legal-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Scale className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-6 text-3xl font-bold text-legal-900">
            Account aanmaken
          </h2>
          <p className="mt-2 text-sm text-legal-600">
                              Start met de Nederlandse juridische assistent
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="sr-only">Naam</label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-legal-400" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-legal-300 placeholder-legal-500 text-legal-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Volledige naam"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="sr-only">E-mailadres</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-legal-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-legal-300 placeholder-legal-500 text-legal-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="E-mailadres"
                />
              </div>
            </div>

            <div>
              <label htmlFor="profession" className="block text-sm font-medium text-legal-700 mb-1">
                Beroep
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-3 h-5 w-5 text-legal-400" />
                <select
                  id="profession"
                  name="profession"
                  value={formData.profession}
                  onChange={handleInputChange}
                  className="appearance-none relative block w-full pl-10 pr-8 py-3 border border-legal-300 text-legal-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  {PROFESSIONS.map(prof => (
                    <option key={prof.id} value={prof.id}>
                      {prof.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="sr-only">Wachtwoord</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-legal-400" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-legal-300 placeholder-legal-500 text-legal-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Wachtwoord (min. 6 tekens)"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="sr-only">Bevestig wachtwoord</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-legal-400" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-legal-300 placeholder-legal-500 text-legal-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Bevestig wachtwoord"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Account aanmaken...' : 'Account aanmaken'}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-legal-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-legal-50 text-legal-500">Of</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="group relative w-full flex justify-center py-3 px-4 border border-legal-300 text-sm font-medium rounded-lg text-legal-700 bg-white hover:bg-legal-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Registreren met Google
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-legal-600">
              Al een account?{' '}
              <Link href="/auth/signin" className="font-medium text-blue-600 hover:text-blue-500">
                Inloggen
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
} 