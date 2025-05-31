import { useEffect, useRef, useMemo } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Message } from "../../types"
import MessageItem from "./MessageItem"

interface MessagesListProps {
  messages: Message[]
  currentUserId: string
  onFormUpdate?: () => void
}

export default function MessagesList({ messages, currentUserId, onFormUpdate }: MessagesListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const previousMessageCountRef = useRef<number>(0)

  useEffect(() => {
    // Only scroll if new messages were added
    if (messages.length > previousMessageCountRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
    previousMessageCountRef.current = messages.length
  }, [messages])

  // Use useMemo to filter messages and prevent duplicate forms
  const filteredMessages = useMemo(() => {
    const seenFormIds = new Set<string>()
    
    return messages.filter((message) => {
      // Always show non-form messages
      if (message.message_type !== "form" || !message.form) {
        return true
      }
      
      // For form messages, check if we've already seen this form ID
      const formId = message.form.id
      
      // If this is the first time seeing this form, show it
      if (!seenFormIds.has(formId)) {
        seenFormIds.add(formId)
        return true
      }
      
      // Otherwise, skip it (it's a duplicate)
      return false
    })
  }, [messages])

 

  return (
    <ScrollArea className="flex-1 px-4 py-4 bg-white">
      <div className="space-y-4">
        {filteredMessages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            currentUserId={currentUserId}
            onFormUpdate={onFormUpdate}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  )
}