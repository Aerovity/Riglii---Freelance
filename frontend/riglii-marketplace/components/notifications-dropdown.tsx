"use client"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotificationsDropdown() {
  const notifications = [
    {
      id: 1,
      title: "Nouvelle commande",
      message: "Vous avez reçu une nouvelle commande",
      time: "Il y a 5 minutes",
    },
    {
      id: 2,
      title: "Message",
      message: "Nouveau message de support",
      time: "Il y a 1 heure",
    },
    {
      id: 3,
      title: "Mise à jour",
      message: "Mise à jour du système disponible",
      time: "Il y a 2 heures",
    },
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="text-[#0F2830] relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#00D37F] text-white text-xs flex items-center justify-center">
            3
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <h3 className="font-semibold">Notifications</h3>
          <Button variant="ghost" className="text-xs text-[#00D37F]">
            Tout marquer comme lu
          </Button>
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {notifications.map((notification) => (
            <DropdownMenuItem key={notification.id} className="flex flex-col items-start p-4 cursor-pointer">
              <div className="flex items-center justify-between w-full">
                <span className="font-medium">{notification.title}</span>
                <span className="text-xs text-gray-500">{notification.time}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
            </DropdownMenuItem>
          ))}
        </div>
        <div className="p-2 border-t">
          <Button variant="outline" className="w-full text-[#00D37F]">
            Voir toutes les notifications
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

