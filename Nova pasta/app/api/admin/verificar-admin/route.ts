import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { verificarToken } from '@/lib/auth'

// GET - Verificar se o usuário é super admin
export async function GET(request: NextRequest) {
  try {
    const usuario = verificarToken(request)

    if (!usuario) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se o usuário é super admin no banco
    console.log('🔍 [VERIFICAR-ADMIN] Verificando usuário ID:', usuario.id, 'Email:', usuario.email)
    
    // Primeiro tentar buscar por ID
    let { data: usuarioData, error } = await supabase
      .from('usuarios')
      .select('is_super_admin, id_usuarios, email, nome')
      .eq('id_usuarios', usuario.id)
      .single()

    // Se não encontrar por ID, tentar por email
    if (error || !usuarioData) {
      console.log('⚠️ [VERIFICAR-ADMIN] Não encontrado por ID, tentando por email...')
      const { data: usuarioPorEmail, error: errorEmail } = await supabase
        .from('usuarios')
        .select('is_super_admin, id_usuarios, email, nome')
        .eq('email', usuario.email)
        .single()

      if (errorEmail) {
        console.error('❌ [VERIFICAR-ADMIN] Erro ao buscar por email:', errorEmail)
        return NextResponse.json(
          { error: 'Erro ao verificar permissões', details: errorEmail.message },
          { status: 500 }
        )
      }

      if (!usuarioPorEmail) {
        console.error('❌ [VERIFICAR-ADMIN] Usuário não encontrado no banco')
        return NextResponse.json(
          { error: 'Usuário não encontrado' },
          { status: 404 }
        )
      }

      usuarioData = usuarioPorEmail
      console.log('✅ [VERIFICAR-ADMIN] Usuário encontrado por email:', usuarioPorEmail)
    } else {
      console.log('✅ [VERIFICAR-ADMIN] Usuário encontrado por ID:', usuarioData)
    }

    // Verificar o valor de is_super_admin
    const isSuperAdmin = usuarioData.is_super_admin === true || usuarioData.is_super_admin === 'true' || usuarioData.is_super_admin === 1
    
    console.log('📊 [VERIFICAR-ADMIN] Valor is_super_admin:', usuarioData.is_super_admin, 'Tipo:', typeof usuarioData.is_super_admin, 'Resultado:', isSuperAdmin)

    return NextResponse.json({
      is_super_admin: isSuperAdmin,
      id_usuarios: usuarioData.id_usuarios,
      email: usuarioData.email,
      nome: usuarioData.nome
    })
  } catch (error: any) {
    console.error('Erro na API de verificar admin:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
