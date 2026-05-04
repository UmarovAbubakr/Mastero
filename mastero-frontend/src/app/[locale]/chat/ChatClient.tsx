"use client"

import React, { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { 
  useGetConversationsQuery, 
  useGetMessagesQuery, 
  useSendMessageMutation,
  useEditMessageMutation,
  useDeleteMessageMutation,
  useToggleReactionMutation
} from '@/src/store/api/chatApi'
import { useGetMeQuery } from '@/src/store/api/authApi'
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { 
  Send, 
  MessageCircle, 
  Search,
  ChevronLeft,
  MoreVertical,
  Paperclip,
  Smile,
  Pencil,
  Trash2,
  X,
  Check,
  ImageIcon,
  CheckCheck
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const COMMON_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏", "🔥", "✅", "🙌", "✨"]

export function ChatClient() {
  const searchParams = useSearchParams()
  const initialConvId = searchParams.get('id')
  const [selectedConvId, setSelectedConvId] = useState<string | null>(initialConvId)
  const [messageText, setMessageText] = useState('')
  
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState('')
  const [hoveredMsgId, setHoveredMsgId] = useState<string | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [base64Image, setBase64Image] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const { data: me } = useGetMeQuery(undefined)
  const { data: conversations, isLoading: isLoadingConvs } = useGetConversationsQuery(undefined)
  const { data: messages, isLoading: isLoadingMsgs } = useGetMessagesQuery(selectedConvId, {
    skip: !selectedConvId,
    pollingInterval: 3000,
  })
  
  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation()
  const [editMessage] = useEditMessageMutation()
  const [deleteMessage] = useDeleteMessageMutation()
  const [toggleReaction] = useToggleReactionMutation()

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    if (messageText.endsWith(':')) {
      setShowSuggestions(true)
    } else if (!messageText.includes(':')) {
      setShowSuggestions(false)
    }
  }, [messageText])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageText.trim() && !base64Image) return

    try {
      await sendMessage({ 
        conversationId: selectedConvId, 
        content: messageText,
        imageUrl: base64Image
      }).unwrap()
      
      setMessageText('')
      setSelectedFile(null)
      setPreviewUrl(null)
      setBase64Image(null)
    } catch (err) {
      console.error("Failed to send message:", err)
    }
  }

  const handleEdit = async () => {
    if (!editingId || !editingText.trim()) return
    try {
      await editMessage({ id: editingId, content: editingText, conversationId: selectedConvId }).unwrap()
      setEditingId(null)
    } catch (err) { console.error(err) }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteMessage({ id, conversationId: selectedConvId }).unwrap()
      toast.success("Сообщение удалено")
    } catch (err) { 
      console.error(err) 
      toast.error("Не удалось удалить сообщение")
    }
  }

  const handleReaction = async (messageId: string, emoji: string) => {
    try {
      await toggleReaction({ messageId, emoji, conversationId: selectedConvId }).unwrap()
      setHoveredMsgId(null)
    } catch (err) { console.error(err) }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setBase64Image(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const insertEmoji = (emoji: string) => {
    if (showSuggestions) {
      setMessageText(prev => prev.slice(0, -1) + emoji + " ")
      setShowSuggestions(false)
    } else {
      setMessageText(prev => prev + emoji)
    }
    setShowEmojiPicker(false)
  }

  const selectedConv = conversations?.find((c: any) => c.id === selectedConvId)
  const partner = selectedConv?.participants.find((p: any) => p.id !== me?.id)

  return (
    <div className="min-h-screen bg-white dark:bg-[#020617] text-slate-900 dark:text-slate-50 pt-20 flex overflow-hidden h-screen font-sans">
      <div className={cn("w-full md:w-[380px] border-r border-slate-200 dark:border-white/5 flex flex-col bg-slate-50 dark:bg-[#020617]/50 backdrop-blur-3xl", selectedConvId ? "hidden md:flex" : "flex")}>
        <div className="p-6"><div className="flex justify-between items-end mb-8"><h1 className="text-3xl font-black tracking-tighter text-white">Чаты</h1><div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">{conversations?.length || 0} Активных</div></div><div className="relative group"><Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" /><Input placeholder="Поиск..." className="pl-12 h-12 bg-white/5 border-white/5 rounded-2xl focus-visible:ring-indigo-500/30 transition-all placeholder:text-slate-600" /></div></div>
        <div className="flex-1 overflow-y-auto px-4 space-y-2 scrollbar-hide">
          {conversations?.map((conv: any) => {
            const otherUser = conv.participants.find((p: any) => p.id !== me?.id);
            const lastMsg = conv.messages?.[0];
            const isSelected = selectedConvId === conv.id;
            return (
              <div key={conv.id} onClick={() => setSelectedConvId(conv.id)} className={cn("p-6 flex gap-6 cursor-pointer transition-all rounded-3xl border border-transparent hover:bg-white/5", isSelected && "bg-indigo-600/20 border-indigo-500/20")}>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-800 flex items-center justify-center text-white font-black text-xl shadow-lg">{otherUser?.name?.[0]}</div>
                <div className="flex-1 min-w-0 py-1"><div className="flex justify-between items-center mb-1"><h3 className={cn("font-bold truncate text-sm", isSelected ? "text-indigo-400" : "text-slate-100")}>{otherUser?.name}</h3><span className="text-[9px] text-slate-500 font-bold">{lastMsg ? new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span></div><p className="text-xs text-slate-500 truncate font-medium">{lastMsg?.content || 'Начните общение'}</p></div>
              </div>
            )
          })}
        </div>
      </div>
      <div className={cn("flex-1 flex flex-col bg-gradient-to-b from-white to-slate-50 dark:from-[#020617] dark:to-[#010411]", !selectedConvId ? "hidden md:flex items-center justify-center" : "flex")}>
        {!selectedConvId ? (
          <div className="text-center"><div className="w-32 h-32 bg-indigo-500/5 rounded-[3rem] flex items-center justify-center mx-auto mb-8 border border-white/5"><MessageCircle size={48} className="text-indigo-500/20" /></div><h2 className="text-xl font-bold text-slate-400">Выберите диалог</h2></div>
        ) : (
          <>
            <div className="h-24 border-b border-slate-200 dark:border-white/5 flex items-center justify-between px-10 bg-white/80 dark:bg-[#020617]/50 backdrop-blur-2xl z-30">
              <div className="flex items-center gap-5"><Button variant="ghost" size="icon" className="md:hidden -ml-4" onClick={() => setSelectedConvId(null)}><ChevronLeft /></Button><div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/10 flex items-center justify-center text-indigo-400 font-black text-xl">{partner?.name?.[0]}</div><div><h2 className="text-lg font-black tracking-tight text-white">{partner?.name}</h2><div className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /><span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Онлайн</span></div></div></div>
            </div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-10 py-10 space-y-12 scrollbar-hide scroll-smooth">
              {messages?.map((msg: any) => (
                <div key={msg.id} className={cn("flex flex-col relative group transition-all", msg.senderId === me?.id ? "items-end" : "items-start")}>
                  <div className={cn("p-5 text-sm font-medium leading-relaxed shadow-2xl transition-all max-w-[70%]", msg.senderId === me?.id ? "bg-indigo-600 text-white rounded-[2.5rem] rounded-tr-xl" : "bg-white/5 border border-white/5 text-slate-100 rounded-[2.5rem] rounded-tl-xl backdrop-blur-sm")}>
                    {msg.content}
                    <div className="mt-2 text-[9px] font-black opacity-60 text-right">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-3xl border-t border-slate-200 dark:border-white/5 z-40 relative">
              <form onSubmit={handleSendMessage} className="flex gap-6 max-w-6xl mx-auto items-center">
                <Input value={messageText} onChange={(e) => setMessageText(e.target.value)} placeholder="Напишите сообщение..." className="h-16 bg-white/5 border-white/5 rounded-[2rem] px-10 focus-visible:ring-indigo-500/20 text-base" />
                <Button type="submit" disabled={!messageText.trim() || isSending} className="h-16 w-16 rounded-3xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shrink-0"><Send size={26} /></Button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
