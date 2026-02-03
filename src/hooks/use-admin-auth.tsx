import { useAuth } from './use-auth'

/**
 * Hook para autenticação de administrador
 * Funciona como um wrapper do useAuth com validação de role 'owner'
 */
export function useAdminAuth() {
  const auth = useAuth()

  // Verifica se o usuário atual é um administrador (owner)
  const isAdmin = auth.userRole === 'owner'

  return {
    ...auth,
    isAdmin,
  }
}
