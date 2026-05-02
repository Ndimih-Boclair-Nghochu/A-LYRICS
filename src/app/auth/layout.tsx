import type { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'radial-gradient(ellipse at 20% 20%, rgba(155,93,229,0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(0,210,255,0.1) 0%, transparent 50%), #0A0A1A',
      }}
    >
      {children}
    </div>
  )
}
