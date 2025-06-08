'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Send, Scale, AlertCircle, ExternalLink, User, Briefcase, Shield, Gavel, FileText, LogOut, History, BarChart3, MessageSquare, Menu, X, Plus, Home, Search, Loader2, Trash2, Edit3 } from 'lucide-react'
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
    "Wat kost een boete voor 15 km/h te hard rijden?",
    "Mag ik inhalen bij een doorgetrokken streep?",
    "Wat zijn mijn rechten bij een politiecontrole?",
    "Hoe lang duurt een rechtszaak gemiddeld?"
  ],
  lawyer: [
    "Wat zijn de procedurevereisten voor artikel 8:69 Awb?",
    "Hoe interpreteer ik artikel 6:162 BW in contractrecht?",
    "Welke jurisprudentie geldt voor bestuursrechtelijke handhaving?",
    "Wat zijn de vereisten voor een geldig cassatieberoep?"
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (session) {
      loadConversations()
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

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      role: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversationId: currentConversationId,
          messages: [...messages, userMessage]
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
      
      if (data.conversationId) {
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
    <div className="chat-container">
      {/* Sidebar */}
      <div className={`chat-sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Scale className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-gradient">WetHelder</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden btn btn-ghost p-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <button
            onClick={createNewConversation}
            className="btn btn-primary w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nieuwe Chat
          </button>
        </div>

        {/* Navigation Links */}
        <div className="p-4 border-b border-neutral-200">
          <nav className="space-y-1">
            <Link href="/" className="nav-link w-full justify-start">
              <Home className="w-4 h-4 mr-3" />
              Home
            </Link>
            <Link href="/chat" className="nav-link nav-link-active w-full justify-start">
              <MessageSquare className="w-4 h-4 mr-3" />
              AI Assistant
            </Link>
            <Link href="/boetes" className="nav-link w-full justify-start">
              <Shield className="w-4 h-4 mr-3" />
              Verkeersboetes
            </Link>
            <Link href="/wetgeving" className="nav-link w-full justify-start">
              <Search className="w-4 h-4 mr-3" />
              Wetgeving
            </Link>
          </nav>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-sm font-medium text-neutral-500 mb-3">Recente Gesprekken</h3>
          <div className="space-y-2">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`group relative p-3 rounded-lg cursor-pointer transition-colors ${
                  currentConversationId === conversation.id
                    ? 'bg-blue-50 border border-blue-200'
                    : 'hover:bg-neutral-50'
                }`}
                onClick={() => loadConversation(conversation)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 truncate">
                      {conversation.title}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      {conversation.lastMessage.toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteConversation(conversation.id)
                    }}
                    className="opacity-0 group-hover:opacity-100 btn btn-ghost p-1 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Menu */}
        {session && (
          <div className="p-4 border-t border-neutral-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-neutral-900 truncate">
                    {session.user?.name || session.user?.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => signOut()}
                className="btn btn-ghost p-2 text-neutral-600 hover:text-red-600"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="chat-main">
        {/* Header */}
        <div className="chat-header">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden btn btn-ghost p-2"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-neutral-900">AI Legal Assistant</h1>
              <p className="text-sm text-neutral-500">Stel al je juridische vragen</p>
            </div>
          </div>
          
          {!session && (
            <div className="flex items-center space-x-3">
              <Link href="/auth/signin" className="btn btn-secondary">
                Inloggen
              </Link>
              <Link href="/auth/signup" className="btn btn-primary">
                Registreren
              </Link>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  Welkom bij WetHelder AI
                </h3>
                <p className="text-neutral-600 mb-6">
                  Stel een juridische vraag en krijg direct een uitgebreid antwoord 
                  gebaseerd op Nederlandse wetgeving.
                </p>
                <div className="space-y-2 text-sm text-neutral-500">
                  <div className="flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Gratis te gebruiken
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    Nederlandse wetgeving
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                    AI-powered antwoorden
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message) => (
                <div key={message.id} className="animate-slide-up">
                  {message.role === 'user' && (
                    <div className="flex justify-end">
                      <div className="message-user">
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  )}
                  
                  {message.role === 'assistant' && (
                    <div className="flex justify-start">
                      <div className="message-assistant">
                        <div className="prose prose-sm max-w-none">
                          <div dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }} />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {message.role === 'system' && (
                    <div className="flex justify-center">
                      <div className="message-system">
                        <p>{message.content}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="message-assistant">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      <span className="text-neutral-600">WetHelder denkt na...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="chat-input-area">
          <form onSubmit={handleSubmit} className="flex items-end space-x-3">
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
                placeholder={session ? "Stel een juridische vraag..." : "Log in om te chatten..."}
                disabled={!session || isLoading}
                className="input resize-none min-h-[44px] max-h-[120px] py-3 pr-12"
                rows={1}
              />
            </div>
            <button
              type="submit"
              disabled={!inputValue.trim() || !session || isLoading}
              className="btn btn-primary p-3 shrink-0"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </form>
          
          {!session && (
            <p className="text-xs text-neutral-500 mt-2 text-center">
              <Link href="/auth/signin" className="text-blue-600 hover:text-blue-700">
                Log in
              </Link>{' '}
              of{' '}
              <Link href="/auth/signup" className="text-blue-600 hover:text-blue-700">
                registreer
              </Link>{' '}
              om de AI assistant te gebruiken
            </p>
          )}
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
} 