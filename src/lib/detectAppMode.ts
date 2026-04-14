/**
 * Detecta o modo da aplicação baseado no pathname
 * Suporta: /admin, /client, ou raiz (padrão client)
 */
export function detectAppMode(): 'admin' | 'client' {
  const pathname = window.location.pathname

  if (pathname.startsWith('/admin')) {
    return 'admin'
  }

  if (pathname.startsWith('/client')) {
    return 'client'
  }

  // Default para client
  return 'client'
}

/**
 * Adiciona global para acesso em qualquer lugar
 */
declare global {
  interface Window {
    __APP_MODE__: 'admin' | 'client'
  }
}

// Inicializa a variável global
window.__APP_MODE__ = detectAppMode()

export default detectAppMode
