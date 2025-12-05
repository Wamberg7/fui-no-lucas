import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Rotas públicas que não precisam de autenticação
  const publicRoutes = ['/auth', '/api/auth']
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
  
  // Rota de admin login é pública
  if (pathname.startsWith('/auth/admin')) {
    return NextResponse.next()
  }

  // Se for rota pública, permitir acesso SEMPRE (sem verificar token)
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Verificar token apenas para rotas protegidas
  const token = request.cookies.get('token')?.value ||
                request.headers.get('authorization')?.replace('Bearer ', '')

  // Se não tiver token e não for rota pública, redirecionar para login
  if (!token && !isPublicRoute) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Proteger rota /admin - apenas super admins podem acessar
  // A verificação completa será feita no lado do cliente e servidor
  // Aqui apenas redirecionamos se não tiver token
  if (pathname.startsWith('/admin') && !token) {
    const loginUrl = new URL('/auth/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}

