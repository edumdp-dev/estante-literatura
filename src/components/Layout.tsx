import { BookOpen, Layers, ListChecks, Menu, Moon, Sun, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState, type ReactNode } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { BOOKS } from '../data/books'
import { useTheme } from '../lib/theme'

const NAV = [
  { to: '/livros', label: 'Livros', icon: BookOpen },
  { to: '/quiz', label: 'Quiz', icon: ListChecks },
  { to: '/flashcards', label: 'Flashcards', icon: Layers },
]

function ThemeButton() {
  const { theme, toggle } = useTheme()
  const dark = theme === 'dark'
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Ativar modo claro' : 'Ativar modo escuro'}
      className="relative inline-flex size-9 items-center justify-center overflow-hidden rounded-full text-soft transition hover:bg-wash hover:text-ink"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ y: 14, rotate: -60, opacity: 0 }}
          animate={{ y: 0, rotate: 0, opacity: 1 }}
          exit={{ y: -14, rotate: 60, opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="flex"
        >
          {dark ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="Estante — início">
      <span className="flex h-6 items-end gap-[3px]" aria-hidden>
        {BOOKS.map((b, i) => (
          <span
            key={b.id}
            className="w-[4px] rounded-[1.5px]"
            style={{ background: b.accent, height: `${[20, 17, 22, 18][i]}px`, rotate: i === 3 ? '12deg' : undefined, transformOrigin: 'bottom' }}
          />
        ))}
      </span>
      <span className="font-serif text-[21px] italic leading-none tracking-tight">Estante</span>
    </Link>
  )
}

function Drawer({ onClose }: { onClose: () => void }) {
  return (
    <motion.div className="fixed inset-0 z-50 md:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <button aria-label="Fechar menu" className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <motion.aside
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        exit={{ x: '-100%' }}
        transition={{ type: 'spring', stiffness: 380, damping: 38 }}
        className="absolute inset-y-0 left-0 flex w-72 flex-col gap-8 border-r border-line bg-paper px-5 py-5"
      >
        <div className="flex items-center justify-between">
          <Brand />
          <button aria-label="Fechar menu" onClick={onClose} className="inline-flex size-9 items-center justify-center rounded-full text-soft hover:bg-wash">
            <X className="size-5" />
          </button>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <div key={to}>
              <NavLink
                to={to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] transition ${isActive ? 'bg-wash font-medium text-ink' : 'text-soft hover:text-ink'}`
                }
              >
                <Icon className="size-[18px]" strokeWidth={1.75} />
                {label}
              </NavLink>
              {to === '/livros' && (
                <div className="ml-[21px] mt-1 flex flex-col border-l border-line pl-3">
                  {BOOKS.map((b) => (
                    <Link key={b.id} to={`/livros/${b.id}`} onClick={onClose} className="flex items-center gap-2.5 py-1.5 text-sm text-soft hover:text-ink">
                      <img src={b.cover} alt="" className="h-6 w-4 rounded-[2px] object-cover" />
                      <span className="truncate">{b.title}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </motion.aside>
    </motion.div>
  )
}

export function Layout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' })
    else window.scrollTo(0, 0)
  }, [pathname, hash])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-dvh">
      <AnimatePresence>{open && <Drawer onClose={() => setOpen(false)} />}</AnimatePresence>

      <header
        className={`sticky top-0 z-40 transition-[background-color,border-color,backdrop-filter] duration-300 ${
          scrolled ? 'border-b border-line bg-paper/75 backdrop-blur-xl' : 'border-b border-transparent'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4 sm:px-8">
          <button aria-label="Abrir menu" onClick={() => setOpen(true)} className="-ml-2 inline-flex size-9 items-center justify-center rounded-full text-soft hover:bg-wash md:hidden">
            <Menu className="size-5" />
          </button>
          <Brand />
          <nav className="ml-10 hidden items-center gap-1 md:flex">
            {NAV.map(({ to, label }) => (
              <NavLink key={to} to={to} className="relative px-3 py-2 text-sm">
                {({ isActive }) => (
                  <>
                    <span className={isActive ? 'text-ink' : 'text-soft transition hover:text-ink'}>{label}</span>
                    {isActive && <motion.span layoutId="nav-underline" className="absolute inset-x-3 -bottom-[13px] h-[2px] rounded-full bg-ink" />}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto">
            <ThemeButton />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-6 sm:px-8 sm:pt-10">{children}</main>
    </div>
  )
}
