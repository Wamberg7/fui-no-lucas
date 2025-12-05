'use client'

import { Bell, Search, User, Menu, LogOut, Info, AlertCircle, Tag, Megaphone } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from './AuthProvider'
import { useRouter } from 'next/navigation'

interface Anuncio {
  id_anuncios: number
  titulo: string
  mensagem: string
  tipo: 'info' | 'aviso' | 'importante' | 'promocao'
  data_criacao: string
  ativo?: boolean
  criador?: {
    nome: string
  }
}

export default function TopBar() {
  const { usuario, logout } = useAuth()
  const router = useRouter()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [anuncios, setAnuncios] = useState<Anuncio[]>([])
  const [loadingAnuncios, setLoadingAnuncios] = useState(false)
  const notificationsRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function carregarAnuncios() {
      try {
        setLoadingAnuncios(true)
        const token = localStorage.getItem('token')
        if (!token) return

        const response = await fetch('/api/anuncios', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          // Filtrar apenas anúncios ativos
          const anunciosAtivos = (data || []).filter((anuncio: Anuncio & { ativo?: boolean }) => 
            anuncio.ativo !== false
          )
          setAnuncios(anunciosAtivos)
        }
      } catch (error) {
        console.error('Erro ao carregar anúncios:', error)
      } finally {
        setLoadingAnuncios(false)
      }
    }

    carregarAnuncios()
    // Recarregar a cada 30 segundos
    const interval = setInterval(carregarAnuncios, 30000)
    return () => clearInterval(interval)
  }, [])

  // Fechar menus ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }

    if (showNotifications || showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [showNotifications, showUserMenu])

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 bg-white border-b border-gray-200 shadow-sm z-40">
      <div className="flex items-center justify-between h-full px-6">
        {/* Search */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell className="h-5 w-5" />
              {anuncios.length > 0 && (
                <span className="absolute top-1 right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{anuncios.length > 9 ? '9+' : anuncios.length}</span>
                </span>
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Anúncios e Avisos</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {loadingAnuncios ? (
                    <div className="px-4 py-8 text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
                      <p className="text-xs text-gray-500 mt-2">Carregando...</p>
                    </div>
                  ) : anuncios.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <Megaphone className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Nenhum anúncio no momento</p>
                    </div>
                  ) : (
                    anuncios.map((anuncio) => {
                      const tempoAtras = calcularTempoAtras(anuncio.data_criacao)
                      const Icone = 
                        anuncio.tipo === 'importante' ? AlertCircle :
                        anuncio.tipo === 'aviso' ? AlertCircle :
                        anuncio.tipo === 'promocao' ? Tag :
                        Info

                      const corClasse = 
                        anuncio.tipo === 'importante' ? 'text-red-600 bg-red-50' :
                        anuncio.tipo === 'aviso' ? 'text-yellow-600 bg-yellow-50' :
                        anuncio.tipo === 'promocao' ? 'text-purple-600 bg-purple-50' :
                        'text-blue-600 bg-blue-50'

                      return (
                        <div
                          key={anuncio.id_anuncios}
                          onClick={() => setShowNotifications(false)}
                          className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-l-4 transition-colors ${
                            anuncio.tipo === 'importante' ? 'border-red-500' :
                            anuncio.tipo === 'aviso' ? 'border-yellow-500' :
                            anuncio.tipo === 'promocao' ? 'border-purple-500' :
                            'border-blue-500'
                          }`}
                        >
                          <div className="flex items-start space-x-2">
                            <div className={`p-1.5 rounded ${corClasse}`}>
                              <Icone className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">{anuncio.titulo}</p>
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">{anuncio.mensagem}</p>
                              <p className="text-xs text-gray-500 mt-1">{tempoAtras}</p>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User */}
          <div className="relative flex items-center space-x-3 pl-4 border-l border-gray-200" ref={userMenuRef}>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{usuario?.nome || 'Usuário'}</p>
              <p className="text-xs text-gray-500">{usuario?.email || ''}</p>
            </div>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold hover:ring-2 hover:ring-primary-500 transition-all"
            >
              {usuario?.nome?.charAt(0).toUpperCase() || 'U'}
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-12 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">{usuario?.nome}</p>
                  <p className="text-xs text-gray-500">{usuario?.email}</p>
                </div>
                <button
                  onClick={() => {
                    logout()
                    setShowUserMenu(false)
                  }}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sair</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

function calcularTempoAtras(data: string): string {
  const agora = new Date()
  const dataAnuncio = new Date(data)
  const diffMs = agora.getTime() - dataAnuncio.getTime()
  const diffMinutos = Math.floor(diffMs / 60000)
  const diffHoras = Math.floor(diffMs / 3600000)
  const diffDias = Math.floor(diffMs / 86400000)

  if (diffMinutos < 1) return 'Agora'
  if (diffMinutos < 60) return `Há ${diffMinutos} minuto${diffMinutos !== 1 ? 's' : ''}`
  if (diffHoras < 24) return `Há ${diffHoras} hora${diffHoras !== 1 ? 's' : ''}`
  if (diffDias < 7) return `Há ${diffDias} dia${diffDias !== 1 ? 's' : ''}`
  return dataAnuncio.toLocaleDateString('pt-BR')
}

