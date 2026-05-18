import type { Metadata } from 'next'
// @ts-ignore
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title:       { default: 'Ambiconcept Platform', template: '%s · Ambiconcept' },
  description: 'Plataforma de recursos digitais Ambiconcept Waste Solutions',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <body className="bg-white text-brand-900 antialiased">
        <AuthProvider>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                fontFamily: 'Poppins, sans-serif',
                fontSize: '13px',
                borderRadius: '10px',
                background: '#273545',
                color: '#fff',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}