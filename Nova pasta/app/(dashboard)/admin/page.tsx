'use client'

import { useState, useEffect } from 'react'
import { Building2, DollarSign, ShoppingCart, CheckCircle, XCircle, Clock, Eye, Search, Filter, X, Users, Plus, RefreshCw, User, Mail, Phone, Shield, Edit, Lock, Wallet, CreditCard, Settings, Megaphone, AlertCircle, Info, Tag, Trash2 } from 'lucide-react'

interface Loja {
  id_lojas: number
  nome_loja: string
  status: string
  data_criacao: string
  usuario: {
    id_usuarios: number
    nome: string
    email: string
    telefone: string
    cpf?: string
  }
  total_vendas: number
  receita_total: number
  vendas_aprovadas: number
}

interface CarteiraPendente {
  id_carteira_pendente: number
  usuarios_id_usuarios: number
  cpf: string
  nome_completo: string
  chave_pix: string
  status: string
  observacoes?: string
  data_solicitacao: string
  data_aprovacao?: string
  usuario: {
    id_usuarios: number
    nome: string
    email: string
    telefone: string
  }
  aprovador?: {
    id_usuarios: number
    nome: string
    email: string
  }
}

interface Saque {
  id_saques: number
  valor: number
  status: string
  chave_pix: string
  data_solicitacao: string
  data_processamento?: string
  observacoes?: string
  usuarios_id_usuarios: number
  usuarios: {
    id_usuarios: number
    nome: string
    email: string
    telefone: string
  }
}

interface Comissao {
  id_comissoes: number
  vendas_id_vendas: number
  lojas_id_lojas: number
  usuarios_id_usuarios: number
  valor_venda: number
  taxa_fixa: number
  taxa_percentual: number
  valor_comissao: number
  metodo_pagamento: string
  data_venda: string
  data_criacao: string
  loja: {
    id_lojas: number
    nome_loja: string
  }
  usuario: {
    id_usuarios: number
    nome: string
    email: string
  }
  venda: {
    id_vendas: number
    total: number
    data_venda: string
  }
}

interface ComissaoPorLoja {
  loja: {
    id_lojas: number
    nome_loja: string
  }
  total: number
  count: number
}

export default function AdminDashboard() {
  const [lojas, setLojas] = useState<Loja[]>([])
  const [carteirasPendentes, setCarteirasPendentes] = useState<CarteiraPendente[]>([])
  const [saques, setSaques] = useState<Saque[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'lojas' | 'saques' | 'gateways' | 'comissoes' | 'anuncios'>('lojas')
  const [filtroStatus, setFiltroStatus] = useState<'pendente' | 'aprovado' | 'rejeitado' | 'todos'>('todos')
  const [filtroStatusSaque, setFiltroStatusSaque] = useState<'pendente' | 'concluido' | 'rejeitado' | 'todos'>('pendente')
  const [busca, setBusca] = useState('')
  const [buscaSaques, setBuscaSaques] = useState('')
  const [carteiraSelecionada, setCarteiraSelecionada] = useState<CarteiraPendente | null>(null)
  const [saqueSelecionado, setSaqueSelecionado] = useState<Saque | null>(null)
  const [observacoes, setObservacoes] = useState('')
  const [observacoesSaque, setObservacoesSaque] = useState('')
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [lojaSelecionada, setLojaSelecionada] = useState<Loja | null>(null)
  const [comissoes, setComissoes] = useState<Comissao[]>([])
  const [comissoesPorLoja, setComissoesPorLoja] = useState<ComissaoPorLoja[]>([])
  const [totalComissoes, setTotalComissoes] = useState(0)
  const [comissaoLojaSelecionada, setComissaoLojaSelecionada] = useState<{ total: number, count: number } | null>(null)
  const [anuncios, setAnuncios] = useState<any[]>([])
  const [mostrarModalAnuncio, setMostrarModalAnuncio] = useState(false)
  const [formAnuncio, setFormAnuncio] = useState({
    titulo: '',
    mensagem: '',
    tipo: 'info',
    enviado_para_todas: true,
    lojas_selecionadas: [] as number[],
    data_expiracao: ''
  })
  const [gatewayConfigurando, setGatewayConfigurando] = useState<string | null>(null)
  const [configGateway, setConfigGateway] = useState<{ [key: string]: any }>({
    carteira: { cpf: '', nome_completo: '', chave_pix: '' },
    mercadopago: { access_token: '', public_key: '' },
    pushinpay: { api_key: '', secret_key: '' }
  })
  const [gatewaysAtivos, setGatewaysAtivos] = useState<{ [key: string]: boolean }>({
    carteira: false,
    pushinpay: false,
    mercadopago: false
  })
  const [loadingGateways, setLoadingGateways] = useState(false)
  const [gatewayPadraoGlobal, setGatewayPadraoGlobal] = useState<string>('carteira')
  const [configurandoGatewayPadrao, setConfigurandoGatewayPadrao] = useState(false)

  useEffect(() => {
    // Verificar se é super admin
    const checkSuperAdmin = async () => {
      const token = localStorage.getItem('token')
      const isSuperAdminLocal = localStorage.getItem('isSuperAdmin')
      
      // Verificação inicial rápida
      if (!token || isSuperAdminLocal !== 'true') {
        alert('Acesso negado. Apenas super administradores podem acessar esta página.')
        window.location.href = '/'
        return
      }

      // Verificar se realmente é super admin no banco
      try {
        const adminCheckResponse = await fetch('/api/admin/verificar-admin', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (adminCheckResponse.ok) {
          const adminData = await adminCheckResponse.json()
          console.log('📊 [ADMIN PAGE] Dados recebidos da API:', adminData)
          
          // Verificar se é super admin (aceitar diferentes formatos)
          const isSuperAdmin = adminData.is_super_admin === true || 
                              adminData.is_super_admin === 'true' || 
                              adminData.is_super_admin === 1 ||
                              adminData.is_super_admin === '1'
          
          console.log('🔍 [ADMIN PAGE] is_super_admin:', adminData.is_super_admin, 'Tipo:', typeof adminData.is_super_admin, 'Resultado:', isSuperAdmin)
          
          if (!isSuperAdmin) {
            console.error('❌ [ADMIN PAGE] Usuário não é super admin')
            alert('Acesso negado. Você não tem permissão para acessar esta página.')
            localStorage.removeItem('isSuperAdmin')
            window.location.href = '/'
            return
          }
          
          // Se chegou aqui, é super admin
          console.log('✅ [ADMIN PAGE] Acesso permitido - é super admin')
          setIsSuperAdmin(true)
          carregarDados()
        } else {
          // Se não conseguir verificar, tentar verificar token primeiro
          const response = await fetch('/api/auth/verificar', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          
          if (!response.ok) {
            alert('Sessão expirada. Faça login novamente.')
            localStorage.removeItem('token')
            localStorage.removeItem('isSuperAdmin')
            window.location.href = '/auth/login'
            return
          }

          // Tentar verificar admin novamente
          const adminCheckRetry = await fetch('/api/admin/verificar-admin', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })

          if (adminCheckRetry.ok) {
            const adminData = await adminCheckRetry.json()
            console.log('📊 [ADMIN PAGE] Dados recebidos na retry:', adminData)
            
            // Verificar se é super admin (aceitar diferentes formatos)
            const isSuperAdmin = adminData.is_super_admin === true || 
                                adminData.is_super_admin === 'true' || 
                                adminData.is_super_admin === 1 ||
                                adminData.is_super_admin === '1'
            
            if (isSuperAdmin) {
              console.log('✅ [ADMIN PAGE] Acesso permitido na retry - é super admin')
              setIsSuperAdmin(true)
              carregarDados()
            } else {
              console.error('❌ [ADMIN PAGE] Usuário não é super admin na retry')
              alert('Acesso negado. Você não tem permissão para acessar esta página.')
              localStorage.removeItem('isSuperAdmin')
              window.location.href = '/'
            }
          } else {
            alert('Erro ao verificar permissões. Acesso negado.')
            localStorage.removeItem('isSuperAdmin')
            window.location.href = '/'
          }
        }
      } catch (error) {
        console.error('Erro ao verificar super admin:', error)
        // Em caso de erro de rede, permitir acesso se já estava marcado como super admin
        if (isSuperAdminLocal === 'true') {
          console.warn('Erro na verificação, mas permitindo acesso baseado em localStorage')
          setIsSuperAdmin(true)
          carregarDados()
        } else {
          alert('Erro ao verificar permissões. Acesso negado.')
          localStorage.removeItem('token')
          localStorage.removeItem('isSuperAdmin')
          window.location.href = '/auth/login'
        }
      }
    }

    checkSuperAdmin()
  }, [])

  useEffect(() => {
    if (isSuperAdmin && (activeTab === 'lojas' || activeTab === 'saques' || activeTab === 'gateways' || activeTab === 'comissoes' || activeTab === 'anuncios')) {
      if (activeTab === 'gateways') {
        carregarGatewaysAdmin()
      }
      carregarDados()
    }
  }, [activeTab, filtroStatus, filtroStatusSaque, isSuperAdmin])

  // Buscar comissão da loja quando ela for selecionada
  useEffect(() => {
    async function carregarComissaoLoja() {
      if (!lojaSelecionada) {
        setComissaoLojaSelecionada(null)
        return
      }

      try {
        const token = localStorage.getItem('token')
        if (!token) return

        const response = await fetch(`/api/admin/comissoes?loja_id=${lojaSelecionada.id_lojas}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          const comissaoLoja = data.comissoesPorLoja?.find((item: ComissaoPorLoja) => 
            item.loja?.id_lojas === lojaSelecionada.id_lojas
          )
          
          if (comissaoLoja) {
            setComissaoLojaSelecionada({
              total: comissaoLoja.total,
              count: comissaoLoja.count
            })
          } else {
            setComissaoLojaSelecionada({ total: 0, count: 0 })
          }
        }
      } catch (error) {
        console.error('Erro ao carregar comissão da loja:', error)
        setComissaoLojaSelecionada({ total: 0, count: 0 })
      }
    }

    carregarComissaoLoja()
  }, [lojaSelecionada])

  async function carregarDados() {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      if (!token) return

      if (activeTab === 'lojas') {
        // Carregar lojas
        const response = await fetch('/api/admin/lojas', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (response.ok) {
          const data = await response.json()
          setLojas(data)
        }
        
        // Carregar carteiras pendentes quando estiver na aba de lojas
        const statusParam = filtroStatus === 'todos' ? 'todos' : filtroStatus
        const carteirasResponse = await fetch(`/api/admin/carteira-pendente?status=${statusParam}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (carteirasResponse.ok) {
          const carteirasData = await carteirasResponse.json()
          console.log('Carteiras pendentes carregadas:', carteirasData)
          setCarteirasPendentes(carteirasData || [])
        } else {
          const errorData = await carteirasResponse.json().catch(() => ({}))
          console.error('Erro ao carregar carteiras pendentes:', errorData)
        }
      } else if (activeTab === 'saques') {
        const statusParam = filtroStatusSaque === 'todos' ? 'todos' : filtroStatusSaque
        const response = await fetch(`/api/admin/saques?status=${statusParam}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (response.ok) {
          const data = await response.json()
          setSaques(data)
        }
      } else if (activeTab === 'comissoes') {
        const response = await fetch('/api/admin/comissoes', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (response.ok) {
          const data = await response.json()
          setComissoes(data.comissoes || [])
          setComissoesPorLoja(data.comissoesPorLoja || [])
          setTotalComissoes(data.totalGeral || 0)
        }
      } else if (activeTab === 'anuncios') {
        const response = await fetch('/api/admin/anuncios', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (response.ok) {
          const data = await response.json()
          console.log('Anúncios carregados:', data)
          setAnuncios(data || [])
        } else {
          const errorData = await response.json().catch(() => ({}))
          console.error('Erro ao carregar anúncios:', errorData)
          alert(`Erro ao carregar anúncios: ${errorData.error || 'Erro desconhecido'}`)
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  async function excluirAnuncio(id: number) {
    if (!confirm('Tem certeza que deseja excluir este anúncio? Esta ação não pode ser desfeita.')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        alert('Token não encontrado. Faça login novamente.')
        return
      }

      const response = await fetch(`/api/admin/anuncios/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (response.ok) {
        alert('Anúncio excluído com sucesso!')
        // Recarregar lista de anúncios
        await carregarDados()
      } else {
        console.error('Erro na resposta:', data)
        alert(`Erro ao excluir anúncio: ${data.error || 'Erro desconhecido'}`)
      }
    } catch (error: any) {
      console.error('Erro ao excluir anúncio:', error)
      alert(`Erro ao excluir anúncio: ${error.message || 'Erro desconhecido'}`)
    }
  }

  async function criarAnuncio() {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        alert('Token não encontrado. Faça login novamente.')
        return
      }

      if (!formAnuncio.titulo || !formAnuncio.mensagem) {
        alert('Preencha título e mensagem')
        return
      }

      if (!formAnuncio.enviado_para_todas && formAnuncio.lojas_selecionadas.length === 0) {
        alert('Selecione pelo menos uma loja ou marque "Enviar para todas as lojas"')
        return
      }

      const dataExpiracao = formAnuncio.data_expiracao && formAnuncio.data_expiracao.trim() !== '' 
        ? formAnuncio.data_expiracao 
        : null

      const response = await fetch('/api/admin/anuncios', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          titulo: formAnuncio.titulo.trim(),
          mensagem: formAnuncio.mensagem.trim(),
          tipo: formAnuncio.tipo,
          enviado_para_todas: formAnuncio.enviado_para_todas,
          lojas_ids: formAnuncio.enviado_para_todas ? [] : formAnuncio.lojas_selecionadas,
          data_expiracao: dataExpiracao
        })
      })

      const data = await response.json()
      console.log('Resposta da API criar anúncio:', data)

      if (response.ok && data.success) {
        alert('Anúncio criado com sucesso!')
        setMostrarModalAnuncio(false)
        setFormAnuncio({
          titulo: '',
          mensagem: '',
          tipo: 'info',
          enviado_para_todas: true,
          lojas_selecionadas: [],
          data_expiracao: ''
        })
        
        // Forçar recarregar dados da aba de anúncios
        if (activeTab === 'anuncios') {
          // Aguardar um pouco para garantir que o banco processou
          setTimeout(async () => {
            await carregarDados()
          }, 500)
        } else {
          // Se não estiver na aba, mudar para ela e carregar
          setActiveTab('anuncios')
          setTimeout(async () => {
            await carregarDados()
          }, 500)
        }
      } else {
        console.error('Erro na resposta:', data)
        alert(`Erro ao criar anúncio: ${data.error || 'Erro desconhecido'}`)
      }
    } catch (error: any) {
      console.error('Erro ao criar anúncio:', error)
      alert(`Erro ao criar anúncio: ${error.message || 'Erro desconhecido'}`)
    }
  }

  async function aprovarCarteira(id: number, aprovado: boolean) {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`/api/admin/carteira-pendente/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: aprovado ? 'aprovado' : 'rejeitado',
          observacoes: observacoes || undefined
        })
      })

      if (response.ok) {
        const result = await response.json()
        alert(`Solicitação ${aprovado ? 'aprovada' : 'rejeitada'} com sucesso!`)
        setCarteiraSelecionada(null)
        setObservacoes('')
        carregarDados()
      } else {
        let errorMessage = 'Erro ao processar solicitação'
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorData.message || errorMessage
        } catch (parseError) {
          // Se não conseguir fazer parse do JSON, usar o status
          errorMessage = `Erro ${response.status}: ${response.statusText}`
        }
        alert(`Erro: ${errorMessage}`)
      }
    } catch (err) {
      console.error('Erro ao processar solicitação:', err)
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao processar solicitação'
      alert(`Erro: ${errorMessage}`)
    }
  }

  const lojasFiltradas = lojas.filter(loja =>
    loja.nome_loja.toLowerCase().includes(busca.toLowerCase()) ||
    loja.usuario.nome.toLowerCase().includes(busca.toLowerCase()) ||
    loja.usuario.email.toLowerCase().includes(busca.toLowerCase())
  )

  const saquesFiltrados = saques.filter(saque =>
    saque.usuarios.email.toLowerCase().includes(buscaSaques.toLowerCase()) ||
    saque.usuarios.nome.toLowerCase().includes(buscaSaques.toLowerCase()) ||
    saque.chave_pix.toLowerCase().includes(buscaSaques.toLowerCase())
  )

  async function carregarGatewaysAdmin() {
    try {
      setLoadingGateways(true)
      const token = localStorage.getItem('token')
      if (!token) return

      // Buscar gateway padrão global
      const gatewayPadraoResponse = await fetch('/api/admin/gateway-padrao', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (gatewayPadraoResponse.ok) {
        const gatewayPadraoData = await gatewayPadraoResponse.json()
        setGatewayPadraoGlobal(gatewayPadraoData.gateway_padrao || 'carteira')
      }

      // Buscar todas as lojas primeiro
      const lojasResponse = await fetch('/api/admin/lojas', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (lojasResponse.ok) {
        const lojasData = await lojasResponse.json()
        
        // Pegar configurações da primeira loja encontrada
        if (lojasData.length > 0) {
          const lojaId = lojasData[0].id_lojas
          
          const gatewaysResponse = await fetch('/api/gateways-carteira', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          
          if (gatewaysResponse.ok) {
            const gateways = await gatewaysResponse.json()
            
            // Filtrar gateways da primeira loja
            const gatewaysLoja = gateways.filter((g: any) => g.lojas_id_lojas === lojaId)
            
            const novosAtivos: { [key: string]: boolean } = {}
            const novasConfigs: { [key: string]: any } = {
              carteira: { cpf: '', nome_completo: '', chave_pix: '' },
              mercadopago: { access_token: '', public_key: '' },
              pushinpay: { api_key: '', secret_key: '' }
            }

            gatewaysLoja.forEach((gateway: any) => {
              novosAtivos[gateway.gateway_tipo] = gateway.ativo
              if (gateway.credenciais) {
                novasConfigs[gateway.gateway_tipo] = gateway.credenciais
              }
            })

            setGatewaysAtivos(prev => ({ ...prev, ...novosAtivos }))
            setConfigGateway(prev => ({ ...prev, ...novasConfigs }))
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar gateways:', error)
    } finally {
      setLoadingGateways(false)
    }
  }

  async function salvarConfiguracaoGatewayAdmin() {
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
        // Para super admin configurando carteira, não precisa de credenciais
        // Apenas define o gateway padrão
        credenciais = {}
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

      // Buscar todas as lojas para aplicar a configuração
      const lojasResponse = await fetch('/api/admin/lojas', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!lojasResponse.ok) {
        alert('Erro ao buscar lojas')
        return
      }

      const lojas = await lojasResponse.json()
      if (lojas.length === 0) {
        alert('Nenhuma loja encontrada. É necessário ter pelo menos uma loja para configurar gateways.')
        return
      }

      // Se configurou a carteira, apenas definir o gateway padrão global
      if (gatewayTipo === 'carteira') {
        const gatewayPadraoResponse = await fetch('/api/admin/gateway-padrao', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            gateway_padrao: gatewayPadraoGlobal
          })
        })

        if (gatewayPadraoResponse.ok) {
          const gatewayPadraoData = await gatewayPadraoResponse.json()
          alert(`Gateway padrão definido com sucesso: ${gatewayPadraoGlobal === 'carteira' ? 'Carteira (PIX)' : gatewayPadraoGlobal === 'pushinpay' ? 'Pushin Pay' : 'Mercado Pago'}. Este gateway será usado por todas as lojas que não tiverem um gateway específico configurado.`)
          setGatewayConfigurando(null)
          carregarGatewaysAdmin()
        } else {
          const error = await gatewayPadraoResponse.json()
          alert(`Erro: ${error.error}`)
        }
        return
      }

      // Para outros gateways, salvar configuração para todas as lojas
      let sucesso = true
      let erros: string[] = []

      for (const loja of lojas) {
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

        if (!response.ok) {
          const error = await response.json()
          erros.push(`Loja ${loja.nome_loja}: ${error.error}`)
          sucesso = false
        }
      }

      if (sucesso) {
        alert(`Configurações salvas com sucesso para ${lojas.length} loja(s)!`)
        setGatewayConfigurando(null)
        carregarGatewaysAdmin()
      } else {
        alert(`Configuração salva parcialmente. Erros: ${erros.join(', ')}`)
      }
    } catch (error) {
      console.error('Erro ao salvar configuração:', error)
      alert('Erro ao salvar configuração do gateway')
    }
  }

  async function toggleGatewayAtivoAdmin(gatewayTipo: string) {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const novoStatus = !gatewaysAtivos[gatewayTipo]

      // Buscar primeira loja
      const lojasResponse = await fetch('/api/admin/lojas', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!lojasResponse.ok) {
        alert('Erro ao buscar lojas')
        return
      }

      const lojas = await lojasResponse.json()
      if (lojas.length === 0) {
        alert('Nenhuma loja encontrada')
        return
      }

      const lojaId = lojas[0].id_lojas

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
        setGatewaysAtivos(prev => ({ ...prev, [gatewayTipo]: novoStatus }))
        carregarGatewaysAdmin()
      } else {
        const error = await response.json()
        alert(`Erro: ${error.error}`)
      }
    } catch (error) {
      console.error('Erro ao atualizar gateway:', error)
      alert('Erro ao atualizar status do gateway')
    }
  }

  async function processarSaque(id: number, status: 'concluido' | 'rejeitado') {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`/api/admin/saques/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status,
          observacoes: observacoesSaque || undefined
        })
      })

      if (response.ok) {
        alert(`Saque ${status === 'concluido' ? 'aprovado' : 'rejeitado'} com sucesso!`)
        setSaqueSelecionado(null)
        setObservacoesSaque('')
        carregarDados()
      } else {
        const error = await response.json()
        alert(`Erro: ${error.error}`)
      }
    } catch (error) {
      console.error('Erro ao processar saque:', error)
      alert('Erro ao processar saque')
    }
  }

  const receitaTotal = lojas.reduce((acc, loja) => acc + loja.receita_total, 0)
  const totalVendas = lojas.reduce((acc, loja) => acc + loja.total_vendas, 0)

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="mb-6">
            <Shield className="h-16 w-16 text-red-500 mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h1>
          <p className="text-gray-600 mb-6">
            Você não tem permissão para acessar esta página. Apenas super administradores podem acessar o painel administrativo.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Administrativo</h1>
            <p className="text-gray-600">Gerencie lojas, saques e gateways de pagamento</p>
          </div>
          <div className="flex items-center space-x-2 px-4 py-2 bg-red-100 rounded-lg">
            <Lock className="h-5 w-5 text-red-600" />
            <span className="text-sm font-medium text-red-800">Super Admin</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('lojas')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'lojas'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Lojas
          </button>
          <button
            onClick={() => setActiveTab('saques')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'saques'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Saques
          </button>
          <button
            onClick={() => setActiveTab('gateways')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'gateways'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Gateways de Pagamento
          </button>
          <button
            onClick={() => setActiveTab('comissoes')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'comissoes'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Comissões
          </button>
          <button
            onClick={() => setActiveTab('anuncios')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'anuncios'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Anúncios
          </button>
        </div>
      </div>

      {activeTab === 'lojas' && (
        <div className="space-y-6">
          {/* Estatísticas Gerais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total de Lojas</p>
                  <p className="text-3xl font-bold text-gray-900">{lojas.length}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total de Vendas</p>
                  <p className="text-3xl font-bold text-gray-900">{totalVendas}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Receita Total</p>
                  <p className="text-3xl font-bold text-gray-900">
                    R$ {receitaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Busca */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome da loja, nome do usuário ou email..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Tabela de Lojas */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-4 text-gray-600">Carregando lojas...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Loja
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Proprietário
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total de Vendas
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Receita Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {lojasFiltradas.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <p className="text-gray-600">Nenhuma loja encontrada</p>
                        </td>
                      </tr>
                    ) : (
                      lojasFiltradas.map((loja) => (
                        <tr key={loja.id_lojas} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{loja.nome_loja || 'Sem nome'}</div>
                            <div className="text-sm text-gray-500">{loja.usuario.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{loja.usuario.nome}</div>
                            {loja.usuario.telefone && (
                              <div className="text-sm text-gray-500">{loja.usuario.telefone}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {loja.total_vendas}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                            R$ {loja.receita_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                loja.status === 'ativa'
                                  ? 'bg-green-100 text-green-800'
                                  : loja.status === 'suspensa'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {loja.status === 'ativa' ? 'Ativa' : loja.status === 'suspensa' ? 'Suspensa' : 'Pendente'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => setLojaSelecionada(loja)}
                              className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                            >
                              <Eye className="h-4 w-4" />
                              <span className="text-sm">Ver Detalhes</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Solicitações de Carteira Pendentes */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Solicitações de Carteira</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Aprove ou rejeite solicitações de usuários que querem usar a Carteira
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={async () => {
                      setFiltroStatus('todos')
                      await carregarDados()
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      filtroStatus === 'todos'
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Todas
                  </button>
                  <button
                    onClick={async () => {
                      setFiltroStatus('pendente')
                      await carregarDados()
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      filtroStatus === 'pendente'
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Pendentes
                  </button>
                  <button
                    onClick={async () => {
                      setFiltroStatus('aprovado')
                      await carregarDados()
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      filtroStatus === 'aprovado'
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Aprovadas
                  </button>
                  <button
                    onClick={async () => {
                      setFiltroStatus('rejeitado')
                      await carregarDados()
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      filtroStatus === 'rejeitado'
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Rejeitadas
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-4 text-gray-600">Carregando solicitações...</p>
              </div>
            ) : carteirasPendentes.length === 0 ? (
              <div className="text-center py-12">
                <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  {filtroStatus === 'todos'
                    ? 'Nenhuma solicitação encontrada'
                    : filtroStatus === 'pendente' 
                    ? 'Nenhuma solicitação pendente' 
                    : filtroStatus === 'aprovado'
                    ? 'Nenhuma solicitação aprovada'
                    : 'Nenhuma solicitação rejeitada'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usuário
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        CPF
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome Completo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Chave PIX
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data Solicitação
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {carteirasPendentes.map((carteira) => (
                      <tr key={carteira.id_carteira_pendente} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{carteira.usuario?.nome || 'N/A'}</div>
                            <div className="text-sm text-gray-500">{carteira.usuario?.email || 'N/A'}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{carteira.cpf}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{carteira.nome_completo}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-mono">{carteira.chave_pix}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {carteira.data_solicitacao ? new Date(carteira.data_solicitacao).toLocaleString('pt-BR') : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              carteira.status === 'aprovado'
                                ? 'bg-green-100 text-green-800'
                                : carteira.status === 'rejeitado'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {carteira.status === 'aprovado' ? 'Aprovado' : carteira.status === 'rejeitado' ? 'Rejeitado' : 'Pendente'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {carteira.status === 'pendente' && (
                            <button
                              onClick={() => setCarteiraSelecionada(carteira)}
                              className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                            >
                              <Eye className="h-4 w-4" />
                              <span className="text-sm">Ver/Aprovar</span>
                            </button>
                          )}
                          {carteira.status !== 'pendente' && carteira.aprovador && (
                            <div className="text-xs text-gray-500">
                              Por: {carteira.aprovador.nome}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'saques' && (
        <div className="space-y-6">
          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Saques Pendentes</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {saques.filter(s => s.status === 'pendente').length}
                  </p>
                </div>
                <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total de Saques</p>
                  <p className="text-3xl font-bold text-gray-900">{saques.length}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Valor Total Pendente</p>
                  <p className="text-3xl font-bold text-gray-900">
                    R$ {saques
                      .filter(s => s.status === 'pendente')
                      .reduce((acc, s) => acc + Number(s.valor), 0)
                      .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Filtros e Busca */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <Filter className="h-5 w-5 text-gray-400" />
                <div className="flex space-x-2">
                  <button
                    onClick={() => setFiltroStatusSaque('pendente')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      filtroStatusSaque === 'pendente'
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Pendentes
                  </button>
                  <button
                    onClick={() => setFiltroStatusSaque('concluido')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      filtroStatusSaque === 'concluido'
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Concluídos
                  </button>
                  <button
                    onClick={() => setFiltroStatusSaque('rejeitado')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      filtroStatusSaque === 'rejeitado'
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Rejeitados
                  </button>
                  <button
                    onClick={() => setFiltroStatusSaque('todos')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      filtroStatusSaque === 'todos'
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Todos
                  </button>
                </div>
              </div>
              <div className="flex-1 max-w-md relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por usuário, email ou chave PIX..."
                  value={buscaSaques}
                  onChange={(e) => setBuscaSaques(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={carregarDados}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Atualizar"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Lista de Saques */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-4 text-gray-600">Carregando saques...</p>
              </div>
            ) : saquesFiltrados.length === 0 ? (
              <div className="text-center py-12">
                <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nenhum saque encontrado</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usuário
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Chave PIX
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data Solicitação
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {saquesFiltrados.map((saque) => (
                      <tr key={saque.id_saques} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{saque.usuarios.nome}</div>
                            <div className="text-sm text-gray-500">{saque.usuarios.email}</div>
                            <div className="text-xs text-gray-400">{saque.usuarios.telefone}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            R$ {Number(saque.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-mono">{saque.chave_pix}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              saque.status === 'concluido'
                                ? 'bg-green-100 text-green-800'
                                : saque.status === 'rejeitado'
                                ? 'bg-red-100 text-red-800'
                                : saque.status === 'processando'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {saque.status === 'concluido' ? 'Concluído' : 
                             saque.status === 'rejeitado' ? 'Rejeitado' :
                             saque.status === 'processando' ? 'Processando' : 'Pendente'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {saque.data_solicitacao ? new Date(saque.data_solicitacao).toLocaleString('pt-BR') : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {saque.status === 'pendente' && (
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => setSaqueSelecionado(saque)}
                                className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                              >
                                <Eye className="h-4 w-4" />
                                <span className="text-sm">Ver</span>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'gateways' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Configuração de Gateways de Pagamento</h2>
            <p className="text-gray-600 mb-6">
              Configure os métodos de pagamento disponíveis para os usuários da plataforma.
            </p>
            
            {loadingGateways ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-4 text-gray-600">Carregando gateways...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Carteira */}
                <div className={`bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 p-6 ${gatewaysAtivos.carteira ? 'border-green-500' : 'border-green-200'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                        <Wallet className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">PIX</h3>
                        <p className="text-sm text-gray-600">Carteira</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleGatewayAtivoAdmin('carteira')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        gatewaysAtivos.carteira ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          gatewaysAtivos.carteira ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Status</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${gatewaysAtivos.carteira ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {gatewaysAtivos.carteira ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Taxa</span>
                      <span className="text-sm font-medium text-gray-900">Consultar</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setGatewayConfigurando('carteira')}
                    className="mt-4 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    Configurar
                  </button>
                </div>

                {/* Pushin Pay */}
                <div className={`bg-white rounded-xl border-2 p-6 ${gatewaysAtivos.pushinpay ? 'border-purple-500' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <CreditCard className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Pushin Pay</h3>
                        <p className="text-sm text-gray-600">Gateway</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleGatewayAtivoAdmin('pushinpay')}
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
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Status</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${gatewaysAtivos.pushinpay ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {gatewaysAtivos.pushinpay ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Taxa</span>
                      <span className="text-sm font-medium text-gray-900">Sem taxa</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setGatewayConfigurando('pushinpay')}
                    className="mt-4 w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    Configurar
                  </button>
                </div>

                {/* Mercado Pago */}
                <div className={`bg-white rounded-xl border-2 p-6 ${gatewaysAtivos.mercadopago ? 'border-blue-500' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <CreditCard className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Mercado Pago</h3>
                        <p className="text-sm text-gray-600">Gateway</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleGatewayAtivoAdmin('mercadopago')}
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
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Status</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${gatewaysAtivos.mercadopago ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {gatewaysAtivos.mercadopago ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Taxa</span>
                      <span className="text-sm font-medium text-gray-900">Sem taxa</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setGatewayConfigurando('mercadopago')}
                    className="mt-4 w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    Configurar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Configuração de Gateway */}
      {gatewayConfigurando && (
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
                    Selecione qual gateway de pagamento será usado por padrão para todas as lojas da plataforma.
                  </p>
                </div>

                {/* Seleção de Gateway Padrão */}
                <div>
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 mb-4">
                    <p className="text-sm text-gray-700 font-medium mb-2">
                      Gateway Padrão para Todas as Lojas
                    </p>
                    <p className="text-xs text-gray-600">
                      Selecione qual gateway de pagamento será usado por padrão para todos os donos de loja que não tiverem um gateway específico configurado.
                    </p>
                  </div>
                  
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gateway Padrão <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={gatewayPadraoGlobal}
                    onChange={(e) => setGatewayPadraoGlobal(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                  >
                    <option value="carteira">Carteira (PIX)</option>
                    <option value="pushinpay">Pushin Pay</option>
                    <option value="mercadopago">Mercado Pago</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Este gateway será aplicado automaticamente a todas as lojas que não tiverem um gateway específico configurado.
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
                </div>
              </div>
            )}

            {(gatewayConfigurando === 'pushinpay' || gatewayConfigurando === 'pushpay') && (
              <div className="space-y-4">
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
                onClick={() => salvarConfiguracaoGatewayAdmin()}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'comissoes' && (
        <div className="space-y-6">
          {/* Estatísticas de Comissões */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Comissão Total</p>
                  <p className="text-3xl font-bold text-green-700">
                    R$ {totalComissoes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-200 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-700" />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total de Transações</p>
                  <p className="text-3xl font-bold text-blue-700">{comissoes.length}</p>
                </div>
                <div className="h-12 w-12 bg-blue-200 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-blue-700" />
                </div>
              </div>
            </div>
          </div>

          {/* Comissões por Loja */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Comissões por Loja</h2>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-4 text-gray-600">Carregando comissões...</p>
              </div>
            ) : comissoesPorLoja.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nenhuma comissão encontrada</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Loja
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Transações
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Comissão Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {comissoesPorLoja.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {item.loja?.nome_loja || 'Loja Desconhecida'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item.count}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-green-600">
                            R$ {item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Histórico de Comissões */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Histórico de Comissões</h2>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-4 text-gray-600">Carregando histórico...</p>
              </div>
            ) : comissoes.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nenhuma comissão registrada</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Loja
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor da Venda
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Taxa Fixa
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Taxa %
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Comissão
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {comissoes.map((comissao) => (
                      <tr key={comissao.id_comissoes} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {comissao.data_venda ? new Date(comissao.data_venda).toLocaleDateString('pt-BR') : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {comissao.loja?.nome_loja || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            R$ {Number(comissao.valor_venda).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            R$ {Number(comissao.taxa_fixa).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {Number(comissao.taxa_percentual).toFixed(2)}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-green-600">
                            R$ {Number(comissao.valor_comissao).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'anuncios' && (
        <div className="space-y-6">
          {/* Cabeçalho com botão de criar */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Anúncios e Avisos</h2>
              <p className="text-gray-600 mt-1">Envie avisos para lojas específicas ou para todas as lojas</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => carregarDados()}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                title="Atualizar lista"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
              <button
                onClick={() => setMostrarModalAnuncio(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span>Criar Anúncio</span>
              </button>
            </div>
          </div>

          {/* Lista de Anúncios */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando anúncios...</p>
            </div>
          ) : !anuncios || anuncios.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <Megaphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhum anúncio criado ainda</p>
              <p className="text-sm text-gray-500 mt-2">Clique em "Criar Anúncio" para começar</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {anuncios.map((anuncio: any) => (
                <div
                  key={anuncio.id_anuncios}
                  className={`bg-white rounded-xl border-2 p-6 ${
                    anuncio.tipo === 'importante'
                      ? 'border-red-200 bg-red-50'
                      : anuncio.tipo === 'aviso'
                      ? 'border-yellow-200 bg-yellow-50'
                      : anuncio.tipo === 'promocao'
                      ? 'border-purple-200 bg-purple-50'
                      : 'border-blue-200 bg-blue-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-3 flex-1">
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          anuncio.tipo === 'importante'
                            ? 'bg-red-100'
                            : anuncio.tipo === 'aviso'
                            ? 'bg-yellow-100'
                            : anuncio.tipo === 'promocao'
                            ? 'bg-purple-100'
                            : 'bg-blue-100'
                        }`}
                      >
                        {anuncio.tipo === 'importante' ? (
                          <AlertCircle className="h-5 w-5 text-red-600" />
                        ) : anuncio.tipo === 'aviso' ? (
                          <AlertCircle className="h-5 w-5 text-yellow-600" />
                        ) : anuncio.tipo === 'promocao' ? (
                          <Tag className="h-5 w-5 text-purple-600" />
                        ) : (
                          <Info className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{anuncio.titulo}</h3>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{anuncio.mensagem}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>
                        {anuncio.enviado_para_todas 
                          ? 'Enviado para todas as lojas' 
                          : `Enviado para ${anuncio.lojas?.length || 0} loja(s) específica(s)`
                        }
                      </span>
                      <span>•</span>
                      <span>Criado em {anuncio.data_criacao ? new Date(anuncio.data_criacao).toLocaleDateString('pt-BR') : '-'}</span>
                      {anuncio.data_expiracao && (
                        <>
                          <span>•</span>
                          <span>Expira em {new Date(anuncio.data_expiracao).toLocaleDateString('pt-BR')}</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center space-x-3">
                      {anuncio.criador && (
                        <span className="text-xs text-gray-500">
                          Por: {anuncio.criador.nome || 'Admin'}
                        </span>
                      )}
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          anuncio.ativo
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {anuncio.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                      <button
                        onClick={() => excluirAnuncio(anuncio.id_anuncios)}
                        className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir anúncio"
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
      )}

      {/* Modal de Criar Anúncio */}
      {mostrarModalAnuncio && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Criar Novo Anúncio</h3>
              <button
                onClick={() => setMostrarModalAnuncio(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título *
                </label>
                <input
                  type="text"
                  value={formAnuncio.titulo}
                  onChange={(e) => setFormAnuncio({ ...formAnuncio, titulo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="Digite o título do anúncio"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mensagem *
                </label>
                <textarea
                  value={formAnuncio.mensagem}
                  onChange={(e) => setFormAnuncio({ ...formAnuncio, mensagem: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="Digite a mensagem do anúncio"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <select
                  value={formAnuncio.tipo}
                  onChange={(e) => setFormAnuncio({ ...formAnuncio, tipo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                >
                  <option value="info">Informação</option>
                  <option value="aviso">Aviso</option>
                  <option value="importante">Importante</option>
                  <option value="promocao">Promoção</option>
                </select>
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formAnuncio.enviado_para_todas}
                    onChange={(e) => setFormAnuncio({ ...formAnuncio, enviado_para_todas: e.target.checked, lojas_selecionadas: [] })}
                    className="h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Enviar para todas as lojas</span>
                </label>
              </div>

              {!formAnuncio.enviado_para_todas && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selecionar Lojas
                  </label>
                  <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3 space-y-2">
                    {lojas.map((loja) => (
                      <label key={loja.id_lojas} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formAnuncio.lojas_selecionadas.includes(loja.id_lojas)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormAnuncio({
                                ...formAnuncio,
                                lojas_selecionadas: [...formAnuncio.lojas_selecionadas, loja.id_lojas]
                              })
                            } else {
                              setFormAnuncio({
                                ...formAnuncio,
                                lojas_selecionadas: formAnuncio.lojas_selecionadas.filter(id => id !== loja.id_lojas)
                              })
                            }
                          }}
                          className="h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">{loja.nome_loja}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Expiração (opcional)
                </label>
                <input
                  type="datetime-local"
                  value={formAnuncio.data_expiracao}
                  onChange={(e) => setFormAnuncio({ ...formAnuncio, data_expiracao: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  onClick={() => setMostrarModalAnuncio(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={criarAnuncio}
                  className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Criar Anúncio
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalhes da Loja */}
      {lojaSelecionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Detalhes da Loja</h3>
              <button
                onClick={() => setLojaSelecionada(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Informações da Loja */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Informações da Loja</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Nome da Loja</p>
                    <p className="text-sm font-medium text-gray-900">{lojaSelecionada.nome_loja || 'Sem nome'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Status</p>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        lojaSelecionada.status === 'ativa'
                          ? 'bg-green-100 text-green-800'
                          : lojaSelecionada.status === 'suspensa'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {lojaSelecionada.status === 'ativa' ? 'Ativa' : lojaSelecionada.status === 'suspensa' ? 'Suspensa' : 'Pendente'}
                    </span>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Data de Criação</p>
                    <p className="text-sm font-medium text-gray-900">
                      {lojaSelecionada.data_criacao ? new Date(lojaSelecionada.data_criacao).toLocaleDateString('pt-BR') : '-'}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Total de Vendas</p>
                    <p className="text-sm font-medium text-gray-900">{lojaSelecionada.total_vendas}</p>
                  </div>
                </div>
              </div>

              {/* Informações do Proprietário */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Proprietário</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Nome</p>
                    <p className="text-sm font-medium text-gray-900">{lojaSelecionada.usuario.nome}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Email</p>
                    <p className="text-sm font-medium text-gray-900">{lojaSelecionada.usuario.email}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Telefone</p>
                    <p className="text-sm font-medium text-gray-900">{lojaSelecionada.usuario.telefone || 'N/A'}</p>
                  </div>
                  {lojaSelecionada.usuario.cpf && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">CPF</p>
                      <p className="text-sm font-medium text-gray-900 font-mono">{lojaSelecionada.usuario.cpf}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Estatísticas Financeiras */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Estatísticas Financeiras</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-xs text-gray-500 mb-1">Receita Total</p>
                    <p className="text-lg font-bold text-green-700">
                      R$ {lojaSelecionada.receita_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-gray-500 mb-1">Total de Vendas</p>
                    <p className="text-lg font-bold text-blue-700">{lojaSelecionada.total_vendas}</p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="text-xs text-gray-500 mb-1">Comissões</p>
                    <p className="text-lg font-bold text-orange-700">
                      R$ {comissaoLojaSelecionada?.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {comissaoLojaSelecionada?.count || 0} transação{comissaoLojaSelecionada?.count !== 1 ? 'ões' : ''}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end pt-4">
                <button
                  onClick={() => setLojaSelecionada(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalhes do Saque */}
      {saqueSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Detalhes do Saque</h3>
              <button
                onClick={() => setSaqueSelecionado(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Usuário</p>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-900"><strong>Nome:</strong> {saqueSelecionado.usuarios.nome}</p>
                  <p className="text-sm text-gray-900"><strong>Email:</strong> {saqueSelecionado.usuarios.email}</p>
                  <p className="text-sm text-gray-900"><strong>Telefone:</strong> {saqueSelecionado.usuarios.telefone || 'N/A'}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Dados do Saque</p>
                <div className="p-3 bg-gray-50 rounded-lg space-y-2">
                  <p className="text-sm text-gray-900"><strong>Valor:</strong> R$ {Number(saqueSelecionado.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  <p className="text-sm text-gray-900"><strong>Chave PIX:</strong> <span className="font-mono">{saqueSelecionado.chave_pix}</span></p>
                  <p className="text-sm text-gray-900"><strong>Status:</strong> 
                    <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${
                      saqueSelecionado.status === 'concluido' ? 'bg-green-100 text-green-800' :
                      saqueSelecionado.status === 'rejeitado' ? 'bg-red-100 text-red-800' :
                      saqueSelecionado.status === 'processando' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {saqueSelecionado.status === 'concluido' ? 'Concluído' :
                       saqueSelecionado.status === 'rejeitado' ? 'Rejeitado' :
                       saqueSelecionado.status === 'processando' ? 'Processando' : 'Pendente'}
                    </span>
                  </p>
                  <p className="text-sm text-gray-900"><strong>Data Solicitação:</strong> {saqueSelecionado.data_solicitacao ? new Date(saqueSelecionado.data_solicitacao).toLocaleString('pt-BR') : '-'}</p>
                  {saqueSelecionado.data_processamento && (
                    <p className="text-sm text-gray-900"><strong>Data Processamento:</strong> {new Date(saqueSelecionado.data_processamento).toLocaleString('pt-BR')}</p>
                  )}
                </div>
              </div>

              {saqueSelecionado.observacoes && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Observações</p>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-900">{saqueSelecionado.observacoes}</p>
                  </div>
                </div>
              )}

              {saqueSelecionado.status === 'pendente' && (
                <>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Observações (opcional)</p>
                    <textarea
                      value={observacoesSaque}
                      onChange={(e) => setObservacoesSaque(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Adicione observações sobre a aprovação ou rejeição..."
                    />
                  </div>

                  <div className="flex items-center justify-end space-x-3 pt-4">
                    <button
                      onClick={() => setSaqueSelecionado(null)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => processarSaque(saqueSelecionado.id_saques, 'rejeitado')}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Rejeitar
                    </button>
                    <button
                      onClick={() => processarSaque(saqueSelecionado.id_saques, 'concluido')}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Aprovar Saque
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalhes da Carteira (mantido para compatibilidade) */}
      {carteiraSelecionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Detalhes da Solicitação</h3>
              <button
                onClick={() => setCarteiraSelecionada(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Usuário</p>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-900"><strong>Nome:</strong> {carteiraSelecionada.usuario?.nome || 'N/A'}</p>
                  <p className="text-sm text-gray-900"><strong>Email:</strong> {carteiraSelecionada.usuario?.email || 'N/A'}</p>
                  <p className="text-sm text-gray-900"><strong>Telefone:</strong> {carteiraSelecionada.usuario?.telefone || 'N/A'}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Dados da Carteira</p>
                <div className="p-3 bg-gray-50 rounded-lg space-y-2">
                  <p className="text-sm text-gray-900"><strong>CPF:</strong> <span className="font-mono">{carteiraSelecionada.cpf}</span></p>
                  <p className="text-sm text-gray-900"><strong>Nome Completo:</strong> {carteiraSelecionada.nome_completo}</p>
                  <p className="text-sm text-gray-900"><strong>Chave PIX:</strong> <span className="font-mono">{carteiraSelecionada.chave_pix}</span></p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Observações (opcional)</p>
                <textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Adicione observações sobre a aprovação ou rejeição..."
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  onClick={() => setCarteiraSelecionada(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => aprovarCarteira(carteiraSelecionada.id_carteira_pendente, false)}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Rejeitar
                </button>
                <button
                  onClick={() => aprovarCarteira(carteiraSelecionada.id_carteira_pendente, true)}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Aprovar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

