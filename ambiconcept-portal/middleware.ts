import { NextRequest, NextResponse } from 'next/server'

/**
 * Middleware — apenas normalização de rotas.
 *
 * O Firebase Auth é client-side, por isso a verificação de sessão
 * é feita nos layouts React (AuthProvider), não aqui.
 *
 * O middleware NÃO verifica autenticação porque:
 * - Não existe nenhum mecanismo que defina cookies de sessão server-side
 * - Firebase Auth corre no browser via onAuthStateChanged
 * - A proteção de rotas está nos layouts: app/dashboard/layout.tsx e app/admin/layout.tsx
 *
 * Se no futuro quisermos auth server-side, implementar Firebase Session Cookies:
 * https://firebase.google.com/docs/auth/admin/manage-sessions
 */
export function middleware(request: NextRequest) {
  // Apenas deixa passar — proteção de rotas nos layouts client-side
  return NextResponse.next()
}

export const config = {
  // Só corre em rotas de página (exclui static assets, _next, api, etc.)
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}
