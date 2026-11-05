import { useEffect, useState, useRef } from 'react'
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Image as ImageIcon, Search,
  History as HistoryIcon, Settings, Users, LogOut,
  Menu, X, ChevronDown, Bell, Zap
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/stego/image', label: 'Hide', icon: ImageIcon },
  { to: '/stego/extract', label: 'Extract', icon: Search },
  { to: '/history', label: 'History', icon: HistoryIcon },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function TopNav() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const location = useLocation()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [health, setHealth] = useState<'online' | 'offline' | 'checking'>('checking')

  const userMenuRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMobileOpen(false); setUserMenuOpen(false); setNotifOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const base = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://127.0.0.1:8618'
    let cancelled = false
    const ping = async () => {
      try {
        const res = await fetch(`${base}/health`, { cache: 'no-store' })
        if (!cancelled) setHealth(res.ok ? 'online' : 'offline')
      } catch {
        if (!cancelled) setHealth('offline')
      }
    }
    ping()
    const id = setInterval(ping, 30000)
    return () => { cancelled = true; clearInterval(id) }
  }, [])

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false)
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  const handleLogout = () => {
    logout()
    localStorage.removeItem('sv_dev_mode')
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-50 bg-[#0B0F14]/80 backdrop-blur-xl border-b border-slate-800">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* 👇 YAHAN LOGO CHANGE HUA HAI 👇 */}
        <Link to="/dashboard" className="flex items-center gap-3 shrink-0 group">
          <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-black flex items-center justify-center border border-slate-700/50 shadow-[0_0_15px_rgba(16,185,129,0.15)] group-hover:scale-105 transition-transform duration-300">
            <img 
              src="/logo.png" 
              alt="StegaVault" 
              className="w-full h-full object-contain" 
              style={{ mixBlendMode: 'screen' }} 
            />
          </div>
          <div className="hidden sm:block leading-tight">
            <div className="font-bold text-lg text-white tracking-tight flex items-center gap-2">
              Stega<span className="text-[#10B981]">Vault</span>
              <span className="text-[9px] font-mono bg-[#10B981]/15 text-[#10B981] px-1.5 py-0.5 rounded border border-[#10B981]/30">PRO</span>
            </div>
            <div className="text-[10px] font-mono text-slate-400 tracking-wider uppercase">
              Secure Steganography
            </div>
          </div>
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden lg:flex items-center gap-1 bg-[#131920] border border-slate-800 p-1 rounded-xl">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'text-[#10B981] bg-[#10B981]/10 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`
              }
            >
              <item.icon size={15} />
              <span>{item.label}</span>
            </NavLink>
          ))}
          {user?.role === 'admin' && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isActive ? 'text-amber-400 bg-amber-500/10' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`
              }
            >
              <Users size={15} />
              <span>Admin</span>
            </NavLink>
          )}
        </nav>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-2 md:gap-3">
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#131920] border border-slate-800" title="API Health">
            <span className={`w-1.5 h-1.5 rounded-full ${
              health === 'online' ? 'bg-[#10B981] shadow-[0_0_6px_#10B981]' :
              health === 'offline' ? 'bg-red-500' : 'bg-amber-500 animate-pulse'
            }`} />
            <span className={`text-[10px] font-mono font-bold tracking-wider uppercase ${
              health === 'online' ? 'text-[#10B981]' : health === 'offline' ? 'text-red-400' : 'text-amber-400'
            }`}>
              {health === 'online' ? 'Online' : health === 'offline' ? 'Offline' : '...'}
            </span>
          </div>

          <div ref={notifRef} className="relative">
            <button onClick={() => setNotifOpen(!notifOpen)} className="relative p-2 rounded-lg bg-[#131920] border border-slate-800 text-slate-400 hover:text-white hover:border-[#10B981]/40 transition-all cursor-pointer">
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#10B981] shadow-[0_0_6px_#10B981]" />
            </button>
            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 rounded-xl bg-[#131920] border border-slate-800 shadow-2xl overflow-hidden z-50">
                <div className="p-3 border-b border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Notifications</span>
                  <span className="text-[10px] font-mono text-[#10B981] uppercase">1 New</span>
                </div>
                <div className="p-3 hover:bg-slate-800/50 transition-colors cursor-pointer">
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#10B981]/10 flex items-center justify-center text-[#10B981] shrink-0"><Zap size={12} /></div>
                    <div>
                      <p className="text-xs font-bold text-white">Welcome to StegaVault 4.0</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Your vault is secure. Start hiding secrets.</p>
                      <p className="text-[10px] font-mono text-slate-500 mt-1">Just now</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button onClick={handleLogout} className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold hover:bg-red-500/20 hover:text-red-300 transition-all cursor-pointer">
            <LogOut size={14} />
            <span>Logout</span>
          </button>

          <div ref={userMenuRef} className="relative">
            <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 pl-1.5 pr-2 py-1.5 rounded-lg bg-[#131920] border border-slate-800 hover:border-[#10B981]/40 transition-colors cursor-pointer">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#10B981]/30 to-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-center text-[#10B981] text-xs font-bold">
                {user?.username?.charAt(0).toUpperCase() ?? 'D'}
              </div>
              <div className="hidden md:block text-left leading-tight">
                <div className="text-xs font-bold text-white max-w-[100px] truncate">{user?.username ?? 'Dev User'}</div>
                <div className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">{user?.role ?? 'DEV'}</div>
              </div>
              <ChevronDown size={14} className={`text-slate-500 transition-transform hidden md:block ${userMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-60 rounded-xl bg-[#131920] border border-slate-800 shadow-2xl overflow-hidden z-50">
                <div className="p-4 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-center text-[#10B981] text-sm font-bold">
                      {user?.username?.charAt(0).toUpperCase() ?? 'D'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-white truncate">{user?.username ?? 'Dev User'}</div>
                      <div className="text-[10px] font-mono text-slate-500 truncate">{user?.email ?? 'dev@stegavault.local'}</div>
                    </div>
                  </div>
                </div>
                <div className="p-1">
                  <Link to="/settings" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"><Settings size={14} /> Settings</Link>
                  {user?.role === 'admin' && (
                    <Link to="/admin" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"><Users size={14} /> Admin Console</Link>
                  )}
                  <div className="my-1 border-t border-slate-800" />
                  <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"><LogOut size={14} /> Logout</button>
                </div>
              </div>
            )}
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 rounded-lg bg-[#131920] border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer">
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-[#0B0F14] px-4 py-4 space-y-1">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} onClick={() => setMobileOpen(false)} className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-[#10B981]/10 text-[#10B981]' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
              <item.icon size={16} /> {item.label}
            </NavLink>
          ))}
          {user?.role === 'admin' && (
            <NavLink to="/admin" onClick={() => setMobileOpen(false)} className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-amber-500/10 text-amber-400' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
              <Users size={16} /> Admin
            </NavLink>
          )}
          <div className="pt-3 mt-3 border-t border-slate-800">
            <button onClick={() => { setMobileOpen(false); handleLogout() }} className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-bold cursor-pointer">
              <LogOut size={15} /> Logout
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
