"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Loader2, Users } from "lucide-react"
import { getUserInitials } from "../../utils/formatters"
import type { PublicUser } from "../../types"

interface NewMessageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  searchResults: PublicUser[]
  searching: boolean
  isCurrentUserFreelancer: boolean | null
  onSearch: (query: string) => void
  onUserSelect: (userId: string) => void
  onMount?: () => void
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

  // Call onMount when dialog opens
  useEffect(() => {
    if (open && onMount) {
      onMount()
    }
  }, [open, onMount])

  // Handle search
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.trim()) {
        onSearch(searchQuery)
      } else if (open) {
        // If search is empty and dialog is open, fetch recommended users
        onMount?.()
      }
    }, 300)

    return () => clearTimeout(delayDebounce)
  }, [searchQuery, onSearch, onMount, open])

  const handleSelectUser = (user: PublicUser) => {
    onUserSelect(user.id)
    setSearchQuery("")
  }

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setSearchQuery("")
    }
  }, [open])

  // Determine the target user type
  const targetUserType = isCurrentUserFreelancer ? "Clients" : "Freelancers"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>New Message</DialogTitle>
          <DialogDescription>
            Search for {targetUserType.toLowerCase()} to start a conversation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={`Search ${targetUserType.toLowerCase()} by name or email...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              autoFocus
            />
          </div>

          <ScrollArea className="h-[300px] rounded-md border">
            {searching ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : searchResults && searchResults.length > 0 ? (
              <div className="p-2">
                <p className="text-xs text-gray-500 mb-2 px-3">
                  {searchQuery ? "Search Results" : `Recommended ${targetUserType}`}
                </p>
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => handleSelectUser(user)}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                  >
                    <Avatar className="h-10 w-10">
                      {user.avatar_url && (
                        <AvatarImage src={user.avatar_url} />
                      )}
                      <AvatarFallback>
                        {getUserInitials(user.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{user.full_name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    {user.is_freelancer && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        Freelancer
                      </span>
                    )}
                    {!user.is_freelancer && isCurrentUserFreelancer && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        Client
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : searchQuery.length > 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <Users className="h-8 w-8 mb-2" />
                <p className="text-sm">No {targetUserType.toLowerCase()} found</p>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p className="text-sm text-center">
                  {isCurrentUserFreelancer === null 
                    ? "Loading..." 
                    : `Type to search for ${targetUserType.toLowerCase()}`}
                </p>
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}