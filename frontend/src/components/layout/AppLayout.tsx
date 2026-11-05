import { Outlet } from 'react-router-dom'
import { TopNav } from './TopNav'

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-[#0b0f14] text-[#e8f5ef]">
      <TopNav />
      <main className="max-w-[1400px] mx-auto px-4 md:px-8 py-8">
        <Outlet />
      </main>
    </div>
  )
}
