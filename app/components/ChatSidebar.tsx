'use client'

import React, { useState, useEffect } from 'react'
import { MessageSquare, Plus, Clock, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { formatDistanceToNow } from 'date-fns'
import { nl } from 'date-fns/locale'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

interface Conversation {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  messages: Message[]
}

interface ChatSidebarProps {
  onConversationSelect: (conversationId: string, messages: Message[]) => void
  onNewConversation: () => void
  currentConversationId: string | null
  isCollapsed: boolean
  onToggleCollapse: () => void
}

export default function ChatSidebar({ 
  onConversationSelect, 
  onNewConversation, 
  currentConversationId,
  isCollapsed,
  onToggleCollapse
}: ChatSidebarProps) {
  const { data: session } = useSession()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(false)

  const loadConversations = async () => {
    if (!session) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/conversations')
      if (response.ok) {
        const data = await response.json()
        setConversations(data.conversations)
      }
    } catch (error) {
      console.error('Error loading conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadConversations()
  }, [session])

  const handleConversationClick = (conversation: Conversation) => {
    const messages = conversation.messages.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
      timestamp: new Date(msg.createdAt)
    }))
    onConversationSelect(conversation.id, messages as any)
  }

  const handleNewConversation = () => {
    onNewConversation()
    loadConversations() // Refresh the list
  }

  const deleteConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (!confirm('Weet je zeker dat je deze conversatie wilt verwijderen?')) {
      return
    }

    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setConversations(prev => prev.filter(conv => conv.id !== conversationId))
        if (currentConversationId === conversationId) {
          onNewConversation()
        }
      }
    } catch (error) {
      console.error('Error deleting conversation:', error)
    }
  }

  const truncateTitle = (title: string, maxLength: number = 30) => {
    return title.length > maxLength ? title.substring(0, maxLength) + '...' : title
  }

  if (!session) {
    return null
  }

  return (
    <div className={`${isCollapsed ? 'w-12' : 'w-80'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-gray-900">Gesprekken</span>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1 hover:bg-gray-100 rounded-md transition-colors"
          title={isCollapsed ? 'Uitklappen' : 'Inklappen'}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-gray-600" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          )}
        </button>
      </div>

      {/* New Conversation Button */}
      {!isCollapsed && (
        <div className="p-4">
          <button
            onClick={handleNewConversation}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Nieuw gesprek</span>
          </button>
        </div>
      )}

      {isCollapsed && (
        <div className="p-2">
          <button
            onClick={handleNewConversation}
            className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            title="Nieuw gesprek"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4">
            {!isCollapsed && (
              <div className="text-center text-gray-500">
                Gesprekken laden...
              </div>
            )}
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-4">
            {!isCollapsed && (
              <div className="text-center text-gray-500">
                Nog geen gesprekken
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => handleConversationClick(conversation)}
                className={`${
                  currentConversationId === conversation.id
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-white hover:bg-gray-50'
                } ${isCollapsed ? 'p-2' : 'p-3'} border rounded-lg cursor-pointer transition-all duration-200 group`}
              >
                {isCollapsed ? (
                  <div className="flex justify-center" title={conversation.title}>
                    <MessageSquare className="h-4 w-4 text-gray-600" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {truncateTitle(conversation.title)}
                        </h3>
                        <div className="flex items-center space-x-1 mt-1">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(conversation.updatedAt), {
                              addSuffix: true,
                              locale: nl
                            })}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => deleteConversation(conversation.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-all duration-200"
                        title="Verwijderen"
                      >
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </button>
                    </div>
                    {conversation.messages.length > 0 && (
                      <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                        {conversation.messages[0].content.substring(0, 100)}
                        {conversation.messages[0].content.length > 100 ? '...' : ''}
                      </p>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 