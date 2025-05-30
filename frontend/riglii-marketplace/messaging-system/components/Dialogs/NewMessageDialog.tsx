
import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Loader2, AlertCircle, FileText, DollarSign, Clock, ArrowLeft, Users } from "lucide-react"
import type { PublicUser } from "../../types"
import { getUserInitials } from "../../utils/formatters"

interface NewMessageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  searchResults: PublicUser[]
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
  const [selectedUser, setSelectedUser] = useState<PublicUser | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    time_estimate: ""
  })
  const [step, setStep] = useState<'users' | 'form'>('users')
  const [creating, setCreating] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  
  const supabase = createClient()
  const { toast } = useToast()

  // Only call onMount once when dialog opens
  useEffect(() => {
    if (open) {
      // Reset all state
      setStep('users')
      setSelectedUser(null)
      setSearchQuery("")
      setFormData({
        title: "",
        description: "",
        price: "",
        time_estimate: ""
      })
      // Call onMount only once
      const timer = setTimeout(() => {
        onMount()
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [open]) // Remove onMount from dependencies to prevent infinite loop

  // Handle search input changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    onSearch(value)
  }

  const handleUserSelect = (user: PublicUser) => {
    if (!isCurrentUserFreelancer) {
      setSelectedUser(user)
      setStep('form')
    } else {
      onUserSelect(user.id)
    }
  }

  const handleFormSubmit = async () => {
    if (!selectedUser || !formData.title || !formData.description || !formData.price || !formData.time_estimate) {
      toast({
        title: "Incomplete Form",
        description: "Please fill out all fields",
        variant: "destructive"
      })
      return
    }

    setCreating(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      // Check if trying to message yourself
      if (user.id === selectedUser.id) {
        throw new Error("Cannot create conversation with yourself")
      }

      // Ensure consistent ordering: smaller ID always goes to user1_id
      const user1_id = user.id < selectedUser.id ? user.id : selectedUser.id
      const user2_id = user.id < selectedUser.id ? selectedUser.id : user.id

      console.log('Creating conversation with:', { user1_id, user2_id })

      // Check if conversation already exists
      const { data: existingConv, error: checkError } = await supabase
        .from('conversations')
        .select('id')
        .eq('user1_id', user1_id)
        .eq('user2_id', user2_id)
        .maybeSingle() // Use maybeSingle instead of single to avoid error if not found

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing conversation:', checkError)
        throw checkError
      }

      let conversationId = existingConv?.id

      if (!conversationId) {
        // Create new conversation
        const { data: conversation, error: convError } = await supabase
          .from('conversations')
          .insert({
            user1_id: user1_id,
            user2_id: user2_id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (convError) {
          console.error('Conversation creation error:', convError)
          
          // If it's a unique constraint violation, try to fetch the existing conversation
          if (convError.code === '23505') {
            const { data: existingConv2 } = await supabase
              .from('conversations')
              .select('id')
              .eq('user1_id', user1_id)
              .eq('user2_id', user2_id)
              .single()
            
            if (existingConv2) {
              conversationId = existingConv2.id
            } else {
              throw convError
            }
          } else {
            throw convError
          }
        } else {
          conversationId = conversation.id
        }
      }

      console.log('Using conversation ID:', conversationId)

      // Create form
      const { data: form, error: formError } = await supabase
        .from('forms')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          receiver_id: selectedUser.id,
          title: formData.title.trim(),
          description: formData.description.trim(),
          price: parseFloat(formData.price),
          time_estimate: formData.time_estimate.trim(),
          status: 'pending'
        })
        .select()
        .single()

      if (formError) {
        console.error('Form creation error:', formError)
        throw formError
      }

      // Create message with form
      const { error: msgError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          receiver_id: selectedUser.id,
          content: '',
          form_id: form.id,
          message_type: 'form'
        })

      if (msgError) {
        console.error('Message creation error:', msgError)
        throw msgError
      }

      toast({
        title: "Proposal Sent",
        description: "Your project proposal has been sent successfully"
      })

      onOpenChange(false)
      onUserSelect(conversationId) // Pass conversation ID instead of user ID
    } catch (error: any) {
      console.error('Error in form submission:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to send proposal. Please try again.",
        variant: "destructive"
      })
    } finally {
      setCreating(false)
    }
  }

  const renderUserList = () => {
    if (searching) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-3" />
          <p className="text-sm text-gray-500">Searching...</p>
        </div>
      )
    }

    if (searchResults.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Users className="h-12 w-12 text-gray-300 mb-3" />
          <p className="text-sm text-gray-500">
            {searchQuery 
              ? `No results for "${searchQuery}"`
              : `No ${isCurrentUserFreelancer ? 'clients' : 'freelancers'} available`}
          </p>
        </div>
      )
    }

    return (
      <div className="space-y-2">
        {searchResults.map((user) => (
          <button
            key={user.id}
            onClick={() => handleUserSelect(user)}
            className="w-full p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3 text-left border border-transparent hover:border-gray-200"
          >
            <Avatar className="h-10 w-10">
              {user.avatar_url && <AvatarImage src={user.avatar_url} />}
              <AvatarFallback className="bg-gray-200">
                {getUserInitials(user.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user.full_name}</p>
              <p className="text-sm text-gray-600 truncate">{user.email}</p>
            </div>
            {user.is_freelancer && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                Freelancer
              </span>
            )}
          </button>
        ))}
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {step === 'users' 
              ? `Find ${isCurrentUserFreelancer ? 'Clients' : 'Freelancers'}`
              : 'Create Project Proposal'}
          </DialogTitle>
        </DialogHeader>

        {step === 'users' && (
          <>
            {!isCurrentUserFreelancer && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Project Proposal Required</p>
                  <p className="mt-1">You must send a project proposal to start a conversation with a freelancer.</p>
                </div>
              </div>
            )}

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={`Search ${isCurrentUserFreelancer ? 'clients' : 'freelancers'}...`}
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9"
                autoFocus
              />
            </div>

            <ScrollArea className="h-[300px] mt-4">
              {renderUserList()}
            </ScrollArea>
          </>
        )}

        {step === 'form' && selectedUser && (
          <div className="space-y-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep('users')}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to user selection
            </Button>

            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Sending to: <span className="font-medium text-gray-900">{selectedUser.full_name}</span>
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Project Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g., E-commerce Website Development"
                />
              </div>

              <div>
                <Label htmlFor="description">Project Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe your project requirements, goals, and any specific features..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Budget (USD) *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="pl-10"
                      placeholder="5000"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="time_estimate">Timeline *</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="time_estimate"
                      value={formData.time_estimate}
                      onChange={(e) => setFormData({...formData, time_estimate: e.target.value})}
                      className="pl-10"
                      placeholder="e.g., 4-6 weeks"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={creating}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleFormSubmit}
                  disabled={creating || !formData.title || !formData.description || !formData.price || !formData.time_estimate}
                  className="flex-1 bg-[#00D37F] hover:bg-[#00c070]"
                >
                  {creating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Send Proposal & Start Chat
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
