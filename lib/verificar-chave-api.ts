import { supabase } from './supabase'

/**
 * Verifica se uma chave API é válida e retorna o usuário associado
 * @param chaveAPI - A chave API a ser verificada
 * @returns O ID do usuário se a chave for válida, null caso contrário
 */
export async function verificarChaveAPI(chaveAPI: string): Promise<number | null> {
  try {
    if (!chaveAPI || !chaveAPI.startsWith('sk_live_')) {
      return null
    }

    const { data: chave, error } = await supabase
      .from('chaves_api')
      .select('usuarios_id_usuarios, ativa, data_expiracao')
      .eq('chave_api', chaveAPI)
      .eq('ativa', true)
      .maybeSingle()

    if (error || !chave) {
      return null
    }

    // Verificar se a chave não expirou
    if (chave.data_expiracao) {
      const agora = new Date()
      const expiracao = new Date(chave.data_expiracao)
      if (agora > expiracao) {
        return null
      }
    }

    // Atualizar último uso
    await supabase
      .from('chaves_api')
      .update({ ultimo_uso: new Date().toISOString() })
      .eq('chave_api', chaveAPI)

    return chave.usuarios_id_usuarios
  } catch (error) {
    console.error('Erro ao verificar chave API:', error)
    return null
  }
}

