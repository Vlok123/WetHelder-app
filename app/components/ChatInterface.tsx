'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Send, Scale, AlertCircle, ExternalLink, User, Briefcase, Shield, Gavel, FileText, LogOut, History, BarChart3, MessageSquare, Menu, X, Plus, Home, Search, Loader2, Trash2, Edit3, Crown, CheckCircle } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import ChatSidebar from './ChatSidebar'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant' | 'system'
  timestamp: Date
}

interface Profession {
  id: string
  name: string
  icon: React.ComponentType<any>
  description: string
}

interface Conversation {
  id: string
  title: string
  messages: Message[]
  lastMessage: Date
}

const PROFESSIONS: Profession[] = [
  { id: 'general', name: 'Algemeen publiek', icon: User, description: 'Algemene juridische vragen' },
  { id: 'lawyer', name: 'Advocaat', icon: Briefcase, description: 'Professionele juridische praktijk' },
  { id: 'police', name: 'Politieagent', icon: Shield, description: 'Handhaving en opsporingsbevoegdheden' },
  { id: 'judge', name: 'Rechter/Jurist', icon: Gavel, description: 'Rechtspraak en juridische interpretatie' },
  { id: 'civil_servant', name: 'Ambtenaar', icon: FileText, description: 'Bestuurlijk recht en regelgeving' }
]

const EXAMPLE_QUESTIONS_BY_PROFESSION = {
  general: [
    "Wat zijn mijn rechten bij ontslag?",
    "Hoe werkt een huurcontract?",
    "Wanneer mag ik een contract ontbinden?",
    "Wat zijn de regels rond privacy?"
  ],
  lawyer: [
    "Hoe stel ik een dagvaarding op?",
    "Wat zijn de termijnen voor hoger beroep?", 
    "Hoe werkt het verschoningsrecht?",
    "Welke proceskostenregeling geldt?"
  ],
  police: [
    "Welke bevoegdheden heb ik bij een aanhouding volgens de Sv?",
    "Wanneer mag ik geweld gebruiken volgens de Ambtsinstructie?",
    "Wat zijn de eisen voor een rechtmatige doorzoeking?",
    "Hoe lang mag ik iemand vasthouden voor verhoor?"
  ],
  judge: [
    "Hoe weeg ik bewijsmiddelen in strafzaken?",
    "Wat zijn de criteria voor toepasselijkheid van artikel 348 Sv?",
    "Welke afwegingen gelden bij het bepalen van strafmaat?",
    "Hoe interpreteer ik Europese jurisprudentie in nationale context?"
  ],
  civil_servant: [
    "Welke procedure geldt voor het opleggen van bestuurlijke boetes?",
    "Wat zijn de vereisten voor een deugdelijke motivering?",
    "Hoe pas ik de Awb toe bij bezwaarschriften?",
    "Welke termijnen gelden voor beschikkingen?"
  ]
}

export default function ChatInterface() {
  const { data: session, status } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedProfession, setSelectedProfession] = useState<string>('general')
  const [showProfessionSelector, setShowProfessionSelector] = useState(false)
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [guestMessageCount, setGuestMessageCount] = useState(0)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Load guest message count from localStorage
  useEffect(() => {
    if (!session) {
      const savedCount = localStorage.getItem('guestMessageCount')
      if (savedCount) {
        setGuestMessageCount(parseInt(savedCount))
      }
    }
  }, [session])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (session) {
      loadConversations()
      // Clear guest count when logged in
      setGuestMessageCount(0)
      localStorage.removeItem('guestMessageCount')
    }
  }, [session])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showProfessionSelector) {
        setShowProfessionSelector(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showProfessionSelector])

  const loadConversations = async () => {
    try {
      const response = await fetch('/api/conversations')
      if (response.ok) {
        const data = await response.json()
        setConversations(data)
      }
    } catch (error) {
      console.error('Error loading conversations:', error)
    }
  }

  const createNewConversation = () => {
    setMessages([])
    setCurrentConversationId(null)
    setSidebarOpen(false)
  }

  const loadConversation = (conversation: Conversation) => {
    setMessages(conversation.messages)
    setCurrentConversationId(conversation.id)
    setSidebarOpen(false)
  }

  const deleteConversation = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        setConversations(prev => prev.filter(c => c.id !== conversationId))
        if (currentConversationId === conversationId) {
          setMessages([])
          setCurrentConversationId(null)
        }
      }
    } catch (error) {
      console.error('Error deleting conversation:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    // Check guest limit
    if (!session && guestMessageCount >= 2) {
      setShowLoginPrompt(true)
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      role: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    // Increment guest count if not logged in
    if (!session) {
      const newCount = guestMessageCount + 1
      setGuestMessageCount(newCount)
      localStorage.setItem('guestMessageCount', newCount.toString())
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversationId: session ? currentConversationId : null,
          messages: [...messages, userMessage],
          isGuest: !session
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        role: 'assistant',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
      
      if (session && data.conversationId) {
        setCurrentConversationId(data.conversationId)
        loadConversations()
      }

    } catch (error) {
      console.error('Error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Er is een fout opgetreden. Probeer het opnieuw.',
        role: 'system',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
    }
  }

  const formatMessage = (content: string): string => {
    // Enhanced formatting for better readability
    let formatted = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')

    // Handle numbered lists
    formatted = formatted.replace(/(\d+)\.\s/g, '<br><strong>$1.</strong> ')
    
    // Handle bullet points
    formatted = formatted.replace(/[-•]\s/g, '<br>• ')
    
    // Wrap in paragraph tags
    formatted = `<p>${formatted}</p>`
    
    // Handle law references
    formatted = formatted.replace(
      /(Artikel \d+[a-z]?|Art\. \d+[a-z]?|§ \d+)/gi,
      '<span class="font-semibold text-blue-700 bg-blue-50 px-1 rounded">$1</span>'
    )
    
    return formatted
  }

  // Guest welcome component
  const GuestWelcome = () => (
    <div className="text-center max-w-4xl mx-auto mb-8">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            <Scale className="w-6 h-6 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welkom bij WetHelder</h1>
        </div>
        <p className="text-gray-600 mb-4">
          Nederlandse Juridische Hulp - Test nu gratis met 2 vragen!
        </p>
        
        {/* Guest status indicator */}
        <div className="bg-white rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-orange-500 mr-2" />
              <span className="text-sm font-medium">Gast modus</span>
            </div>
            <div className="text-sm text-gray-500">
              {2 - guestMessageCount} vragen over
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${(guestMessageCount / 2) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Account benefits */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Crown className="w-5 h-5 text-green-600 mr-2" />
            <span className="font-semibold text-green-800">Voordelen van een account</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-green-700">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              Onbeperkte vragen
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              Gespecialiseerde beroepsvragen
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              Gesprekgeschiedenis opslaan
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              Persoonlijke juridische tips
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <Link href="/auth/signup" className="btn-primary text-sm px-4 py-2">
              Gratis Account Maken
            </Link>
            <Link href="/auth/signin" className="btn-secondary text-sm px-4 py-2">
              Inloggen
            </Link>
          </div>
        </div>
      </div>

      {/* Example questions for guests */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Probeer bijvoorbeeld:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {EXAMPLE_QUESTIONS_BY_PROFESSION.general.map((question, index) => (
            <button
              key={index}
              onClick={() => setInputValue(question)}
              className="text-left p-3 bg-gray-50 hover:bg-blue-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-all duration-200 text-sm"
            >
              <MessageSquare className="w-4 h-4 inline mr-2 text-blue-600" />
              {question}
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  // Login prompt modal
  const LoginPrompt = () => (
    showLoginPrompt && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Je hebt je gratis vragen gebruikt!
            </h3>
            <p className="text-gray-600 mb-6">
              Maak een gratis account aan voor onbeperkte toegang tot juridische hulp en extra functies.
            </p>
            
            <div className="space-y-3">
              <Link 
                href="/auth/signup" 
                className="w-full btn-primary py-3 text-center block"
                onClick={() => setShowLoginPrompt(false)}
              >
                Gratis Account Maken
              </Link>
              <Link 
                href="/auth/signin"
                className="w-full btn-secondary py-3 text-center block"
                onClick={() => setShowLoginPrompt(false)}
              >
                Al een account? Inloggen
              </Link>
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="w-full text-gray-500 hover:text-gray-700 py-2"
              >
                Sluiten
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  )

  if (status === 'loading') {
    return (
      <div className="chat-container">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-neutral-600">Laden...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-neutral-50">
      <LoginPrompt />
      
      {/* Sidebar - only show for logged in users */}
      {session && (
        <div className={`${sidebarOpen ? 'block' : 'hidden'} md:block transition-all duration-200 ${sidebarCollapsed ? 'w-16' : 'w-80'} bg-white border-r border-neutral-200 flex flex-col`}>
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-neutral-200">
            {!sidebarCollapsed && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Scale className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-neutral-900">WetHelder</span>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>

          {/* New Conversation Button */}
          <div className="p-4">
            <button
              onClick={createNewConversation}
              className={`w-full ${sidebarCollapsed ? 'p-3' : 'px-4 py-3'} bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center transition-all duration-200`}
            >
              <Plus className="w-4 h-4" />
              {!sidebarCollapsed && <span className="ml-2">Nieuw Gesprek</span>}
            </button>
          </div>

          {/* Conversations List */}
          {!sidebarCollapsed && (
            <div className="flex-1 overflow-y-auto p-4">
              <h3 className="text-sm font-medium text-neutral-600 mb-3">Gesprekken</h3>
              <div className="space-y-2">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`group relative p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                      currentConversationId === conversation.id 
                        ? 'bg-blue-50 border border-blue-200' 
                        : 'hover:bg-neutral-50 border border-transparent'
                    }`}
                    onClick={() => loadConversation(conversation)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-neutral-900 truncate">
                          {conversation.title}
                        </h4>
                        <p className="text-xs text-neutral-600 mt-1">
                          {new Date(conversation.lastMessage).toLocaleDateString('nl-NL')}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteConversation(conversation.id)
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-all duration-200"
                      >
                        <Trash2 className="w-3 h-3 text-red-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* User Menu */}
          <div className="border-t border-neutral-200 p-4">
            {!sidebarCollapsed ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-neutral-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 truncate">
                      {session.user?.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => signOut()}
                  className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4 text-neutral-600" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => signOut()}
                className="w-full p-3 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4 text-neutral-600 mx-auto" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-neutral-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {session && (
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="md:hidden p-2 hover:bg-neutral-100 rounded-lg"
                >
                  <Menu className="w-5 h-5" />
                </button>
              )}
              <h1 className="text-lg font-semibold text-neutral-900">
                {session ? 'Juridische Hulp' : 'WetHelder - Gratis Proefversie'}
              </h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <Link href="/" className="nav-link">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Link>
              
              {!session ? (
                <>
                  <Link href="/auth/signin" className="btn-secondary text-sm">
                    Inloggen
                  </Link>
                  <Link href="/auth/signup" className="btn-primary text-sm">
                    Account Maken
                  </Link>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-neutral-600">
                    {session.user?.email}
                  </span>
                  <button
                    onClick={() => signOut()}
                    className="btn-secondary text-sm"
                  >
                    <LogOut className="w-4 h-4 mr-1" />
                    Uitloggen
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            session ? (
              // Logged in user welcome
              <div className="text-center max-w-4xl mx-auto">
                <div className="mb-8">
                  <h1 className="text-2xl font-bold text-neutral-900 mb-2">
                    Welkom terug bij WetHelder
                  </h1>
                  <p className="text-neutral-600">
                    Stel je juridische vraag en krijg betrouwbare antwoorden
                  </p>
                </div>
                
                {/* Profession Selector */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4 text-neutral-900">
                    Selecteer je beroep voor gespecialiseerde vragen:
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    {PROFESSIONS.map((profession) => (
                      <button
                        key={profession.id}
                        onClick={() => setSelectedProfession(profession.id)}
                        className={`p-4 rounded-xl border transition-all duration-200 ${
                          selectedProfession === profession.id
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-neutral-200 hover:border-neutral-300 bg-white'
                        }`}
                      >
                        <profession.icon className="w-6 h-6 mx-auto mb-2" />
                        <div className="text-sm font-medium">{profession.name}</div>
                        <div className="text-xs text-neutral-500 mt-1">
                          {profession.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Example Questions */}
                <div className="bg-white rounded-xl p-6 border border-neutral-200">
                  <h3 className="text-lg font-semibold mb-4 text-neutral-900">
                    Voorbeeld vragen voor {PROFESSIONS.find(p => p.id === selectedProfession)?.name}:
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                         {(EXAMPLE_QUESTIONS_BY_PROFESSION[selectedProfession as keyof typeof EXAMPLE_QUESTIONS_BY_PROFESSION] || []).map((question: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => setInputValue(question)}
                        className="text-left p-3 bg-neutral-50 hover:bg-blue-50 rounded-lg border border-neutral-200 hover:border-blue-300 transition-all duration-200 text-sm"
                      >
                        <MessageSquare className="w-4 h-4 inline mr-2 text-blue-600" />
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              // Guest welcome
              <GuestWelcome />
            )
          ) : (
            // Messages
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : message.role === 'system'
                        ? 'bg-red-50 text-red-800 border border-red-200'
                        : 'bg-white text-neutral-900 border border-neutral-200 shadow-sm'
                    }`}
                  >
                    {message.role === 'assistant' ? (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: formatMessage(message.content),
                        }}
                        className="prose prose-sm max-w-none prose-blue"
                      />
                    ) : (
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    )}
                    <div
                      className={`text-xs mt-2 ${
                        message.role === 'user' ? 'text-blue-100' : 'text-neutral-500'
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString('nl-NL', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white text-neutral-900 border border-neutral-200 shadow-sm rounded-2xl px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      <span className="text-sm">WetHelder denkt na...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-neutral-200 bg-white p-4">
          {!session && guestMessageCount >= 1 && (
            <div className="mb-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center text-orange-800">
                <AlertCircle className="w-4 h-4 mr-2" />
                <span className="text-sm">
                  {guestMessageCount === 1 ? 
                    "Nog 1 gratis vraag over. Maak een account aan voor onbeperkte toegang!" :
                    "Je hebt je gratis vragen gebruikt. Log in om door te gaan."
                  }
                </span>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="flex items-end space-x-3">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value)
                    adjustTextareaHeight()
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSubmit(e)
                    }
                  }}
                  placeholder={
                    !session && guestMessageCount >= 2 
                      ? "Maak een account aan om verder te gaan..."
                      : "Stel je juridische vraag..."
                  }
                  disabled={!session && guestMessageCount >= 2}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none min-h-[50px] max-h-[120px] disabled:bg-gray-100 disabled:cursor-not-allowed"
                  rows={1}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim() || (!session && guestMessageCount >= 2)}
                className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 