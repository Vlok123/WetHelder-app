'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { Scale, Users, MessageSquare, BarChart3, TrendingUp, Calendar, Shield, Briefcase, User, Gavel, FileText } from 'lucide-react'
import Link from 'next/link'

interface AdminStats {
  totalUsers: number
  totalConversations: number
  totalMessages: number
  usersByProfession: { profession: string; count: number; name: string }[]
  recentUsers: { name: string; email: string; createdAt: string; profession: string }[]
  conversationsToday: number
  messagesThisWeek: number
  averageMessagesPerConversation: number
}

const PROFESSION_ICONS = {
  general: User,
  lawyer: Briefcase,
  police: Shield,
  judge: Gavel,
  civil_servant: FileText
}

const PROFESSION_NAMES = {
  general: 'Algemeen publiek',
  lawyer: 'Advocaat',
  police: 'Politieagent', 
  judge: 'Rechter/Jurist',
  civil_servant: 'Ambtenaar'
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Simple admin check - you can change this email to your admin email
  const isAdmin = session?.user?.email === 'admin@example.com' || 
                   session?.user?.email === 'your-email@domain.com' ||
                   session?.user?.email === 'sanderhelmink@gmail.com'

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session || !isAdmin) {
      setLoading(false)
      return
    }

    fetchStats()
  }, [session, status, isAdmin])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        setError('Fout bij het laden van statistieken')
      }
    } catch (err) {
      setError('Netwerk fout')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-legal-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-legal-50 flex items-center justify-center">
        <div className="text-center">
          <Scale className="mx-auto h-12 w-12 text-legal-400 mb-4" />
          <h1 className="text-2xl font-bold text-legal-900 mb-2">Admin Dashboard</h1>
          <p className="text-legal-600 mb-6">Je moet ingelogd zijn om het admin dashboard te bekijken</p>
          <Link
            href="/auth/signin"
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Inloggen
          </Link>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-legal-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-red-400 mb-4" />
          <h1 className="text-2xl font-bold text-red-900 mb-2">Geen toegang</h1>
          <p className="text-red-600 mb-6">Je hebt geen admin rechten om dit dashboard te bekijken</p>
          <Link
            href="/"
            className="px-6 py-3 bg-legal-600 text-white rounded-lg hover:bg-legal-700 transition-colors"
          >
            Terug naar Chat
          </Link>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-legal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-700">{error}</p>
            <button 
              onClick={fetchStats}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Opnieuw proberen
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-legal-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-legal-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-primary-600" />
            <div>
              <h1 className="text-2xl font-bold text-legal-900">Admin Dashboard</h1>
              <p className="text-legal-600 text-sm">Statistieken & Gebruikersbeheer</p>
            </div>
          </div>
          <Link
            href="/"
            className="px-4 py-2 bg-legal-100 hover:bg-legal-200 rounded-lg transition-colors text-legal-700"
          >
            ← Terug naar Chat
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {stats && (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-legal-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-legal-600">Totaal Gebruikers</p>
                    <p className="text-3xl font-bold text-legal-900">{stats.totalUsers}</p>
                  </div>
                  <Users className="w-8 h-8 text-primary-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border border-legal-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-legal-600">Conversaties</p>
                    <p className="text-3xl font-bold text-legal-900">{stats.totalConversations}</p>
                  </div>
                  <MessageSquare className="w-8 h-8 text-primary-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border border-legal-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-legal-600">Totaal Berichten</p>
                    <p className="text-3xl font-bold text-legal-900">{stats.totalMessages}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-primary-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border border-legal-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-legal-600">Vandaag</p>
                    <p className="text-3xl font-bold text-legal-900">{stats.conversationsToday}</p>
                    <p className="text-xs text-legal-500">nieuwe gesprekken</p>
                  </div>
                  <Calendar className="w-8 h-8 text-primary-600" />
                </div>
              </div>
            </div>

            {/* Profession Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-legal-200">
                <h3 className="text-lg font-semibold text-legal-900 mb-4">Gebruikers per Beroep</h3>
                <div className="space-y-3">
                  {stats.usersByProfession.map((item) => {
                    const Icon = PROFESSION_ICONS[item.profession as keyof typeof PROFESSION_ICONS] || User
                    const percentage = Math.round((item.count / stats.totalUsers) * 100)
                    
                    return (
                      <div key={item.profession} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5 text-primary-600" />
                          <span className="text-sm font-medium text-legal-700">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-24 bg-legal-200 rounded-full h-2">
                            <div 
                              className="bg-primary-600 h-2 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold text-legal-900 w-8">{item.count}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Usage Stats */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-legal-200">
                <h3 className="text-lg font-semibold text-legal-900 mb-4">Gebruiksstatistieken</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-legal-50 rounded-lg">
                    <span className="text-sm font-medium text-legal-700">Berichten deze week</span>
                    <span className="text-lg font-bold text-primary-600">{stats.messagesThisWeek}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-legal-50 rounded-lg">
                    <span className="text-sm font-medium text-legal-700">Gem. berichten per gesprek</span>
                    <span className="text-lg font-bold text-primary-600">{stats.averageMessagesPerConversation}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-legal-50 rounded-lg">
                    <span className="text-sm font-medium text-legal-700">Gesprekken vandaag</span>
                    <span className="text-lg font-bold text-primary-600">{stats.conversationsToday}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Users */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-legal-200">
              <h3 className="text-lg font-semibold text-legal-900 mb-4">Recente Gebruikers</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-legal-200">
                      <th className="text-left py-3 px-4 font-medium text-legal-700">Naam</th>
                      <th className="text-left py-3 px-4 font-medium text-legal-700">Email</th>
                      <th className="text-left py-3 px-4 font-medium text-legal-700">Beroep</th>
                      <th className="text-left py-3 px-4 font-medium text-legal-700">Aangemeld</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentUsers.map((user, index) => {
                      const Icon = PROFESSION_ICONS[user.profession as keyof typeof PROFESSION_ICONS] || User
                      
                      return (
                        <tr key={index} className="border-b border-legal-100">
                          <td className="py-3 px-4 text-legal-900">{user.name}</td>
                          <td className="py-3 px-4 text-legal-600">{user.email}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4 text-primary-600" />
                              <span className="text-legal-700">
                                {PROFESSION_NAMES[user.profession as keyof typeof PROFESSION_NAMES]}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-legal-600">
                            {new Date(user.createdAt).toLocaleDateString('nl-NL')}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
} 