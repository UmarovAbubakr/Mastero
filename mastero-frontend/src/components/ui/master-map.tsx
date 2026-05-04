'use client'

import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Star, User, Phone, MessageCircle } from 'lucide-react'
import { Button } from './button'
import { useTranslations } from 'next-intl'

// Fix for default marker icons in Leaflet + Next.js
const customIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/2776/2776067.png', // Premium Map Marker
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
})

interface MasterLocation {
  id: string
  name: string
  skills: string
  rating: number
  price: number
  lat: number
  lng: number
}

interface MasterMapProps {
  masters: MasterLocation[]
  center?: [number, number]
  zoom?: number 
}

function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom)
  }, [center, zoom, map])
  return null
}

export default function MasterMap({ masters, center = [38.5358, 68.7791], zoom = 13 }: MasterMapProps) {
  const t = useTranslations('Search')
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return <div className="w-full h-[500px] bg-slate-900 animate-pulse rounded-3xl" />

  return (
    <div className="w-full h-[500px] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%', background: '#020617' }}
        scrollWheelZoom={false}
      >
        <ChangeView center={center} zoom={zoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {masters.map((master) => (
          <Marker 
            key={master.id} 
            position={[master.lat, master.lng]} 
            icon={customIcon}
          >
            <Popup className="premium-popup">
              <div className="p-6 min-w-[200px] bg-[#070A24] text-white rounded-2xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-3xl flex items-center justify-center">
                    <User size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{master.name}</h4>
                    <p className="text-[10px] text-slate-400 uppercase font-black">{master.skills}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-yellow-500 font-bold text-xs">
                    <Star size={12} fill="currentColor" /> {master.rating}
                  </div>
                  <div className="text-indigo-400 font-black text-xs">
                    {master.price} {t('currency')}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-3xl h-10 text-[10px] font-black uppercase tracking-widest">
                    {t('view_profile')}
                  </Button>
                  <Button size="sm" variant="outline" className="w-10 h-10 border-slate-800 bg-slate-900 text-indigo-400 rounded-3xl p-0">
                    <MessageCircle size={16} />
                  </Button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Status Overlay */}
      <div className="absolute top-6 left-6 z-[1000] bg-slate-900/90 backdrop-blur-xl border border-slate-800 px-6 py-3 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-6 duration-700">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          <span className="text-sm font-bold text-slate-200">
            {t('found_masters', { count: masters.length })}
          </span>
        </div>
      </div>
    </div>
  )
}

