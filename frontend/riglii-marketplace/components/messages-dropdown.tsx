"use client"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Mail } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function MessagesDropdown() {
  const messages = [
    {
      id: 1,
      sender: "Ahmed K.",
      message: "Bonjour, je voudrais discuter du projet...",
      time: "10:30",
      unread: true,
    },
    {
      id: 2,
      sender: "Sarah M.",
      message: "Merci pour votre réponse rapide !",
      time: "Hier",
      unread: false,
    },
    {
      id: 3,
      sender: "Karim B.",
      message: "Le projet est terminé, voici les fichiers...",
      time: "Lun",
      unread: false,
    },
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="text-[#0F2830] relative">
          <Mail className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#00D37F] text-white text-xs flex items-center justify-center">
            1
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <h3 className="font-semibold">Messages</h3>
          <Button variant="ghost" className="text-xs text-[#00D37F]">
            Marquer tout comme lu
          </Button>
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {messages.map((message) => (
            <DropdownMenuItem
              key={message.id}
              className={`flex items-start p-4 cursor-pointer ${message.unread ? "bg-[#AFF8C8]/10" : ""}`}
            >
              <div className="w-8 h-8 rounded-full bg-[#AFF8C8] flex items-center justify-center text-[#014751] font-medium mr-3">
                {message.sender[0]}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{message.sender}</span>
                  <span className="text-xs text-gray-500">{message.time}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1 line-clamp-1">{message.message}</p>
              </div>
            </DropdownMenuItem>
          ))}
        </div>
        <div className="p-2 border-t">
          <Button variant="outline" className="w-full text-[#00D37F]">
            Voir tous les messages
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

