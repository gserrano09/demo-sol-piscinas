import { PublicNav } from '@/components/landing/public-nav'
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <PublicNav />
      <main>{children}</main>
    </div>
  )
}
