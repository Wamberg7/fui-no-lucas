'use client'

import { useState, useEffect } from 'react'
import { Save, X, Building2, Store, Lock, User, CreditCard, Palette, Layout, Puzzle, Plug, Bell, Globe, Copy, RefreshCw, ArrowLeft, ArrowRight, Code, MessageSquare, Plus, Trash2, Eye, EyeOff, Settings, Wallet, Users, DollarSign, MessageCircle } from 'lucide-react'
import Link from 'next/link'

const tabs = [
  { id: 'geral', label: 'Geral', icon: Store },
  { id: 'contatos', label: 'Contatos', icon: User },
  { id: 'pagamentos', label: 'Pagamentos', icon: CreditCard },
  { id: 'tema', label: 'Tema', icon: Palette },
  { id: 'template', label: 'Template', icon: Layout },
  { id: 'widgets', label: 'Widgets', icon: Puzzle },
  { id: 'integracoes', label: 'Integrações', icon: Plug },
  { id: 'notificacoes', label: 'Notificações', icon: Bell },
  { id: 'dominio', label: 'Domínio', icon: Globe },
]

interface ChaveAPI {
  id_chave_api: number
  nome_chave: string
  chave_api: string
  ativa: boolean
  ultimo_uso: string | null
  data_criacao: string
}

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState('geral')
  const [mostrarChave, setMostrarChave] = useState(false)
  const [loading, setLoading] = useState(false)
  const [chavesAPI, setChavesAPI] = useState<ChaveAPI[]>([])
  const [novaChaveGerada, setNovaChaveGerada] = useState<string | null>(null)
  const [nomeNovaChave, setNomeNovaChave] = useState('')
  const [loadingChaves, setLoadingChaves] = useState(false)
  const [gatewaysAtivos, setGatewaysAtivos] = useState<{ [key: string]: boolean }>({
    carteira: false,
    pushinpay: false,
    mercadopago: false
  })
  const [gatewayConfigurando, setGatewayConfigurando] = useState<string | null>(null)
  const [mostrarModalTarifas, setMostrarModalTarifas] = useState(false)
  const [mostrarModalDiscord, setMostrarModalDiscord] = useState(false)
  const [webhookUrlTemp, setWebhookUrlTemp] = useState('')
  const [notificacaoAtivando, setNotificacaoAtivando] = useState<string | null>(null)
  const [configGateway, setConfigGateway] = useState<{ [key: string]: any }>({
    carteira: { cpf: '', nome_completo: '', chave_pix: '' },
    mercadopago: { access_token: '', public_key: '' },
    pushinpay: { api_key: '', secret_key: '' }
  })
  const [loadingGateways, setLoadingGateways] = useState(false)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [mostrarModalSolicitacaoCarteira, setMostrarModalSolicitacaoCarteira] = useState(false)
  const [carteiraAprovada, setCarteiraAprovada] = useState(false)
  const [solicitacaoPendente, setSolicitacaoPendente] = useState(false)
  const [config, setConfig] = useState({
    // Geral
    nome_loja: '',
    descricao_loja: '',
    cnpj: '',
    modo_manutencao: false,
    login_cliente: true,
    // Contatos
    email: '',
    telefone: '',
    endereco: '',
    // Pagamentos
    gateway_pagamento: 'stripe',
    chave_api: '',
    // Tema
    cor_principal: '#3b82f6',
    cor_secundaria: '#8b5cf6',
    // Template
    layout: 'padrao',
    // Widgets
    chat_online: true,
    avaliacoes: true,
    // Integrações
    google_analytics: '',
    facebook_pixel: '',
    // Notificações
    email_vendas: true,
    email_estoque: false,
    // Discord Webhooks
    discord_webhook_url: '',
    discord_webhook_nome: '',
    discord_notificar_vendas_publico: false,
    discord_notificar_vendas_admin: false,
    discord_notificar_estoque_baixo: false,
    discord_notificar_saque_afiliado: false,
    // Domínio
    dominio_personalizado: '',
  })

  useEffect(() => {
    // Verificar se é super admin e redirecionar
    const checkAndRedirect = async () => {
      const pathname = window.location.pathname
      if (pathname.startsWith('/admin')) return

      const token = localStorage.getItem('token')
      const isSuperAdminLocal = localStorage.getItem('isSuperAdmin')
      
      if (token && isSuperAdminLocal === 'true') {
        try {
          const response = await fetch('/api/admin/verificar-admin', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          
          if (response.ok) {
            const data = await response.json()
            if (data.is_super_admin) {
              window.location.href = '/admin'
              return
            }
          }
        } catch (error) {
          console.error('Erro ao verificar super admin:', error)
        }
      }
    }
    
    checkAndRedirect()
    
    // Carregar configurações salvas
    async function carregarConfig() {
      try {
        const token = localStorage.getItem('token')
        if (!token) return

        const [configResponse, discordResponse] = await Promise.all([
          fetch('/api/configuracoes', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }),
          fetch('/api/discord/webhook', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
        ])

        if (configResponse.ok) {
          const data = await configResponse.json()
          setConfig((prevConfig) => ({ ...prevConfig, ...data }))
        }

        if (discordResponse.ok) {
          const discordData = await discordResponse.json()
          if (discordData) {
            setConfig((prevConfig) => ({
              ...prevConfig,
              discord_webhook_url: discordData.webhook_url || '',
              discord_webhook_nome: discordData.nome_webhook || '',
              discord_notificar_vendas_publico: discordData.notificar_vendas_publico || false,
              discord_notificar_vendas_admin: discordData.notificar_vendas_admin || false,
              discord_notificar_estoque_baixo: discordData.notificar_estoque_baixo || false,
              discord_notificar_saque_afiliado: discordData.notificar_saque_afiliado || false
            }))
          }
        }
      } catch (error) {
        console.error('Erro ao carregar configurações:', error)
      }
    }
    carregarConfig()
    carregarChavesAPI()
    carregarGateways()
    verificarSuperAdmin()
  }, [])

  // Recarregar status da carteira quando abrir a aba de pagamentos
  useEffect(() => {
    if (activeTab === 'pagamentos' && !isSuperAdmin) {
      carregarGateways()
    }
  }, [activeTab, isSuperAdmin])

  async function verificarSuperAdmin() {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('/api/admin/verificar-admin', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setIsSuperAdmin(data.is_super_admin || false)
      }
    } catch (error) {
      console.error('Erro ao verificar super admin:', error)
      setIsSuperAdmin(false)
    }
  }

  async function carregarGateways() {
    try {
      setLoadingGateways(true)
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('/api/gateways-carteira', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const gateways = await response.json()
        
        // Atualizar estados com dados do banco
        const novosAtivos: { [key: string]: boolean } = {}
        const novasConfigs: { [key: string]: any } = {
          carteira: { cpf: '', nome_completo: '', chave_pix: '' },
          mercadopago: { access_token: '', public_key: '' },
          pushinpay: { api_key: '', secret_key: '' }
        }

        gateways.forEach((gateway: any) => {
          novosAtivos[gateway.gateway_tipo] = gateway.ativo
          if (gateway.credenciais) {
            novasConfigs[gateway.gateway_tipo] = gateway.credenciais
          }
        })

        setGatewaysAtivos(prev => ({ ...prev, ...novosAtivos }))
        setConfigGateway(prev => ({ ...prev, ...novasConfigs }))
      }

      // Verificar status da solicitação de carteira (apenas para donos de loja)
      if (!isSuperAdmin) {
        // Verificar se há solicitação aprovada (mais recente)
        const carteiraResponse = await fetch('/api/carteira-pendente/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (carteiraResponse.ok) {
          const todasSolicitacoes = await carteiraResponse.json()
          
          // Ordenar por data de solicitação (mais recente primeiro)
          const solicitacoesOrdenadas = todasSolicitacoes.sort((a: any, b: any) => {
            const dataA = new Date(a.data_solicitacao).getTime()
            const dataB = new Date(b.data_solicitacao).getTime()
            return dataB - dataA
          })
          
          // Pegar a solicitação mais recente
          const solicitacaoMaisRecente = solicitacoesOrdenadas[0]
          
          if (solicitacaoMaisRecente) {
            // Se a mais recente está aprovada, usuário pode usar
            if (solicitacaoMaisRecente.status === 'aprovado') {
              setCarteiraAprovada(true)
              setSolicitacaoPendente(false)
            } 
            // Se a mais recente está pendente, mostrar como pendente
            else if (solicitacaoMaisRecente.status === 'pendente') {
              setCarteiraAprovada(false)
              setSolicitacaoPendente(true)
            }
            // Se foi rejeitada, não mostrar como pendente nem aprovada
            else {
              setCarteiraAprovada(false)
              setSolicitacaoPendente(false)
            }
          } else {
            // Não há solicitações
            setCarteiraAprovada(false)
            setSolicitacaoPendente(false)
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar gateways:', error)
    } finally {
      setLoadingGateways(false)
    }
  }

  async function carregarChavesAPI() {
    try {
      setLoadingChaves(true)
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('/api/chaves-api', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setChavesAPI(data)
      }
    } catch (error) {
      console.error('Erro ao carregar chaves API:', error)
    } finally {
      setLoadingChaves(false)
    }
  }

  async function gerarNovaChave() {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        alert('Token não encontrado')
        return
      }

      const response = await fetch('/api/chaves-api', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nome_chave: nomeNovaChave || 'Chave Principal'
        })
      })

      if (response.ok) {
        const data = await response.json()
        setNovaChaveGerada(data.chave_api)
        setNomeNovaChave('')
        carregarChavesAPI()
        alert('Chave API gerada com sucesso! Salve esta chave, ela não será exibida novamente.')
      } else {
        const error = await response.json()
        alert(`Erro: ${error.error}`)
      }
    } catch (error) {
      console.error('Erro ao gerar chave:', error)
      alert('Erro ao gerar chave API')
    }
  }

  async function deletarChave(id: number) {
    if (!confirm('Tem certeza que deseja deletar esta chave API? Esta ação não pode ser desfeita.')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`/api/chaves-api/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        alert('Chave API deletada com sucesso!')
        carregarChavesAPI()
      } else {
        const error = await response.json()
        alert(`Erro: ${error.error}`)
      }
    } catch (error) {
      console.error('Erro ao deletar chave:', error)
      alert('Erro ao deletar chave API')
    }
  }

  async function toggleChaveAtiva(id: number, ativa: boolean) {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`/api/chaves-api/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ativa: !ativa })
      })

      if (response.ok) {
        carregarChavesAPI()
      } else {
        const error = await response.json()
        alert(`Erro: ${error.error}`)
      }
    } catch (error) {
      console.error('Erro ao atualizar chave:', error)
      alert('Erro ao atualizar chave API')
    }
  }

  async function salvarSolicitacaoCarteira() {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        alert('Token não encontrado')
        return
      }

      // Validação
      if (!configGateway.carteira.cpf || !configGateway.carteira.nome_completo || !configGateway.carteira.chave_pix) {
        alert('Por favor, preencha todos os campos obrigatórios (CPF, Nome Completo e Chave PIX)')
        return
      }

      const cpfLimpo = configGateway.carteira.cpf.replace(/\D/g, '')
      if (cpfLimpo.length !== 11) {
        alert('CPF inválido. Por favor, verifique o CPF informado.')
        return
      }

      const response = await fetch('/api/admin/carteira-pendente', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cpf: configGateway.carteira.cpf,
          nome_completo: configGateway.carteira.nome_completo,
          chave_pix: configGateway.carteira.chave_pix
        })
      })

      if (response.ok) {
        const responseData = await response.json()
        console.log('Resposta da API:', responseData)
        alert('Solicitação de carteira enviada com sucesso! Aguarde a aprovação do administrador. Você poderá ativar a carteira após a aprovação.')
        setMostrarModalSolicitacaoCarteira(false)
        setSolicitacaoPendente(true)
        setCarteiraAprovada(false) // Resetar aprovação anterior se houver
        setConfigGateway({
          ...configGateway,
          carteira: { cpf: '', nome_completo: '', chave_pix: '' }
        })
        carregarGateways()
      } else {
        const error = await response.json()
        console.error('Erro ao enviar solicitação:', error)
        alert(`Erro: ${error.error || 'Erro desconhecido ao salvar solicitação'}`)
      }
    } catch (error) {
      console.error('Erro ao enviar solicitação:', error)
      alert('Erro ao enviar solicitação de carteira')
    }
  }

  async function salvarConfiguracaoGateway() {
    if (!gatewayConfigurando) return

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        alert('Token não encontrado')
        return
      }

      let credenciais: any = {}
      let gatewayTipo = gatewayConfigurando

      // Mapear tipos antigos para novos
      if (gatewayTipo === 'pix') {
        gatewayTipo = 'carteira'
      } else if (gatewayTipo === 'pushpay') {
        gatewayTipo = 'pushinpay'
      }

      // Validação e preparação de credenciais
      if (gatewayTipo === 'carteira') {
        if (!configGateway.carteira.cpf || !configGateway.carteira.nome_completo || !configGateway.carteira.chave_pix) {
          alert('Por favor, preencha todos os campos obrigatórios (CPF, Nome Completo e Chave PIX)')
          return
        }
        const cpfLimpo = configGateway.carteira.cpf.replace(/\D/g, '')
        if (cpfLimpo.length !== 11) {
          alert('CPF inválido. Por favor, verifique o CPF informado.')
          return
        }
        credenciais = configGateway.carteira
      } else if (gatewayTipo === 'mercadopago') {
        if (!configGateway.mercadopago.access_token || !configGateway.mercadopago.public_key) {
          alert('Por favor, preencha todos os campos obrigatórios (Access Token e Public Key)')
          return
        }
        credenciais = configGateway.mercadopago
      } else if (gatewayTipo === 'pushinpay') {
        if (!configGateway.pushinpay.api_key || !configGateway.pushinpay.secret_key) {
          alert('Por favor, preencha todos os campos obrigatórios (API Key e Secret Key)')
          return
        }
        credenciais = configGateway.pushinpay
      }

      // Salvar configuração via API (para todos os gateways, incluindo carteira)
      const response = await fetch('/api/gateways-carteira', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          gateway_tipo: gatewayTipo,
          ativo: gatewaysAtivos[gatewayTipo] || false,
          credenciais
        })
      })

      if (response.ok) {
        if (gatewayTipo === 'carteira') {
          alert('Configuração da Carteira salva com sucesso!')
        } else {
          alert('Configurações salvas com sucesso!')
        }
        setGatewayConfigurando(null)
        carregarGateways()
      } else {
        const error = await response.json()
        alert(`Erro: ${error.error}`)
      }
    } catch (error) {
      console.error('Erro ao salvar configuração:', error)
      alert('Erro ao salvar configuração do gateway')
    }
  }

  async function toggleGatewayAtivo(gatewayTipo: string) {
    console.log('🔄 [toggleGatewayAtivo] Gateway:', gatewayTipo, 'Estado atual:', gatewaysAtivos[gatewayTipo], 'isSuperAdmin:', isSuperAdmin)
    
    // Se for carteira e não for super admin
    if (gatewayTipo === 'carteira' && !isSuperAdmin) {
      const estadoAtual = gatewaysAtivos[gatewayTipo]
      const novoStatus = !estadoAtual
      
      console.log('📊 [toggleGatewayAtivo] Carteira - Estado atual:', estadoAtual, 'Novo status:', novoStatus)
      
      // Se está tentando ativar
      if (novoStatus === true) {
        console.log('🔓 [toggleGatewayAtivo] Tentando ATIVAR carteira')
        // Verificar se já está aprovado
        if (carteiraAprovada) {
          // Já aprovado, pode ativar
          await ativarCarteira(true)
        } else if (solicitacaoPendente) {
          // Já tem solicitação pendente, abrir modal para mostrar status
          setMostrarModalSolicitacaoCarteira(true)
          // Não alterar o estado do toggle
          return
        } else {
          // Não tem solicitação, abrir modal para solicitar
          setMostrarModalSolicitacaoCarteira(true)
          // Não alterar o estado do toggle ainda
          return
        }
      } else {
        // Desativar - sempre permitido
        console.log('🔒 [toggleGatewayAtivo] Tentando DESATIVAR carteira - permitido')
        await ativarCarteira(false)
      }
      return
    }

    // Para super admin ou outros gateways, comportamento normal
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const novoStatus = !gatewaysAtivos[gatewayTipo]

      // Se está ativando um gateway, desativar todos os outros primeiro no frontend
      if (novoStatus) {
        // Desativar todos os outros gateways no estado local
        setGatewaysAtivos({
          carteira: gatewayTipo === 'carteira',
          pushinpay: gatewayTipo === 'pushinpay',
          mercadopago: gatewayTipo === 'mercadopago'
        })
      } else {
        // Se está desativando, apenas atualizar o gateway específico
        setGatewaysAtivos(prev => ({ ...prev, [gatewayTipo]: false }))
      }

      const response = await fetch('/api/gateways-carteira', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          gateway_tipo: gatewayTipo,
          ativo: novoStatus
        })
      })

      if (response.ok) {
        // Recarregar gateways para garantir sincronização
        carregarGateways()
      } else {
        // Se der erro, reverter o estado
        carregarGateways()
        const error = await response.json()
        alert(`Erro: ${error.error}`)
      }
    } catch (error) {
      console.error('Erro ao atualizar gateway:', error)
      // Reverter estado em caso de erro
      carregarGateways()
      alert('Erro ao atualizar status do gateway')
    }
  }

  async function ativarCarteira(ativar: boolean = true) {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      console.log('🔄 [ativarCarteira] Chamando API com ativar:', ativar, 'tipo: carteira')

      // Se está ativando a carteira, desativar todos os outros gateways primeiro
      if (ativar) {
        setGatewaysAtivos({
          carteira: true,
          pushinpay: false,
          mercadopago: false
        })
      } else {
        // Se está desativando, apenas atualizar a carteira
        setGatewaysAtivos(prev => ({ ...prev, carteira: false }))
      }

      const response = await fetch('/api/gateways-carteira', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          gateway_tipo: 'carteira',
          ativo: ativar
        })
      })
      
      console.log('📡 [ativarCarteira] Resposta da API:', response.status, response.ok)

      if (response.ok) {
        // Recarregar gateways para garantir sincronização
        carregarGateways()
      } else {
        // Se der erro, reverter o estado
        carregarGateways()
        const error = await response.json()
        alert(`Erro: ${error.error}`)
      }
    } catch (error) {
      console.error('Erro ao atualizar carteira:', error)
      // Reverter estado em caso de erro
      carregarGateways()
      alert('Erro ao atualizar status da carteira')
    }
  }

  async function handleSave() {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        alert('Token não encontrado. Faça login novamente.')
        return
      }

      const response = await fetch('/api/configuracoes', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(config)
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('Erro na resposta:', data)
        alert(`Erro ao salvar configurações: ${data.error || 'Erro desconhecido'}`)
        setLoading(false)
        return
      }

      // Salvar configurações do Discord se houver URL
      if (config.discord_webhook_url && config.discord_webhook_url.trim()) {
        try {
          const discordResponse = await fetch('/api/discord/webhook', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              webhook_url: config.discord_webhook_url,
              nome_webhook: config.discord_webhook_nome,
              notificar_vendas_publico: config.discord_notificar_vendas_publico,
              notificar_vendas_admin: config.discord_notificar_vendas_admin,
              notificar_estoque_baixo: config.discord_notificar_estoque_baixo,
              notificar_saque_afiliado: config.discord_notificar_saque_afiliado
            })
          })

          if (!discordResponse.ok) {
            const discordError = await discordResponse.json()
            console.error('Erro ao salvar webhook Discord:', discordError)
            alert(`Configurações salvas, mas houve erro ao salvar webhook Discord: ${discordError.error || 'Erro desconhecido'}`)
          }
        } catch (discordError) {
          console.error('Erro ao salvar webhook Discord:', discordError)
          alert('Configurações salvas, mas houve erro ao salvar webhook Discord.')
        }
      }

      alert('Configurações salvas com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert('Erro ao salvar configurações. Verifique o console para mais detalhes.')
    } finally {
      setLoading(false)
    }
  }

  function renderTabContent() {
    switch (activeTab) {
      case 'geral':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Configurações gerais</h2>
              <p className="text-gray-600">Altere o nome, opções de checkout, e detalhes da loja.</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Perfil da loja</h3>
              <p className="text-sm text-gray-600 mb-6">Informações básicas e dados empresariais da sua loja.</p>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome da loja
                  </label>
                  <input
                    type="text"
                    value={config.nome_loja}
                    onChange={(e) => setConfig({ ...config, nome_loja: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Digite o nome da loja"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição da loja
                  </label>
                  <textarea
                    value={config.descricao_loja}
                    onChange={(e) => setConfig({ ...config, descricao_loja: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Descreva sua loja"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CNPJ (opcional)
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={config.cnpj}
                      onChange={(e) => setConfig({ ...config, cnpj: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="00.000.000/0000-00"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between py-4 border-t border-gray-200">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Modo manutenção</h4>
                    <p className="text-sm text-gray-600 mt-1">Sua loja ficará inacessível para o público.</p>
                  </div>
                  <button
                    onClick={() => setConfig({ ...config, modo_manutencao: !config.modo_manutencao })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      config.modo_manutencao ? 'bg-gray-900' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        config.modo_manutencao ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between py-4 border-t border-gray-200">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Login do cliente</h4>
                    <p className="text-sm text-gray-600 mt-1">Exibir campo de login na sua loja.</p>
                  </div>
                  <button
                    onClick={() => setConfig({ ...config, login_cliente: !config.login_cliente })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      config.login_cliente ? 'bg-gray-900' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        config.login_cliente ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )

      case 'contatos':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Contatos</h2>
              <p className="text-gray-600">Configure as informações de contato da sua loja.</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
                <input
                  type="email"
                  value={config.email}
                  onChange={(e) => setConfig({ ...config, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="contato@loja.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
                <input
                  type="tel"
                  value={config.telefone}
                  onChange={(e) => setConfig({ ...config, telefone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Endereço</label>
                <textarea
                  value={config.endereco}
                  onChange={(e) => setConfig({ ...config, endereco: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Rua, número, bairro, cidade - CEP"
                />
              </div>
            </div>
          </div>
        )

      case 'pagamentos':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Gateways de pagamento</h2>
              <p className="text-gray-600">Gerencie como você receberá por suas vendas.</p>
            </div>

            {loadingGateways ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-4 text-gray-600">Carregando gateways...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Carteira - Destacado */}
                <div className={`bg-white rounded-xl border-2 p-6 ${gatewaysAtivos.carteira ? 'border-blue-500' : 'border-gray-200'}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                        <Wallet className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Carteira</h3>
                        <p className="text-sm text-gray-600">PIX</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleGatewayAtivo('carteira')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        gatewaysAtivos.carteira ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                      title={
                        solicitacaoPendente
                          ? 'Solicitação pendente de aprovação - Clique para ver status'
                          : carteiraAprovada
                          ? 'Carteira aprovada - clique para ativar/desativar'
                          : 'Clique para ativar e solicitar aprovação'
                      }
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          gatewaysAtivos.carteira ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  {!isSuperAdmin && (
                    <div className="mb-4 space-y-2">
                      {solicitacaoPendente && (
                        <div className="px-3 py-1.5 text-xs font-medium text-yellow-700 bg-yellow-50 rounded-lg border border-yellow-200">
                          <div className="flex items-center gap-2">
                            <div className="animate-pulse h-2 w-2 bg-yellow-600 rounded-full"></div>
                            <span>Solicitação em análise - Aguarde aprovação do administrador</span>
                          </div>
                        </div>
                      )}
                      {carteiraAprovada && !solicitacaoPendente && (
                        <div className="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 bg-green-600 rounded-full"></div>
                            <span>Aprovado - Você pode ativar a carteira</span>
                          </div>
                        </div>
                      )}
                      {!carteiraAprovada && !solicitacaoPendente && (
                        <div className="px-3 py-1.5 text-xs text-gray-600 bg-gray-50 rounded-lg border border-gray-200">
                          Clique no toggle para enviar seus dados e solicitar aprovação
                        </div>
                      )}
                    </div>
                  )}

                  {gatewaysAtivos.carteira && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-xs text-gray-700 leading-relaxed">
                        Usando a <strong>Carteira</strong> para receber pagamentos por PIX o valor cai diretamente na sua conta bancária após o saque.
                      </p>
                      <p className="text-xs text-gray-700 leading-relaxed mt-2">
                        Aproveite esta condição especial que a Carteira oferece para clientes da <strong>Dashboard Pro</strong>.
                      </p>
                      <button
                        onClick={() => setMostrarModalTarifas(true)}
                        className="text-xs text-blue-600 hover:text-blue-800 mt-2 inline-block underline"
                      >
                        Ver tarifas da Carteira.
                      </button>
                      <p className="text-xs text-gray-600 mt-2">
                        Você também pode utilizar outros provedores de PIX como o Pushin Pay.
                      </p>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Provedor</p>
                    <p className="text-sm font-medium text-gray-900">Carteira</p>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">Status</p>
                    <p className={`text-sm font-medium ${gatewaysAtivos.carteira ? 'text-green-600' : 'text-gray-500'}`}>
                      {gatewaysAtivos.carteira ? 'Ativo' : 'Inativo'}
                    </p>
                  </div>
                </div>

                {/* Pushin Pay */}
                <div className={`bg-white rounded-xl border-2 p-6 ${gatewaysAtivos.pushinpay ? 'border-purple-500' : 'border-gray-200'}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <CreditCard className="h-6 w-6 text-purple-600" />
                      </div>
                      <button
                        onClick={() => toggleGatewayAtivo('pushinpay')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          gatewaysAtivos.pushinpay ? 'bg-green-500' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            gatewaysAtivos.pushinpay ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    <button 
                      onClick={() => setGatewayConfigurando('pushinpay')}
                      className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Configurar
                    </button>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Provedor</p>
                    <p className="text-sm font-medium text-gray-900">Pushin Pay</p>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">Status</p>
                    <p className={`text-sm font-medium ${gatewaysAtivos.pushinpay ? 'text-green-600' : 'text-gray-500'}`}>
                      {gatewaysAtivos.pushinpay ? 'Ativo' : 'Inativo'}
                    </p>
                  </div>
                </div>

                {/* Mercado Pago */}
                <div className={`bg-white rounded-xl border-2 p-6 ${gatewaysAtivos.mercadopago ? 'border-blue-500' : 'border-gray-200'}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      <button
                        onClick={() => toggleGatewayAtivo('mercadopago')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          gatewaysAtivos.mercadopago ? 'bg-green-500' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            gatewaysAtivos.mercadopago ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    <button 
                      onClick={() => setGatewayConfigurando('mercadopago')}
                      className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Configurar
                    </button>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Provedor</p>
                    <p className="text-sm font-medium text-gray-900">Mercado Pago</p>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">Status</p>
                    <p className={`text-sm font-medium ${gatewaysAtivos.mercadopago ? 'text-green-600' : 'text-gray-500'}`}>
                      {gatewaysAtivos.mercadopago ? 'Ativo' : 'Inativo'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )

      case 'tema':

      case 'tema':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Tema</h2>
              <p className="text-gray-600">Personalize as cores e o visual da sua loja.</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cor Principal</label>
                <div className="flex items-center space-x-4">
                  <input
                    type="color"
                    value={config.cor_principal}
                    onChange={(e) => setConfig({ ...config, cor_principal: e.target.value })}
                    className="h-12 w-12 rounded-lg border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={config.cor_principal}
                    onChange={(e) => setConfig({ ...config, cor_principal: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="#3b82f6"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cor Secundária</label>
                <div className="flex items-center space-x-4">
                  <input
                    type="color"
                    value={config.cor_secundaria}
                    onChange={(e) => setConfig({ ...config, cor_secundaria: e.target.value })}
                    className="h-12 w-12 rounded-lg border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={config.cor_secundaria}
                    onChange={(e) => setConfig({ ...config, cor_secundaria: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="#8b5cf6"
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 'notificacoes':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Notificações</h2>
              <p className="text-gray-600">Configure quando e como receber notificações.</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">E-mail para novas vendas</h4>
                  <p className="text-sm text-gray-600 mt-1">Receba um e-mail quando uma nova venda for realizada.</p>
                </div>
                <button
                  onClick={() => setConfig({ ...config, email_vendas: !config.email_vendas })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    config.email_vendas ? 'bg-gray-900' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      config.email_vendas ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">E-mail para estoque baixo</h4>
                  <p className="text-sm text-gray-600 mt-1">Receba um e-mail quando o estoque estiver baixo.</p>
                </div>
                <button
                  onClick={() => setConfig({ ...config, email_estoque: !config.email_estoque })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    config.email_estoque ? 'bg-gray-900' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      config.email_estoque ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Seção Discord Webhooks */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
              <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
                <MessageCircle className="h-6 w-6 text-indigo-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Discord</h3>
                  <p className="text-sm text-gray-600">Configure notificações via webhook do Discord</p>
                </div>
              </div>

              {/* Toggles de Notificações */}
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Notificação de vendas (pública)</h4>
                    <p className="text-sm text-gray-600 mt-1">Receba notificações de vendas no canal público do Discord.</p>
                  </div>
                  <button
                    onClick={() => {
                      if (!config.discord_webhook_url && !config.discord_notificar_vendas_publico) {
                        setWebhookUrlTemp('')
                        setNotificacaoAtivando('vendas_publico')
                        setMostrarModalDiscord(true)
                      } else {
                        setConfig({ ...config, discord_notificar_vendas_publico: !config.discord_notificar_vendas_publico })
                      }
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      config.discord_notificar_vendas_publico ? 'bg-indigo-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        config.discord_notificar_vendas_publico ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Notificação de vendas (administrador)</h4>
                    <p className="text-sm text-gray-600 mt-1">Receba notificações detalhadas de vendas em um canal privado.</p>
                  </div>
                  <button
                    onClick={() => {
                      if (!config.discord_webhook_url && !config.discord_notificar_vendas_admin) {
                        setWebhookUrlTemp('')
                        setNotificacaoAtivando('vendas_admin')
                        setMostrarModalDiscord(true)
                      } else {
                        setConfig({ ...config, discord_notificar_vendas_admin: !config.discord_notificar_vendas_admin })
                      }
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      config.discord_notificar_vendas_admin ? 'bg-indigo-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        config.discord_notificar_vendas_admin ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Notificação de estoque esgotado</h4>
                    <p className="text-sm text-gray-600 mt-1">Seja notificado quando um produto ficar sem estoque.</p>
                  </div>
                  <button
                    onClick={() => {
                      if (!config.discord_webhook_url && !config.discord_notificar_estoque_baixo) {
                        setWebhookUrlTemp('')
                        setNotificacaoAtivando('estoque_baixo')
                        setMostrarModalDiscord(true)
                      } else {
                        setConfig({ ...config, discord_notificar_estoque_baixo: !config.discord_notificar_estoque_baixo })
                      }
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      config.discord_notificar_estoque_baixo ? 'bg-indigo-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        config.discord_notificar_estoque_baixo ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Notificação de saque (afiliado)</h4>
                    <p className="text-sm text-gray-600 mt-1">Seja notificado quando um afiliado solicitar saque.</p>
                  </div>
                  <button
                    onClick={() => {
                      if (!config.discord_webhook_url && !config.discord_notificar_saque_afiliado) {
                        setWebhookUrlTemp('')
                        setNotificacaoAtivando('saque_afiliado')
                        setMostrarModalDiscord(true)
                      } else {
                        setConfig({ ...config, discord_notificar_saque_afiliado: !config.discord_notificar_saque_afiliado })
                      }
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      config.discord_notificar_saque_afiliado ? 'bg-indigo-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        config.discord_notificar_saque_afiliado ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Botão de Teste */}
              {config.discord_webhook_url && (
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={async () => {
                      if (!config.discord_webhook_url) {
                        alert('Por favor, configure a URL do webhook primeiro')
                        return
                      }
                      try {
                        const response = await fetch('/api/discord/test-webhook', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                          },
                          body: JSON.stringify({
                            webhook_url: config.discord_webhook_url
                          })
                        })
                        const data = await response.json()
                        if (response.ok) {
                          alert('✅ Webhook testado com sucesso! Verifique o Discord.')
                        } else {
                          alert(`❌ Erro ao testar webhook: ${data.error || 'Erro desconhecido'}`)
                        }
                      } catch (error) {
                        alert('❌ Erro ao testar webhook')
                        console.error(error)
                      }
                    }}
                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                  >
                    Testar Webhook
                  </button>
                </div>
              )}
            </div>

            {/* Modal de Configuração do Webhook Discord */}
            {mostrarModalDiscord && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">Configurar Webhook do Discord</h3>
                    <button
                      onClick={() => {
                        setMostrarModalDiscord(false)
                        setWebhookUrlTemp('')
                        setNotificacaoAtivando(null)
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <p className="text-sm text-gray-600 mb-2">
                    Insira a URL do webhook do Discord para receber as notificações.
                  </p>
                  <a
                    href="https://support.discord.com/hc/pt-br/articles/228383668-Usando-Webhooks"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 underline mb-4 inline-block"
                  >
                    Veja como obter
                  </a>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL do Webhook
                    </label>
                    <input
                      type="text"
                      value={webhookUrlTemp || config.discord_webhook_url || ''}
                      onChange={(e) => setWebhookUrlTemp(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="https://discord.com/api/webhooks/..."
                    />
                  </div>

                  <div className="flex items-center justify-end space-x-3">
                    <button
                      onClick={() => {
                        setMostrarModalDiscord(false)
                        setWebhookUrlTemp('')
                        setNotificacaoAtivando(null)
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={async () => {
                        const urlFinal = webhookUrlTemp || config.discord_webhook_url
                        if (!urlFinal || !urlFinal.trim()) {
                          alert('Por favor, insira a URL do webhook')
                          return
                        }

                        // Validar URL
                        if (!urlFinal.startsWith('https://discord.com/api/webhooks/') && 
                            !urlFinal.startsWith('https://discordapp.com/api/webhooks/')) {
                          alert('URL do webhook inválida. Deve ser uma URL do Discord.')
                          return
                        }

                        // Ativar a notificação correspondente se estava sendo ativada
                        const novoConfig: any = { ...config, discord_webhook_url: urlFinal }
                        if (notificacaoAtivando === 'vendas_publico') {
                          novoConfig.discord_notificar_vendas_publico = true
                        } else if (notificacaoAtivando === 'vendas_admin') {
                          novoConfig.discord_notificar_vendas_admin = true
                        } else if (notificacaoAtivando === 'estoque_baixo') {
                          novoConfig.discord_notificar_estoque_baixo = true
                        } else if (notificacaoAtivando === 'saque_afiliado') {
                          novoConfig.discord_notificar_saque_afiliado = true
                        }
                        
                        setConfig(novoConfig)
                        setMostrarModalDiscord(false)
                        setWebhookUrlTemp('')
                        setNotificacaoAtivando(null)
                        
                        // Salvar automaticamente
                        try {
                          const token = localStorage.getItem('token')
                          if (token) {
                            await fetch('/api/discord/webhook', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                              },
                              body: JSON.stringify({
                                webhook_url: urlFinal,
                                nome_webhook: novoConfig.discord_webhook_nome,
                                notificar_vendas_publico: novoConfig.discord_notificar_vendas_publico,
                                notificar_vendas_admin: novoConfig.discord_notificar_vendas_admin,
                                notificar_estoque_baixo: novoConfig.discord_notificar_estoque_baixo,
                                notificar_saque_afiliado: novoConfig.discord_notificar_saque_afiliado
                              })
                            })
                          }
                        } catch (error) {
                          console.error('Erro ao salvar webhook:', error)
                        }
                      }}
                      className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      Salvar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )

      case 'integracoes':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Gerenciar integrações</h2>
              <p className="text-gray-600">Conecte sua loja com diversas aplicações.</p>
            </div>

            {/* Cards de Integrações */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center">
                      <MessageSquare className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Conectar ao Discord</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Use o Discord para entregar cargos e notificar os compradores sobre os seus pedidos.
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-900 transition-colors" />
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-green-500 rounded-full flex items-center justify-center">
                      <Code className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Integração via API</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Faça sua própria integração utilizando nossa API desacoplada.
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-900 transition-colors" />
                </div>
              </div>
            </div>

            {/* Seção de Documentação e Chave Privada */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Documentação */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <ArrowLeft className="h-5 w-5 text-green-700" />
                  <h3 className="text-lg font-semibold text-green-900">Confira nossa documentação</h3>
                </div>
                <p className="text-green-800 mb-6">
                  A API é simples de integrar. Nossa API desacoplada e documentação detalhada deixa tudo ainda mais fácil.
                </p>
                <Link
                  href="/api/docs"
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg"
                >
                  <Code className="h-5 w-5" />
                  <span className="font-medium">API Reference</span>
                </Link>
              </div>

              {/* Gerenciamento de Chaves API */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Gerenciar Chaves API</h3>
                    <p className="text-sm text-red-600 flex items-center space-x-1">
                      <Lock className="h-4 w-4" />
                      <span>Mantenha suas chaves seguras e nunca as compartilhe.</span>
                    </p>
                  </div>
                  <button
                    onClick={gerarNovaChave}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Nova Chave</span>
                  </button>
                </div>

                {/* Modal para nova chave gerada */}
                {novaChaveGerada && (
                  <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-semibold text-yellow-900">⚠️ Chave gerada com sucesso!</p>
                      <button
                        onClick={() => setNovaChaveGerada(null)}
                        className="text-yellow-700 hover:text-yellow-900"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-xs text-yellow-800 mb-3">
                      <strong>IMPORTANTE:</strong> Salve esta chave agora. Ela não será exibida novamente.
                    </p>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={novaChaveGerada}
                        readOnly
                        className="flex-1 px-3 py-2 bg-white border border-yellow-300 rounded font-mono text-sm"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(novaChaveGerada)
                          alert('Chave copiada!')
                        }}
                        className="px-3 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Formulário para criar nova chave */}
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome da chave (opcional)</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={nomeNovaChave}
                      onChange={(e) => setNomeNovaChave(e.target.value)}
                      placeholder="Ex: Chave Principal, Chave para Site..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                    />
                    <button
                      onClick={gerarNovaChave}
                      className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800"
                    >
                      Gerar
                    </button>
                  </div>
                </div>

                {/* Lista de chaves */}
                {loadingChaves ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="text-sm text-gray-600 mt-2">Carregando chaves...</p>
                  </div>
                ) : chavesAPI.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Lock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhuma chave API criada ainda.</p>
                    <p className="text-xs mt-1">Clique em "Nova Chave" para criar sua primeira chave.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {chavesAPI.map((chave) => (
                      <div
                        key={chave.id_chave_api}
                        className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-medium text-gray-900">{chave.nome_chave}</h4>
                              <span
                                className={`px-2 py-0.5 rounded text-xs font-medium ${
                                  chave.ativa
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {chave.ativa ? 'Ativa' : 'Inativa'}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <code className="text-xs font-mono text-gray-600 bg-gray-50 px-2 py-1 rounded">
                                {chave.chave_api}
                              </code>
                              <button
                                onClick={() => {
                                  // Buscar chave completa para copiar
                                  const token = localStorage.getItem('token')
                                  if (token) {
                                    fetch(`/api/chaves-api/${chave.id_chave_api}`, {
                                      headers: { 'Authorization': `Bearer ${token}` }
                                    })
                                      .then(res => res.json())
                                      .then(data => {
                                        if (data.chave_api) {
                                          navigator.clipboard.writeText(data.chave_api)
                                          alert('Chave copiada!')
                                        } else {
                                          alert('Chave não encontrada ou você não tem permissão.')
                                        }
                                      })
                                  }
                                }}
                                className="p-1 text-gray-600 hover:text-gray-900"
                                title="Copiar chave completa"
                              >
                                <Copy className="h-4 w-4" />
                              </button>
                            </div>
                            {chave.ultimo_uso && (
                              <p className="text-xs text-gray-500 mt-1">
                                Último uso: {new Date(chave.ultimo_uso).toLocaleString('pt-BR')}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              Criada em: {new Date(chave.data_criacao).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => toggleChaveAtiva(chave.id_chave_api, chave.ativa)}
                              className={`px-3 py-1.5 text-xs rounded ${
                                chave.ativa
                                  ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                  : 'bg-green-100 text-green-800 hover:bg-green-200'
                              }`}
                            >
                              {chave.ativa ? 'Desativar' : 'Ativar'}
                            </button>
                            <button
                              onClick={() => deletarChave(chave.id_chave_api)}
                              className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                              title="Deletar chave"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Como Começar */}
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <div className="mb-6">
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">Como começar?</h3>
                <p className="text-gray-600">Não se preocupe. O processo é simples e em caso de dúvidas te ajudamos.</p>
              </div>

              <div className="space-y-6">
                {/* Passo 1 */}
                <div className="flex items-start space-x-4 p-6 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 h-10 w-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                    1
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">Guarde sua chave privada</h4>
                    <p className="text-sm text-gray-600">
                      Ela é uma parte essencial para integrar com o nosso sistema, a mantenha segura e não compartilhe-a com terceiros.
                    </p>
                  </div>
                </div>

                {/* Passo 2 */}
                <div className="flex items-start space-x-4 p-6 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 h-10 w-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                    2
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">Sua primeira requisição</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Inicie chamando a rota para obter detalhes básicos da sua aplicação.
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">GET</span>
                      <code className="px-3 py-1 bg-gray-100 text-gray-800 rounded text-sm font-mono">
                        /api/produtos
                      </code>
                    </div>
                  </div>
                </div>

                {/* Passo 3 */}
                <div className="flex items-start space-x-4 p-6 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 h-10 w-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                    3
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">Use sua criatividade!</h4>
                    <p className="text-sm text-gray-600">
                      Disponibilizamos vários endpoints para permitir a máxima flexibilidade para os seus sistemas!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Link de Suporte */}
            <div className="text-center">
              <a
                href="mailto:suporte@exemplo.com"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Ainda tem dúvidas? Entre em contato com a nossa equipe.
              </a>
            </div>
          </div>
        )

      default:
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">{tabs.find(t => t.id === activeTab)?.label}</h2>
              <p className="text-gray-600">Configurações em desenvolvimento.</p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Configurações</h1>
        <p className="text-gray-600">Gerencie as configurações da sua loja</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto custom-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center space-x-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap
                    ${isActive 
                      ? 'border-gray-900 text-gray-900 font-medium' 
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {renderTabContent()}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200 bg-gray-50">
          <button className="flex items-center space-x-2 px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
            <X className="h-5 w-5" />
            <span>Cancelar</span>
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center space-x-2 px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-5 w-5" />
            <span>{loading ? 'Salvando...' : 'Salvar'}</span>
          </button>
        </div>
      </div>

      {/* Modal de Configuração de Gateway - Apenas para super admin */}
      {gatewayConfigurando && isSuperAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Configurar {gatewayConfigurando === 'carteira' || gatewayConfigurando === 'pix' ? 'Carteira' : gatewayConfigurando === 'mercadopago' ? 'Mercado Pago' : gatewayConfigurando === 'pushinpay' || gatewayConfigurando === 'pushpay' ? 'Pushin Pay' : 'Gateway'}
              </h3>
              <button
                onClick={() => setGatewayConfigurando(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {(gatewayConfigurando === 'carteira' || gatewayConfigurando === 'pix') && (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-700">
                    Para usar a Carteira, você precisa fornecer seus dados pessoais e a chave PIX vinculada ao seu CPF.
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CPF <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={configGateway.carteira.cpf || ''}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, '')
                      if (value.length <= 11) {
                        value = value.replace(/(\d{3})(\d)/, '$1.$2')
                        value = value.replace(/(\d{3})(\d)/, '$1.$2')
                        value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2')
                        setConfigGateway({
                          ...configGateway,
                          carteira: { ...configGateway.carteira, cpf: value }
                        })
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="000.000.000-00"
                    maxLength={14}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    CPF deve estar vinculado à chave PIX
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={configGateway.carteira.nome_completo || ''}
                    onChange={(e) => setConfigGateway({
                      ...configGateway,
                      carteira: { ...configGateway.carteira, nome_completo: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Digite seu nome completo"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Nome completo conforme cadastro bancário
                  </p>
                </div>    

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chave PIX <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={configGateway.carteira.chave_pix || ''}
                    onChange={(e) => setConfigGateway({
                      ...configGateway,
                      carteira: { ...configGateway.carteira, chave_pix: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Digite sua chave PIX"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Chave PIX vinculada ao CPF informado (CPF, e-mail ou chave aleatória)
                  </p>
                </div>

                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-xs text-yellow-800">
                    <strong>Importante:</strong> A chave PIX deve estar vinculada ao CPF informado. Verifique se os dados estão corretos antes de salvar.
                  </p>
                </div>
              </div>
            )}

            {gatewayConfigurando === 'mercadopago' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Access Token
                  </label>
                  <input
                    type="password"
                    value={configGateway.mercadopago.access_token || ''}
                    onChange={(e) => setConfigGateway({
                      ...configGateway,
                      mercadopago: { ...configGateway.mercadopago, access_token: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="APP_USR-..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Token de acesso do Mercado Pago
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Public Key
                  </label>
                  <input
                    type="text"
                    value={configGateway.mercadopago.public_key || ''}
                    onChange={(e) => setConfigGateway({
                      ...configGateway,
                      mercadopago: { ...configGateway.mercadopago, public_key: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="APP_USR-..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Chave pública do Mercado Pago
                  </p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-xs text-yellow-800">
                    Você pode encontrar essas credenciais no painel do Mercado Pago em: <strong>Desenvolvimento &gt; Suas integrações</strong>
                  </p>
                </div>
              </div>
            )}

            {(gatewayConfigurando === 'pushinpay' || gatewayConfigurando === 'pushpay') && (
              <div className="space-y-4">
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-sm text-gray-700">
                    Configure suas credenciais do Pushin Pay para processar pagamentos.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Key <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={configGateway.pushinpay.api_key || ''}
                    onChange={(e) => setConfigGateway({
                      ...configGateway,
                      pushinpay: { ...configGateway.pushinpay, api_key: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Digite sua API Key do Pushin Pay"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Você pode encontrar sua API Key no painel do Pushin Pay
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secret Key <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={configGateway.pushinpay.secret_key || ''}
                    onChange={(e) => setConfigGateway({
                      ...configGateway,
                      pushinpay: { ...configGateway.pushinpay, secret_key: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Digite sua Secret Key do Pushin Pay"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Mantenha sua Secret Key segura e nunca a compartilhe
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setGatewayConfigurando(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  // Salvar configuração do gateway
                  salvarConfiguracaoGateway()
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Solicitação de Carteira */}
      {mostrarModalSolicitacaoCarteira && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Solicitar Aprovação da Carteira
              </h3>
              <button
                onClick={() => {
                  setMostrarModalSolicitacaoCarteira(false)
                  setConfigGateway({
                    ...configGateway,
                    carteira: { cpf: '', nome_completo: '', chave_pix: '' }
                  })
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-gray-900 mb-2">
                  📋 Envio de Dados para Aprovação
                </p>
                <p className="text-sm text-gray-700 mb-2">
                  Para usar a Carteira, você precisa fornecer seus dados pessoais e a chave PIX vinculada ao seu CPF.
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Importante:</strong> Sua solicitação será enviada para análise do administrador. Você receberá uma notificação quando sua solicitação for aprovada ou rejeitada.
                </p>
              </div>

              {solicitacaoPendente && (
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-start gap-2">
                    <div className="animate-pulse h-5 w-5 bg-yellow-600 rounded-full flex-shrink-0 mt-0.5"></div>
                    <div>
                      <p className="text-sm font-medium text-yellow-900 mb-1">
                        ⏳ Solicitação em Análise
                      </p>
                      <p className="text-xs text-yellow-800">
                        Você já possui uma solicitação pendente. Aguarde a aprovação do administrador para poder ativar a carteira. Você não poderá ativar a carteira até que sua solicitação seja aprovada.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CPF <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={configGateway.carteira.cpf || ''}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, '')
                    if (value.length <= 11) {
                      value = value.replace(/(\d{3})(\d)/, '$1.$2')
                      value = value.replace(/(\d{3})(\d)/, '$1.$2')
                      value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2')
                      setConfigGateway({
                        ...configGateway,
                        carteira: { ...configGateway.carteira, cpf: value }
                      })
                    }
                  }}
                  disabled={solicitacaoPendente}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    solicitacaoPendente ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''
                  }`}
                  placeholder="000.000.000-00"
                  maxLength={14}
                />
                <p className="text-xs text-gray-500 mt-1">CPF deve estar vinculado à chave PIX</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={configGateway.carteira.nome_completo || ''}
                  onChange={(e) => setConfigGateway({
                    ...configGateway,
                    carteira: { ...configGateway.carteira, nome_completo: e.target.value }
                  })}
                  disabled={solicitacaoPendente}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    solicitacaoPendente ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''
                  }`}
                  placeholder="Digite o nome completo"
                />
                <p className="text-xs text-gray-500 mt-1">Nome completo conforme cadastro bancário</p>
              </div>    

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chave PIX <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={configGateway.carteira.chave_pix || ''}
                  onChange={(e) => setConfigGateway({
                    ...configGateway,
                    carteira: { ...configGateway.carteira, chave_pix: e.target.value }
                  })}
                  disabled={solicitacaoPendente}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    solicitacaoPendente ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''
                  }`}
                  placeholder="Digite a chave PIX"
                />
                <p className="text-xs text-gray-500 mt-1">Chave PIX vinculada ao CPF informado (CPF, e-mail ou chave aleatória)</p>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-xs font-medium text-yellow-900 mb-1">
                  ⚠️ Atenção
                </p>
                <p className="text-xs text-yellow-800">
                  A chave PIX deve estar vinculada ao CPF informado. Verifique se os dados estão corretos antes de enviar a solicitação. Após o envio, você precisará aguardar a aprovação do administrador para poder ativar a carteira.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setMostrarModalSolicitacaoCarteira(false)
                  setConfigGateway({
                    ...configGateway,
                    carteira: { cpf: '', nome_completo: '', chave_pix: '' }
                  })
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {solicitacaoPendente ? 'Fechar' : 'Cancelar'}
              </button>
              {!solicitacaoPendente && (
                <button
                  onClick={salvarSolicitacaoCarteira}
                  className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Enviar Solicitação
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Tarifas da Carteira */}
      {mostrarModalTarifas && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Tarifas da Carteira</h3>
                  <p className="text-sm text-gray-600">Condições especiais para clientes Dashboard Pro</p>
                </div>
              </div>
              <button
                onClick={() => setMostrarModalTarifas(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Informações sobre a Carteira */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-200 p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Como funciona a Carteira</h4>
                <p className="text-sm text-gray-700 leading-relaxed mb-4">
                  A <strong>Carteira</strong> é um método de pagamento exclusivo que permite receber pagamentos por PIX diretamente na sua conta bancária após o saque.
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Com a Carteira, você tem acesso a condições especiais de taxas para clientes da <strong>Dashboard Pro</strong>.
                </p>
              </div>

              {/* Tarifas */}
              <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Tarifas Aplicadas</h4>
                
                <div className="space-y-4">
                  {/* Taxa Fixa */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Taxa Fixa</p>
                        <p className="text-xs text-gray-500">Cobrada por transação</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">R$ 0,50</p>
                    </div>
                  </div>

                  {/* Taxa Percentual */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Taxa Percentual</p>
                        <p className="text-xs text-gray-500">Sobre o valor da venda</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">3,00%</p>
                    </div>
                  </div>
                </div>

                {/* Exemplo de Cálculo */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h5 className="text-sm font-semibold text-gray-900 mb-3">Exemplo de Cálculo</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Valor da venda:</span>
                      <span className="font-medium text-gray-900">R$ 100,00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Taxa fixa:</span>
                      <span className="font-medium text-gray-900">R$ 0,50</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Taxa percentual (3%):</span>
                      <span className="font-medium text-gray-900">R$ 3,00</span>
                    </div>
                    <div className="border-t border-blue-300 pt-2 mt-2 flex justify-between">
                      <span className="font-semibold text-gray-900">Total da comissão:</span>
                      <span className="font-bold text-blue-700">R$ 3,50</span>
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-gray-600">Valor líquido recebido:</span>
                      <span className="font-semibold text-green-700">R$ 96,50</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informações Importantes */}
              <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-4">
                <div className="flex items-start space-x-2">
                  <div className="h-5 w-5 text-yellow-600 mt-0.5">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-800 mb-1">Informações Importantes</p>
                    <ul className="text-xs text-yellow-700 space-y-1 list-disc list-inside">
                      <li>As tarifas são aplicadas apenas em vendas pagas com a Carteira</li>
                      <li>A comissão é calculada automaticamente a cada venda aprovada</li>
                      <li>O valor líquido é creditado na sua carteira após a aprovação do pagamento</li>
                      <li>Você pode solicitar saques a qualquer momento</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-6 mt-6 border-t border-gray-200">
              <button
                onClick={() => setMostrarModalTarifas(false)}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

