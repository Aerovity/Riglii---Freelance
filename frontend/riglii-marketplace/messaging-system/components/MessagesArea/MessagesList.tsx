import { useEffect, useRef } from "react"
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

  return (
    <ScrollArea className="flex-1 px-4 py-4 bg-white">
      <div className="space-y-1">
        {messages.map((message) => (
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