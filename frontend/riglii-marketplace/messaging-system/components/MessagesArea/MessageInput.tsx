import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Send, Paperclip, X, Image, FileText } from "lucide-react"
import { validateFile } from "../../utils/validations"
import { ACCEPTED_FILE_TYPES } from "../../constants"

interface MessageInputProps {
  onSendMessage: (content: string, file?: File) => void
  sending: boolean
}

export default function MessageInput({ onSendMessage, sending }: MessageInputProps) {
  const [newMessage, setNewMessage] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const validation = validateFile(file)
      if (!validation.isValid) {
        toast({
          title: "Invalid File",
          description: validation.error,
          variant: "destructive",
        })
        return
      }
      setSelectedFile(file)
    }
  }

  const handleSend = () => {
    if (!newMessage.trim() && !selectedFile) return
    
    onSendMessage(newMessage, selectedFile || undefined)
    setNewMessage("")
    setSelectedFile(null)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="px-4 py-3 border-t border-gray-200 bg-white">
      {selectedFile && (
        <div className="mb-2 p-2 bg-gray-100 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            {selectedFile.type.startsWith('image/') ? (
              <Image className="h-4 w-4 text-gray-600" />
            ) : (
              <FileText className="h-4 w-4 text-gray-600" />
            )}
            <span className="text-sm truncate max-w-xs">{selectedFile.name}</span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSelectedFile(null)}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          accept={ACCEPTED_FILE_TYPES}
        />
        <Button
          size="icon"
          variant="ghost"
          onClick={() => fileInputRef.current?.click()}
          disabled={sending}
          className="h-9 w-9"
        >
          <Paperclip className="h-4 w-4 text-gray-500" />
        </Button>
        <Input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={sending}
          className="flex-1 h-9 bg-gray-100 border-0 rounded-full focus-visible:ring-1 focus-visible:ring-gray-300"
        />
        <Button 
          size="icon"
          onClick={handleSend} 
          disabled={sending || (!newMessage.trim() && !selectedFile)}
          className="h-9 w-9 bg-[#00D37F] hover:bg-[#00c070] rounded-full"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}