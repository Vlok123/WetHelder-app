'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Search, MessageSquare, Scale, ExternalLink, FileText, Zap, X, ChevronRight, AlertCircle, Send, Car } from 'lucide-react'
import Link from 'next/link'

interface SearchResult {
  category: string
  violation: string
  fineAmount: number
  feitcode?: string
  description: string
  confidence?: number
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function BoetesPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState<'search' | 'chat'>('search')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null)
  
  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [isChatLoading, setIsChatLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages])

  const formatMessage = (content: string) => {
    // Split message into lines and format with proper styling
    const lines = content.split('\n')
    
    return lines.map((line, index) => {
      // Headers (lines starting with ##)
      if (line.startsWith('## ')) {
        return (
          <h3 key={index} className="text-lg font-semibold text-legal-800 mt-4 mb-2 first:mt-0">
            {line.substring(3)}
          </h3>
        )
      }
      
      // Law articles (lines containing "artikel" or "Art.")
      if (line.toLowerCase().includes('artikel') || line.includes('Art.')) {
        return (
          <div key={index} className="bg-blue-50 border-l-4 border-blue-400 p-3 my-2 rounded">
            <p className="text-blue-800 font-medium">{line}</p>
          </div>
        )
      }

      // Feitcodes (lines containing feitcode patterns)
      if (line.match(/[A-Z]\s?\d{3}[a-z]?/)) {
        return (
          <div key={index} className="bg-amber-50 border-l-4 border-amber-400 p-3 my-2 rounded">
            <p className="text-amber-800 font-medium">{line}</p>
          </div>
        )
      }
      
      // Bullet points
      if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
        return (
          <li key={index} className="ml-4 text-legal-700 mb-1">
            {line.substring(2)}
          </li>
        )
      }
      
      // Regular paragraphs
      if (line.trim()) {
        return (
          <p key={index} className="text-legal-700 mb-2 leading-relaxed">
            {line}
          </p>
        )
      }
      
      return <br key={index} />
    })
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    setIsSearching(true)
    try {
      const response = await fetch('/api/search-fines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery })
      })
      
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.results)
      } else {
        console.error('Search failed')
        setSearchResults([])
      }
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim() || isChatLoading) return

    const userMessage: ChatMessage = {
      role: 'user',
      content: chatInput,
      timestamp: new Date()
    }

    setChatMessages(prev => [...prev, userMessage])
    setChatInput('')
    setIsChatLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Verkeersboete vraag: ${chatInput}. Geef feitcodes waar mogelijk en verwijs naar boetebase.om.nl van het Openbaar Ministerie.`,
          conversationHistory: chatMessages.map(msg => ({ role: msg.role, content: msg.content })),
          profession: (session?.user as any)?.profession || 'general'
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: data.message,
          timestamp: new Date()
        }
        setChatMessages(prev => [...prev, assistantMessage])
      }
    } catch (error) {
      console.error('Chat error:', error)
    } finally {
      setIsChatLoading(false)
    }
  }

  const handleExampleQuestion = (question: string) => {
    setChatInput(question)
  }

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'snelheid': return '🏎️'
      case 'verkeerslichten': return '🚦'
      case 'verkeersborden': return '🛑'
      case 'wegmarkering': return '🛣️'
      case 'inhalen': return '↪️'
      case 'gedrag': return '📱'
      case 'veiligheid': return '🦺'
      case 'alcohol': return '🍺'
      case 'parkeren': return '🅿️'
      case 'hulpdiensten': return '🚑'
      case 'snelweg': return '🛣️'
      default: return '⚖️'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors">
                <Scale className="w-6 h-6" />
                <span className="font-semibold">WetHelder</span>
              </Link>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-blue-600 font-medium">Verkeersovertredingen</span>
            </div>
            
            <Link 
              href="/"
              className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              ← Terug naar hoofdpagina
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Zap className="w-4 h-4" />
            Officiële Verkeersbonnen Database
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Nederlandse Verkeersovertredingen
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Zoek naar verkeersbonnen en boetebedragen of stel specifieke vragen over verkeersovertredingen. 
            Alle informatie is gebaseerd op de officiële boetebase van het Openbaar Ministerie.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-1 flex">
            <button
              onClick={() => setActiveTab('search')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'search' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <Search className="w-5 h-5" />
              Zoeken in Database
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'chat' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <Car className="w-5 h-5" />
              Verkeersboete Assistent
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'search' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Search Panel */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Zoek Verkeersovertredingen</h2>
                
                {/* Search Input */}
                <div className="mb-6">
                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Bijv: door rood licht, te hard rijden, inhalen doorgetrokken streep..."
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <button
                      onClick={handleSearch}
                      disabled={isSearching || !searchQuery.trim()}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
                    >
                      {isSearching ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Zoeken...
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4" />
                          Zoeken
                        </>
                      )}
                    </button>
                  </div>
                  
                  <div className="mt-2 space-y-2">
                    <p className="text-sm text-gray-500">
                      💡 <strong>Tip:</strong> Je kunt ook zoeken met feitcodes (bijv. A230a) of natuurlijke taal gebruiken
                    </p>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <p className="text-sm text-amber-800">
                        ⚠️ <strong>Privacy:</strong> Voer geen persoonlijke gegevens in zoals kentekens, BSN-nummers, namen of adressen. Deze database is voor algemene informatie over verkeersovertredingen.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Loading State */}
                {isSearching && (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg px-6 py-4">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <div>
                        <div className="text-blue-800 font-medium">Zoeken in database...</div>
                        <div className="text-blue-600 text-sm">We doorzoeken de verkeersovertredingen voor u</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Search Results */}
                {searchResults.length > 0 && !isSearching && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Zoekresultaten ({searchResults.length})</h3>
                    {searchResults.map((result, index) => (
                      <div
                        key={index}
                        onClick={() => setSelectedResult(result)}
                        className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-2xl">{getCategoryIcon(result.category)}</span>
                              <div>
                                <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                  {result.violation}
                                </h4>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                    {result.category}
                                  </span>
                                  {result.feitcode && (
                                    <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded font-mono">
                                      {result.feitcode}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-2xl font-bold text-red-600">
                              €{result.fineAmount}
                            </div>
                            <div className="text-xs text-gray-500">
                              + €9 admin
                            </div>
                            <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors mt-1 ml-auto" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* No Results */}
                {searchQuery && searchResults.length === 0 && !isSearching && (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Geen resultaten gevonden</h3>
                    <p className="text-gray-600 mb-4">
                      Je zoekopdracht "{searchQuery}" is niet gevonden in de database.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                      <p className="text-blue-800 text-sm mb-3">
                        💡 <strong>Tip:</strong> Probeer de Verkeersboete Assistent voor meer uitgebreide informatie over je vraag.
                      </p>
                      <button
                        onClick={() => {
                          setActiveTab('chat')
                          setChatInput(`Wat is het boetebedrag voor: ${searchQuery}`)
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        <Car className="w-4 h-4" />
                        Vraag aan Verkeersboete Assistent
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Info Panel */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">Over deze Database</h3>
                </div>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li>✅ Officiële boetebedragen van het OM</li>
                  <li>✅ Geldig vanaf 1 februari 2025</li>
                  <li>✅ Inclusief feitcodes en wettelijke basis</li>
                  <li>✅ Bedragen exclusief €9 administratiekosten</li>
                </ul>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Veelgezochte Categorieën</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { category: 'Snelheid', icon: '🏎️', count: '5+' },
                    { category: 'Parkeren', icon: '🅿️', count: '4+' },
                    { category: 'Gedrag', icon: '📱', count: '3+' },
                    { category: 'Inhalen', icon: '↪️', count: '3+' }
                  ].map((cat) => (
                    <button
                      key={cat.category}
                      onClick={() => {
                        setSearchQuery(cat.category.toLowerCase())
                        handleSearch()
                      }}
                      className="flex items-center gap-2 p-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <span className="text-lg">{cat.icon}</span>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{cat.category}</div>
                        <div className="text-xs text-gray-500">{cat.count} overtredingen</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Chat Interface */
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border">
              {/* Chat Header */}
              <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Car className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Verkeersboete Assistent</h2>
                    <p className="text-sm text-gray-600">
                      Gespecialiseerd in verkeersovertredingen, boetes en feitcodes
                    </p>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="h-[500px] overflow-y-auto">
                {chatMessages.length === 0 ? (
                  <div className="p-8">
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Car className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Verkeersboete Assistent</h3>
                      <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        Ik help je met vragen over verkeersbonnen, boetebedragen, feitcodes en Nederlandse verkeersregels. 
                        Ik geef altijd de relevante feitcodes en verwijs naar officiële bronnen.
                      </p>
                      
                      <div className="grid grid-cols-1 gap-2 max-w-lg mx-auto">
                        {[
                          "Wat is het boetebedrag voor door rood rijden? (met feitcode)",
                          "Hoeveel boete krijg ik voor 15 km/h te hard op de snelweg?",
                          "Wat zijn de feitcodes voor bellen achter het stuur?",
                          "Mag ik inhalen bij een doorgetrokken streep?",
                          "Wat kost parkeren op een invalidenparkeerplaats?"
                        ].map((question, index) => (
                          <button
                            key={index}
                            onClick={() => handleExampleQuestion(question)}
                            className="p-3 text-left bg-gray-50 hover:bg-blue-50 hover:border-blue-200 border border-transparent transition-all text-sm group rounded-lg"
                          >
                            <span className="group-hover:text-blue-700">{question}</span>
                            <span className="text-gray-400 group-hover:text-blue-500 ml-2">→</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 space-y-6">
                    {chatMessages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex items-start gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                      >
                        {message.role === 'assistant' && (
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                            <Car className="w-4 h-4 text-blue-600" />
                          </div>
                        )}
                        {message.role === 'user' && (
                          <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                            <span className="text-sm font-medium text-primary-600">
                              {session?.user?.name?.[0]?.toUpperCase() || 'U'}
                            </span>
                          </div>
                        )}
                        
                        <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                          <div className={`inline-block max-w-[85%] rounded-lg p-4 ${
                            message.role === 'user' 
                              ? 'bg-gradient-to-r from-primary-100 to-primary-50 ml-8 border border-blue-200' 
                              : 'bg-legal-50 border border-legal-200'
                          }`}>
                            <div className={`text-sm ${message.role === 'user' ? 'text-primary-800' : 'text-legal-800'}`}>
                              {message.role === 'assistant' ? formatMessage(message.content) : message.content}
                            </div>
                            <div className={`text-xs mt-2 ${
                              message.role === 'user' ? 'text-primary-600' : 'text-legal-600'
                            }`}>
                              {message.timestamp.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {isChatLoading && (
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Car className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="bg-legal-50 border border-legal-200 rounded-lg p-4">
                          <div className="flex items-center gap-2">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                            </div>
                                                         <span className="text-sm text-legal-600">Verkeersboete Assistent denkt na...</span>
                           </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="border-t bg-gray-50 p-6">
                <form onSubmit={handleChatSubmit} className="flex gap-3">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Vraag naar boetes, feitcodes of verkeersregels..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim() || isChatLoading}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Verstuur
                  </button>
                </form>
                
                <div className="mt-2 space-y-2">
                  <p className="text-xs text-gray-500 text-center">
                    💡 Ik geef altijd feitcodes en verwijs naar boetebase.om.nl van het Openbaar Ministerie
                  </p>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
                    <p className="text-xs text-amber-800 text-center">
                      ⚠️ Voer geen persoonlijke gegevens in zoals kentekens, BSN-nummers of namen
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{getCategoryIcon(selectedResult.category)}</span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedResult.violation}</h2>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                        {selectedResult.category}
                      </span>
                      {selectedResult.feitcode && (
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-mono">
                          Feitcode: {selectedResult.feitcode}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedResult(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">💰</span>
                  <h3 className="text-lg font-semibold text-red-900">Boetebedrag</h3>
                </div>
                <div className="text-3xl font-bold text-red-600 mb-1">€{selectedResult.fineAmount}</div>
                <div className="text-sm text-red-700">+ €9 administratiekosten = €{selectedResult.fineAmount + 9} totaal</div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-blue-900">Officiële Omschrijving</h3>
                </div>
                <p className="text-blue-800 leading-relaxed">{selectedResult.description}</p>
              </div>

              <div className="mt-6 flex justify-between items-center text-sm text-gray-500">
                <span>Bron: Boetebase Openbaar Ministerie</span>
                <span>Geldig vanaf 1 februari 2025</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 