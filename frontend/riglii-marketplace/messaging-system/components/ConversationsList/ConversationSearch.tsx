import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface ConversationSearchProps {
  value: string
  onChange: (value: string) => void
}

export default function ConversationSearch({ value, onChange }: ConversationSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      <Input
        type="text"
        placeholder="Search conversations..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9 h-9 bg-gray-100 border-0 rounded-full focus-visible:ring-1 focus-visible:ring-gray-300"
      />
    </div>
  )
}