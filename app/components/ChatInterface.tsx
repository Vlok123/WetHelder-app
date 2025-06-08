'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Send, Scale, AlertCircle, ExternalLink, User, Briefcase, Shield, Gavel, FileText, LogOut, History, BarChart3, MessageSquare } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import ChatSidebar from './ChatSidebar'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface Profession {
  id: string
  name: string
  icon: React.ComponentType<any>
  description: string
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
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showProfessionSelector) {
        setShowProfessionSelector(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showProfessionSelector])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    // Temporarily unlimited for all users
    // if (!session && guestMessageCount >= 1) {
    //   setError('Je hebt het maximum aantal gratis berichten bereikt. Maak een account aan om verder te chatten en je gesprekken op te slaan.')
    //   return
    // }

    const userMessage: Message = {
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const messageContent = inputValue.trim()
    setInputValue('')
    setIsLoading(true)
    setError(null)

    // Increment guest message count
    if (!session) {
      setGuestMessageCount(prev => prev + 1)
    }

    try {
      // Create conversation if logged in and no current conversation
      let conversationId = currentConversationId
      if (session && !conversationId) {
        const convResponse = await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create',
            title: messageContent.slice(0, 50) + (messageContent.length > 50 ? '...' : '')
          })
        })

        if (convResponse.ok) {
          const convData = await convResponse.json()
          conversationId = convData.conversation.id
          setCurrentConversationId(conversationId)
        }
      }

      // Save user message if logged in
      if (session && conversationId) {
        await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'save_message',
            conversationId,
            message: messageContent,
            role: 'user'
          })
        })
      }

      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageContent,
          conversationHistory,
          profession: (session?.user as any)?.profession || selectedProfession
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Er is een fout opgetreden')
      }

      const data = await response.json()
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])

      // Save assistant message if logged in
      if (session && conversationId) {
        await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'save_message',
            conversationId,
            message: data.message,
            role: 'assistant'
          })
        })
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er is een onbekende fout opgetreden')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExampleQuestion = (question: string) => {
    setInputValue(question)
  }

  const handleConversationSelect = (conversationId: string, conversationMessages: any[]) => {
    setCurrentConversationId(conversationId)
    setMessages(conversationMessages)
    setError(null)
  }

  const handleNewConversation = () => {
    setCurrentConversationId(null)
    setMessages([])
    setError(null)
    setInputValue('')
  }

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  const formatMessage = (content: string) => {
    // Enhanced formatting for better structure and readability
    let formatted = content
      // Format links with external link icon
      .replace(/https?:\/\/[^\s]+/g, (url) => 
        `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-1 font-medium">
          ${url} <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
        </a>`
      )
      // Format headers (### Header or **Header:**)
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold text-gray-800 mt-4 mb-2 border-b border-gray-200 pb-1">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold text-gray-800 mt-5 mb-3 border-b-2 border-blue-500 pb-2">$1</h2>')
      // Format bold text and article references
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-gray-700">$1</em>')
      // Format article references (Artikel X van de Wet)
      .replace(/(Artikel \d+[a-z]*(?:\s+lid \d+)?(?:\s+sub [a-z])?(?:\s+onder [a-z0-9]+)?)\s+(van de|uit de|in de)\s+([A-Z][^.]*?)(?=[\.\,\;\:]|$)/g, 
        '<div class="law-reference my-3 p-3 bg-gray-50 border-l-4 border-blue-500 rounded-r-lg"><strong class="text-blue-700">$1</strong> <span class="text-gray-600">$2</span> <strong class="text-gray-800">$3</strong></div>')
      // Format law names in parentheses
      .replace(/\(([A-Z][a-zA-Z\s]+wet[a-zA-Z\s]*|AWB|WVW|Sr|Sv|BW)\)/g, '<span class="bg-gray-100 px-2 py-1 rounded text-sm font-medium text-gray-700">($1)</span>')
      // Format lists with bullets
      .replace(/^[\*\-\•]\s+(.*$)/gm, '<li class="ml-4 mb-1 text-gray-800">• $1</li>')
      // Format numbered lists
      .replace(/^\d+\.\s+(.*$)/gm, '<li class="ml-4 mb-1 text-gray-800 list-decimal">$1</li>')
      
    // Wrap consecutive list items in ul tags
    formatted = formatted.replace(/((?:<li[^>]*>.*?<\/li>\s*)+)/g, '<ul class="my-2 space-y-1">$1</ul>')
    
    // Format paragraphs
    formatted = formatted
      .split('\n\n')
      .map(paragraph => {
        paragraph = paragraph.trim()
        if (!paragraph) return ''
        
        // Skip if already formatted as header, list, or law reference
        if (paragraph.startsWith('<h') || paragraph.startsWith('<ul') || paragraph.startsWith('<div class="law-reference')) {
          return paragraph
        }
        
        return `<p class="mb-3 text-gray-800 leading-relaxed">${paragraph}</p>`
      })
      .join('')

    return formatted
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      {session && (
        <ChatSidebar
          onConversationSelect={handleConversationSelect}
          onNewConversation={handleNewConversation}
          currentConversationId={currentConversationId}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
        />
      )}

      {/* Main Content */}
      <div className="flex flex-col flex-1 max-w-4xl mx-auto">
        {/* Free Access Banner */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white text-center py-2 px-4">
          <p className="text-sm font-medium">
            🎉 <strong>WetHelder is tijdelijk geheel gratis!</strong> Onbeperkt vragen stellen voor iedereen.
          </p>
        </div>
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Scale className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Nederlandse Juridische Assistent
              </h1>
              <p className="text-gray-600 text-sm">
                Gebaseerd op officiële Nederlandse bronnen zoals wetten.overheid.nl
              </p>
            </div>
          </div>
          
          {/* Quick Navigation */}
          <div className="flex items-center gap-3">
            <Link
              href="/boetes"
              className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5 text-sm font-medium"
            >
              <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Verkeersbonnen
              <span className="text-blue-100 text-xs">→</span>
            </Link>
            

            
            <div className="h-4 w-px bg-gray-300"></div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Live
              </span>
              <span>24/7 beschikbaar</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* User Authentication */}
            {status === 'loading' ? (
              <div className="animate-pulse bg-gray-200 h-10 w-32 rounded-lg"></div>
            ) : session ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700">{session.user?.name}</p>
                  <p className="text-xs text-gray-500">{session.user?.email}</p>
                </div>
                {/* Admin Dashboard Link - only for admin emails */}
                {(session.user?.email === 'admin@example.com' || session.user?.email === 'your-email@domain.com' || session.user?.email === 'sanderhelmink@gmail.com') && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors text-blue-700"
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>Admin</span>
                  </Link>
                )}
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Uitloggen</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/signin"
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Inloggen
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Registreren
                </Link>
              </div>
            )}
            
            {/* Profession Selector - only for logged in users */}
            {session && (
              <div className="relative">
                <button
                  onClick={() => setShowProfessionSelector(!showProfessionSelector)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  {React.createElement(PROFESSIONS.find(p => p.id === selectedProfession)?.icon || User, {
                    className: "w-4 h-4 text-blue-600"
                  })}
                  <span className="text-sm font-medium text-gray-700">
                    {PROFESSIONS.find(p => p.id === selectedProfession)?.name}
                  </span>
                </button>
                
                {showProfessionSelector && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-3 border-b border-gray-200">
                      <h3 className="font-medium text-gray-900">Selecteer uw beroep</h3>
                      <p className="text-xs text-gray-600 mt-1">Voor op maat gemaakte juridische antwoorden</p>
                    </div>
                    <div className="p-2">
                      {PROFESSIONS.map((profession) => (
                        <button
                          key={profession.id}
                          onClick={() => {
                            setSelectedProfession(profession.id)
                            setShowProfessionSelector(false)
                          }}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors ${
                            selectedProfession === profession.id ? 'bg-blue-50 border border-blue-200' : ''
                          }`}
                        >
                          {React.createElement(profession.icon, {
                            className: `w-5 h-5 ${selectedProfession === profession.id ? 'text-blue-600' : 'text-gray-500'}`
                          })}
                          <div className="text-left">
                            <div className={`font-medium text-sm ${
                              selectedProfession === profession.id ? 'text-blue-700' : 'text-gray-700'
                            }`}>
                              {profession.name}
                            </div>
                            <div className="text-xs text-gray-600">{profession.description}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Scale className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              WetHelder
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              {session ? `Welkom terug, ${session.user?.name?.split(' ')[0]}!` : 'Welkom bij WetHelder'}
              <br />
              Uw Nederlandse juridische assistent voor wet- en regelgeving op basis van officiële bronnen zoals wetten.overheid.nl
            </p>
            
            {!session && (
              <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg max-w-lg mx-auto">
                <p className="text-sm text-green-700 mb-3">
                  🎉 <strong>Tijdelijk geheel gratis!</strong> WetHelder is nu volledig gratis te gebruiken. Maak een account aan voor aangepaste antwoorden als <strong>Algemeen publiek, Advocaat, Politieagent, Rechter/Jurist of Ambtenaar</strong> + gesprekgeschiedenis.
                </p>
                <div className="flex gap-2 justify-center">
                  <Link
                    href="/auth/signup"
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                  >
                    Account Aanmaken
                  </Link>
                  <Link
                    href="/auth/signin"
                    className="px-4 py-2 text-sm font-medium text-green-700 bg-white border border-green-300 hover:bg-green-50 rounded-lg transition-colors"
                  >
                    Inloggen
                  </Link>
                </div>
              </div>
            )}
            
            {session && (
              <div className="mb-6 flex flex-col items-center gap-3">
                <span className="text-sm text-gray-600">Uw profiel bepaalt welke vragen en antwoorden u krijgt:</span>
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowProfessionSelector(!showProfessionSelector)
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                  >
                    {React.createElement(PROFESSIONS.find(p => p.id === selectedProfession)?.icon || User, {
                      className: "w-5 h-5 text-blue-600"
                    })}
                    <span className="font-medium text-blue-700">
                      {PROFESSIONS.find(p => p.id === selectedProfession)?.name}
                    </span>
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {showProfessionSelector && (
                    <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      <div className="p-3 border-b border-gray-200">
                        <h3 className="font-medium text-gray-900">Kies uw profiel</h3>
                        <p className="text-xs text-gray-600 mt-1">Dit bepaalt welke vragen en antwoorden u krijgt</p>
                      </div>
                      <div className="p-2">
                        {PROFESSIONS.map((profession) => (
                          <button
                            key={profession.id}
                            onClick={() => {
                              setSelectedProfession(profession.id)
                              setShowProfessionSelector(false)
                            }}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors ${
                              selectedProfession === profession.id ? 'bg-blue-50 border border-blue-200' : ''
                            }`}
                          >
                            {React.createElement(profession.icon, {
                              className: `w-5 h-5 ${selectedProfession === profession.id ? 'text-blue-600' : 'text-gray-500'}`
                            })}
                            <div className="text-left flex-1">
                              <div className={`font-medium text-sm ${
                                selectedProfession === profession.id ? 'text-blue-700' : 'text-gray-700'
                              }`}>
                                {profession.name}
                              </div>
                              <div className="text-xs text-gray-600">{profession.description}</div>
                            </div>
                            {selectedProfession === profession.id && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="space-y-6 max-w-4xl mx-auto">
              {/* Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Juridische Vragen */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-blue-600" />
                    </div>
                                       <div>
                     <h3 className="font-semibold text-gray-900">
                       Juridische Vragen
                       <span className="text-xs font-normal text-blue-600 ml-2">
                         ({PROFESSIONS.find(p => p.id === selectedProfession)?.name})
                       </span>
                     </h3>
                     <p className="text-sm text-gray-600">
                       {session 
                         ? `Voorbeeldvragen afgestemd op uw profiel als ${PROFESSIONS.find(p => p.id === selectedProfession)?.name.toLowerCase()}`
                         : 'Stel vragen over Nederlandse wet- en regelgeving'
                       }
                     </p>
                   </div>
                  </div>
                                     <div className="grid grid-cols-1 gap-2">
                     {EXAMPLE_QUESTIONS_BY_PROFESSION[selectedProfession as keyof typeof EXAMPLE_QUESTIONS_BY_PROFESSION].map((question: string, index: number) => (
                       <button
                         key={index}
                         onClick={() => handleExampleQuestion(question)}
                         className="p-3 text-left bg-gray-50 rounded-lg hover:bg-blue-50 hover:border-blue-200 border border-transparent transition-all text-sm group"
                       >
                         <span className="group-hover:text-blue-700">{question}</span>
                         <span className="text-gray-400 group-hover:text-blue-500 ml-2">→</span>
                       </button>
                     ))}
                  </div>
                </div>

                {/* Verkeersbonnen */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 hover:shadow-md transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-900">Verkeersbonnen Database</h3>
                      <p className="text-sm text-blue-700">Zoek boetebedragen en verkeersovertredingen</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-blue-800">
                      <span className="text-blue-500">✓</span>
                      <span>Officiële boetebedragen van het OM</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-blue-800">
                      <span className="text-blue-500">✓</span>
                      <span>Feitcodes en wettelijke basis</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-blue-800">
                      <span className="text-blue-500">✓</span>
                      <span>Zoek alle verkeersovertredingen</span>
                    </div>
                  </div>
                  
                  <Link
                    href="/boetes"
                    className="inline-flex items-center gap-2 w-full justify-center px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all font-medium shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Zoek Verkeersovertredingen
                    <span className="text-blue-100">→</span>
                  </Link>
                </div>
              </div>
              
              {/* Features */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-200">
                {[
                  { icon: '⚖️', label: 'Officiële Bronnen', desc: 'wetten.overheid.nl' },
                  { icon: '🚗', label: 'Verkeersovertredingen', desc: 'Zoek alle boetes' },
                  { icon: '💬', label: 'Chat Assistent', desc: '24/7 beschikbaar' },
                  { icon: '📊', label: 'Actuele Bedragen', desc: 'Februari 2025' }
                ].map((feature, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl mb-2">{feature.icon}</div>
                    <div className="font-medium text-gray-900 text-sm">{feature.label}</div>
                    <div className="text-xs text-gray-600">{feature.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Free access banner */}
        {!session && messages.length > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 max-w-2xl mx-auto">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-green-900 mb-2">🎉 Tijdelijk geheel gratis!</h3>
                <p className="text-sm text-green-700 mb-3">
                  WetHelder is nu tijdelijk volledig gratis te gebruiken! Stel onbeperkt vragen. Maak een account aan voor aangepaste antwoorden op uw behoefte: <strong>Algemeen publiek, Advocaat, Politieagent, Rechter/Jurist of Ambtenaar</strong> + gesprekgeschiedenis.
                </p>
                <div className="flex gap-2">
                  <Link
                    href="/auth/signup"
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                  >
                    Account Aanmaken
                  </Link>
                  <Link
                    href="/auth/signin"
                    className="px-4 py-2 text-sm font-medium text-green-700 bg-white border border-green-300 hover:bg-green-50 rounded-lg transition-colors"
                  >
                    Inloggen
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`chat-message ${
              message.role === 'user' ? 'user-message' : 'assistant-message'
            }`}
          >
            <div className="flex items-start gap-3">
              {message.role === 'assistant' && (
                <Scale className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              )}
              <div className="flex-1">
                                 <div className="flex items-center gap-2 mb-2">
                   <span className="font-medium text-sm text-gray-700">
                     {message.role === 'user' ? 'U' : 'WetHelder'}
                   </span>
                   <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                     {message.timestamp.toLocaleTimeString('nl-NL')}
                   </span>
                 </div>
                 {message.role === 'assistant' ? (
                   <div className="space-y-2">
                     <div 
                       className="formatted-content text-gray-800"
                       dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                     />
                     <div className="text-xs text-gray-500 italic border-t border-gray-200 pt-3 mt-4 flex items-center gap-2">
                       <span>⚖️</span>
                       <span>Gebaseerd op officiële Nederlandse bronnen zoals wetten.overheid.nl</span>
                     </div>
                   </div>
                 ) : (
                   <div 
                     className="text-gray-800 leading-relaxed font-medium"
                     dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                   />
                 )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="assistant-message chat-message">
            <div className="flex items-start gap-3">
              <Scale className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1 animate-pulse" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-medium text-sm text-gray-700">WetHelder</span>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <span className="text-gray-600 text-sm font-medium">Zoeken in de Nederlandse wet- en regelgeving...</span>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-gray-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="font-medium">Analyseren van officiële bronnen</span>
                      </div>
                      <div className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                        ⏱️ ~30 seconden
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 mb-2">
                      📚 Bronnen: wetten.overheid.nl, officielebekendmakingen.nl
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div className="bg-blue-600 h-1 rounded-full animate-pulse" style={{width: '45%'}}></div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 italic flex items-center gap-1">
                    <span>💡</span>
                    <span>De verwerkingstijd is afhankelijk van de complexiteit van uw vraag</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
                      <div className={`${
            error.includes('maximum aantal gratis berichten')
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          } rounded-lg p-4`}>
            <div className="flex items-start gap-3">
              {error.includes('maximum aantal gratis berichten') ? (
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <h3 className={`font-medium mb-2 ${
                  error.includes('maximum aantal gratis berichten') ? 'text-green-900' : 'text-red-900'
                }`}>
                  {error.includes('maximum aantal gratis berichten') 
                    ? '🎉 Volledig gratis te gebruiken!' 
                    : 'Fout'
                  }
                </h3>
                <p className={`text-sm mb-3 ${
                  error.includes('maximum aantal gratis berichten') ? 'text-green-700' : 'text-red-700'
                }`}>
                  {error.includes('maximum aantal gratis berichten')
                    ? 'WetHelder is tijdelijk geheel gratis! Er zou geen beperking moeten zijn. Probeer de pagina te verversen.'
                    : error
                  }
                </p>
                                 {error.includes('maximum aantal gratis berichten') && (
                   <div className="flex gap-2">
                     <Link
                       href="/auth/signup"
                       className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                     >
                       Account Aanmaken
                     </Link>
                     <Link
                       href="/auth/signin"
                       className="px-4 py-2 text-sm font-medium text-green-700 bg-white border border-green-300 hover:bg-green-50 rounded-lg transition-colors"
                     >
                       Inloggen
                     </Link>
                   </div>
                 )}
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="border-t border-gray-200 bg-white p-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Stel uw juridische vraag..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>Verstuur</span>
          </button>
        </div>
        <div className="mt-2 space-y-2">
          <p className="text-xs text-gray-500">
            Alleen vragen over Nederlandse wet- en regelgeving worden beantwoord op basis van officiële bronnen.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
            <p className="text-xs text-amber-800">
              ⚠️ <strong>Privacy:</strong> Voer geen persoonlijke gegevens in zoals kentekens, BSN-nummers, namen of adressen.
            </p>
          </div>
        </div>
      </form>
      </div>
    </div>
  )
} 