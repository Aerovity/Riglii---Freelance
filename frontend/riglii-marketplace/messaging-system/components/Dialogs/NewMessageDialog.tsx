import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, Loader2 } from "lucide-react"
import type { SearchResult } from "../../types"
import { getUserInitials } from "../../utils/formatters"

interface NewMessageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  searchResults: SearchResult[]
  searching: boolean
  isCurrentUserFreelancer: boolean | null
  onSearch: (query: string) => void
  onUserSelect: (userId: string) => void
  onMount: () => void
}

export default function NewMessageDialog({
  open,
  onOpenChange,
  searchResults,
  searching,
  isCurrentUserFreelancer,
  onSearch,
  onUserSelect,
  onMount
}: NewMessageDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const searchInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (open) {
      onMount()
    } else {
      setSearchQuery("")
    }
  }, [open, onMount])

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    onSearch(value)
  }

  const handleUserClick = (userId: string) => {
    onUserSelect(userId)
    setSearchQuery("")
  }

  const handleProfileClick = (e: React.MouseEvent, userId: string, isFreelancer: boolean) => {
    if (isFreelancer) {
      e.stopPropagation()
      router.push(`/freelancer/${userId}`)
    }
  }

  const getUserTypeLabel = () => {
    if (isCurrentUserFreelancer === true) return 'Find Clients'
    if (isCurrentUserFreelancer === false) return 'Find Freelancers'
    return 'Loading...'
  }

  const getSearchPlaceholder = () => {
    if (isCurrentUserFreelancer === true) return 'Search for clients...'
    if (isCurrentUserFreelancer === false) return 'Search for freelancers...'
    return 'Search for users...'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Message - {getUserTypeLabel()}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              ref={searchInputRef}
              type="text"
              placeholder={getSearchPlaceholder()}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>
          
          {searching ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : searchResults.length > 0 ? (
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {searchResults.map((result) => (
                  <div
                    key={result.id}
                    onClick={() => handleUserClick(result.id)}
                    className="p-3 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className={`${result.is_freelancer ? "cursor-pointer group" : ""}`}
                        onClick={(e) => handleProfileClick(e, result.id, result.is_freelancer)}
                      >
                        <Avatar className={`h-10 w-10 ${
                          result.is_freelancer 
                            ? 'group-hover:ring-2 group-hover:ring-[#00D37F] transition-all' 
                            : ''
                        }`}>
                          {result.avatar_url && <AvatarImage src={result.avatar_url} />}
                          <AvatarFallback className="bg-[#00D37F] text-white">
                            {getUserInitials(result.full_name)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{result.full_name}</p>
                          {result.is_freelancer && (
                            <Badge variant="secondary" className="text-xs">Freelancer</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{result.email}</p>
                        {result.freelancer_profile?.occupation && (
                          <p className="text-xs text-gray-500">{result.freelancer_profile.occupation}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : searchQuery.length > 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No users found</p>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p className="text-sm">
                Loading {
                  isCurrentUserFreelancer === true 
                    ? 'clients' 
                    : isCurrentUserFreelancer === false 
                      ? 'freelancers' 
                      : 'users'
                }...
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}