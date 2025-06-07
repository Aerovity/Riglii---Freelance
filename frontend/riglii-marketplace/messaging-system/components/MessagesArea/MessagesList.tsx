import { useEffect, useRef, useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import MessageDisplay from "./MessageDisplay"
import type { Message } from "../../types"

interface MessagesListProps {
  messages: Message[]
  currentUserId: string
  onFormUpdate?: () => void
}

export default function MessagesList({ 
  messages, 
  currentUserId, 
  onFormUpdate 
}: MessagesListProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const [isUserScrolling, setIsUserScrolling] = useState(false)
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom function
  const scrollToBottom = (behavior: 'smooth' | 'auto' = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior,
        block: 'end'
      })
    }
  }

  // Check if user is near bottom
  const isNearBottom = () => {
    const scrollArea = scrollAreaRef.current
    if (!scrollArea) return false
    
    const { scrollTop, scrollHeight, clientHeight } = scrollArea
    const threshold = 100 // pixels from bottom
    return scrollHeight - scrollTop - clientHeight < threshold
  }

  // Handle scroll events
  const handleScroll = () => {
    if (!scrollAreaRef.current) return
    
    const nearBottom = isNearBottom()
    setShouldAutoScroll(nearBottom)
    
    // If user scrolls up, they're manually scrolling
    if (!nearBottom) {
      setIsUserScrolling(true)
    } else {
      setIsUserScrolling(false)
    }
  }

  // Auto-scroll when new messages arrive (only if user is near bottom)
  useEffect(() => {
    if (shouldAutoScroll && !isUserScrolling) {
      // Small delay to ensure DOM is updated
      const timeoutId = setTimeout(() => {
        scrollToBottom('smooth')
      }, 100)
      
      return () => clearTimeout(timeoutId)
    }
  }, [messages.length, shouldAutoScroll, isUserScrolling])

  // Scroll to bottom on initial load
  useEffect(() => {
    if (messages.length > 0) {
      // Immediate scroll on first load
      const timeoutId = setTimeout(() => {
        scrollToBottom('auto')
      }, 50)
      
      return () => clearTimeout(timeoutId)
    }
  }, [messages.length === 0 ? 0 : 1]) // Only trigger on first messages load

  // Reset scroll behavior when conversation changes
  useEffect(() => {
    setShouldAutoScroll(true)
    setIsUserScrolling(false)
    // Immediate scroll when conversation changes
    setTimeout(() => scrollToBottom('auto'), 100)
  }, [currentUserId])

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center text-gray-500">
          <p className="text-sm">No messages yet</p>
          <p className="text-xs mt-1">Start the conversation!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <ScrollArea 
        className="flex-1 px-4"
        ref={scrollAreaRef}
        onScrollCapture={handleScroll}
      >
        <div className="py-4 space-y-1">
          {messages.map((message, index) => {
            const isOwn = message.sender_id === currentUserId
            const prevMessage = index > 0 ? messages[index - 1] : null
            const nextMessage = index < messages.length - 1 ? messages[index + 1] : null
            
            // Group messages by same sender
            const isFirstInGroup = !prevMessage || prevMessage.sender_id !== message.sender_id
            const isLastInGroup = !nextMessage || nextMessage.sender_id !== message.sender_id
            
            return (
              <div key={message.id} className={`${!isFirstInGroup ? 'mt-1' : 'mt-4'}`}>
                <MessageDisplay
                  message={message}
                  isOwn={isOwn}
                  currentUserId={currentUserId}
                  allMessages={messages}
                  conversationId={message.conversation_id}
                />
              </div>
            )
          })}
          
          {/* Invisible element to scroll to */}
          <div ref={messagesEndRef} className="h-1" />
        </div>
      </ScrollArea>
      
      {/* Show "scroll to bottom" button when user has scrolled up */}
      {isUserScrolling && !shouldAutoScroll && (
        <div className="absolute bottom-20 right-6 z-10">
          <button
            onClick={() => {
              setShouldAutoScroll(true)
              setIsUserScrolling(false)
              scrollToBottom('smooth')
            }}
            className="bg-primary text-primary-foreground rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow"
            aria-label="Scroll to bottom"
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 14l-7 7m0 0l-7-7m7 7V3" 
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}