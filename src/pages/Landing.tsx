import { ArrowRight, ArrowUpRight, BookOpen, Check, Layers, ListChecks, X } from 'lucide-react'
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue } from 'motion/react'
import { useEffect, useState, type PointerEvent } from 'react'
import { Link } from 'react-router-dom'
import { BookTag, Reveal } from '../components/ui'
import { BOOK, BOOKS, FLASHCARDS, QUESTIONS, type Book } from '../data/books'

const LETTERS = ['A', 'B', 'C', 'D', 'E']
const EASE = [0.2, 0.7, 0.2, 1] as const

const FAN = [
  { rotate: -13, x: -150, y: 34, depth: 18 },
  { rotate: -4.5, x: -52, y: 6, depth: 30 },
  { rotate: 4.5, x: 52, y: 10, depth: 26 },
  { rotate: 13, x: 150, y: 38, depth: 14 },
]

function HeroTitle() {
  const words = ['estou', 'procurando,', 'estou', 'procurando.']
  return (
    <h1 className="font-serif text-[clamp(2.7rem,7vw,5.4rem)] leading-[1] tracking-[-0.025em]">
      <span className="mb-4 flex justify-center gap-2.5 sm:gap-3.5" aria-hidden>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <motion.span
            key={i}
            className="block h-[3px] w-6 origin-left rounded-full bg-soft/50 sm:w-9"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.15 + i * 0.09, duration: 0.35, ease: EASE }}
          />
        ))}
      </span>
      <span className="sr-only">— — — — — — estou procurando, estou procurando.</span>
      <span aria-hidden className="block">
        {[words.slice(0, 2), words.slice(2)].map((line, l) => (
          <span key={l} className="block">
            {line.map((w, j) => {
              const i = l * 2 + j
              return (
                <motion.span
                  key={i}
                  className={`inline-block ${l === 0 ? 'italic' : ''} ${j === 0 ? 'mr-[0.25em]' : ''}`}
                  initial={{ opacity: 0, y: 28, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ delay: 0.75 + i * 0.14, duration: 0.8, ease: EASE }}
                >
                  {w}
                </motion.span>
              )
            })}
          </span>
        ))}
      </span>
    </h1>
  )
}

function FanCover({ b, i, px, py, hover, setHover, entered }: { b: Book; i: number; px: MotionValue<number>; py: MotionValue<number>; hover: number | null; setHover: (n: number | null) => void; entered: boolean }) {
  const f = FAN[i]
  const reduce = useReducedMotion()
  const x = useTransform(px, (v) => f.x + v * f.depth)
  const y = useTransform(py, (v) => v * f.depth * 0.6)
  const lifted = hover === i
  return (
    <motion.div className="absolute left-1/2 top-1/2" style={{ x, y, zIndex: lifted ? 10 : i }}>
      <motion.div
        initial={{ opacity: 0, y: 220, rotate: 0 }}
        animate={{ opacity: 1, y: lifted ? f.y - 34 : f.y, rotate: lifted ? 0 : f.rotate, scale: lifted ? 1.07 : 1 }}
        transition={{ delay: entered ? 0 : 1.2 + i * 0.12, type: 'spring', stiffness: 140, damping: 18 }}
        className="-translate-x-1/2 -translate-y-1/2"
      >
        <motion.div animate={reduce ? undefined : { y: [0, -7, 0] }} transition={{ duration: 5 + i * 0.7, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}>
          <Link
            to={`/livros#${b.id}`}
            onPointerEnter={() => setHover(i)}
            onFocus={() => setHover(i)}
            onBlur={() => setHover(null)}
            aria-label={b.title}
            className="block w-[112px] overflow-hidden rounded-[6px] ring-1 ring-black/10 transition-shadow duration-500 sm:w-[164px]"
            style={{ boxShadow: lifted ? '0 40px 70px -24px rgba(0,0,0,.6)' : '0 22px 44px -22px rgba(0,0,0,.5)' }}
          >
            <img src={b.cover} alt={`Capa de ${b.title}`} className="block aspect-[2/3] w-full object-cover" draggable={false} />
          </Link>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

function CoverFan() {
  const [hover, setHover] = useState<number | null>(null)
  const [entered, setEntered] = useState(false)
  useEffect(() => {
    const id = setTimeout(() => setEntered(true), 2200)
    return () => clearTimeout(id)
  }, [])
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const px = useSpring(rawX, { stiffness: 60, damping: 15 })
  const py = useSpring(rawY, { stiffness: 60, damping: 15 })
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    rawX.set((e.clientX - r.left) / r.width - 0.5)
    rawY.set((e.clientY - r.top) / r.height - 0.5)
  }
  const active = hover === null ? null : BOOKS[hover]
  return (
    <div
      className="relative mx-auto h-[220px] w-full max-w-[640px] touch-pan-y sm:h-[340px]"
      onPointerMove={onMove}
      onPointerLeave={() => (setHover(null), rawX.set(0), rawY.set(0))}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[120%] w-[90%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25 blur-3xl dark:opacity-30"
        style={{ background: 'conic-gradient(from 0deg, var(--color-gh), var(--color-visao), var(--color-almas), var(--color-ateneu), var(--color-gh))' }}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 0.28, scale: 1, rotate: 360 }}
        transition={{ opacity: { delay: 1.3, duration: 1.2 }, scale: { delay: 1.3, duration: 1.2 }, rotate: { duration: 40, repeat: Infinity, ease: 'linear' } }}
      />
      <div className="absolute inset-0 scale-[0.72] sm:scale-100">
        {BOOKS.map((b, i) => (
          <FanCover key={b.id} b={b} i={i} px={px} py={py} hover={hover} setHover={setHover} entered={entered} />
        ))}
      </div>
      <div className="absolute inset-x-0 -bottom-2 flex h-5 justify-center text-sm">
        {active && (
          <motion.p key={active.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="text-soft">
            <span className="text-ink">{active.title}</span> · {active.author}, {active.year}
          </motion.p>
        )}
      </div>
    </div>
  )
}

function SampleQuestion() {
  const q = QUESTIONS.find((x) => x.id === 'gh-04') ?? QUESTIONS[0]
  const [chosen, setChosen] = useState<number | null>(null)
  const b = BOOK[q.book]
  return (
    <div className="grid overflow-hidden rounded-3xl border border-line bg-card lg:grid-cols-[1fr_1.15fr]">
      <div className="flex flex-col gap-5 border-b border-line p-6 sm:p-8 lg:border-b-0 lg:border-r">
        <div className="flex flex-wrap items-center gap-2">
          <BookTag id={q.book} />
          <span className="text-xs text-soft">· {q.topic}</span>
        </div>
        <blockquote className="border-l-2 pl-4 font-serif text-xl leading-relaxed sm:text-[22px]" style={{ borderColor: b.accent }}>
          {q.context} <span className="whitespace-nowrap font-sans text-sm text-soft">({q.page})</span>
        </blockquote>
        <p className="font-medium leading-snug">{q.stem}…</p>
      </div>
      <div className="flex flex-col gap-2 p-4 sm:p-6">
        {q.options.map((o, i) => {
          const right = i === q.answer
          const show = chosen !== null
          return (
            <motion.button
              key={i}
              disabled={show}
              onClick={() => setChosen(i)}
              whileTap={{ scale: 0.985 }}
              animate={show && chosen === i && !right ? { x: [0, -6, 6, -3, 0] } : undefined}
              className={`flex items-start gap-3 rounded-xl border p-3 text-left text-sm leading-relaxed transition-colors ${
                show && right ? 'border-emerald-500/70 bg-emerald-500/10' : show && chosen === i ? 'border-red-500/70 bg-red-500/10' : 'border-transparent hover:border-line hover:bg-wash/60'
              } ${show && !right && chosen !== i ? 'opacity-45' : ''}`}
            >
              <span className="mt-px flex size-6 shrink-0 items-center justify-center rounded-full border border-line text-[11px] font-semibold">
                {show && right ? <Check className="size-3.5 text-emerald-600" strokeWidth={3} /> : show && chosen === i ? <X className="size-3.5 text-red-600" strokeWidth={3} /> : LETTERS[i]}
              </span>
              {o}
            </motion.button>
          )
        })}
        {chosen !== null && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-2 flex flex-col gap-3 rounded-xl bg-wash p-4 text-sm leading-relaxed">
            <p className="text-soft">{q.explanation}</p>
            <Link to="/quiz" className="inline-flex items-center gap-1.5 font-medium">
              Fazer o quiz completo <ArrowRight className="size-4" />
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  )
}

const TOOLS = [
  { to: '/quiz', icon: ListChecks, title: 'Quiz', text: 'Um livro, vários ou a prova misturada. Com tempo e quantidade.' },
  { to: '/flashcards', icon: Layers, title: 'Flashcards', text: 'Conceitos e personagens. Marque o que já sabe.' },
  { to: '/livros', icon: BookOpen, title: 'Livros', text: 'Cada obra em seis tópicos e seus conceitos-chave.' },
]

export default function Landing() {
  return (
    <div className="flex flex-col gap-24 sm:gap-32">
      <section className="flex flex-col items-center gap-7 pt-2 text-center sm:pt-6">
        <HeroTitle />
        <motion.p
          className="max-w-md text-balance text-lg text-soft"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.6, ease: EASE }}
        >
          {QUESTIONS.length} questões no formato da prova e {FLASHCARDS.length} flashcards das quatro obras.
        </motion.p>
        <motion.div
          className="flex flex-wrap justify-center gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.55, duration: 0.6, ease: EASE }}
        >
          <Link to="/quiz" className="group inline-flex h-12 items-center gap-2 rounded-full bg-ink px-6 font-medium text-paper transition hover:opacity-90">
            Começar o quiz <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
          </Link>
          <Link to="/flashcards" className="inline-flex h-12 items-center gap-2 rounded-full px-5 font-medium text-soft transition hover:bg-wash hover:text-ink">
            Flashcards
          </Link>
        </motion.div>
        <div className="w-full sm:mt-2">
          <CoverFan />
        </div>
      </section>

      <Reveal className="flex flex-col gap-6">
        <h2 className="font-serif text-3xl tracking-tight sm:text-4xl">Teste uma questão</h2>
        <SampleQuestion />
      </Reveal>

      <Reveal className="grid divide-y divide-line border-y border-line md:grid-cols-3 md:divide-x md:divide-y-0">
        {TOOLS.map(({ to, icon: Icon, title, text }) => (
          <Link key={to} to={to} className="group flex items-start gap-4 py-6 transition md:px-6 md:first:pl-0 md:last:pr-0">
            <Icon className="mt-0.5 size-5 shrink-0 text-soft transition group-hover:text-ink" strokeWidth={1.75} />
            <div className="flex flex-col gap-1">
              <h3 className="flex items-center gap-1.5 font-medium">
                {title}
                <ArrowUpRight className="size-4 text-soft opacity-0 transition group-hover:opacity-100" />
              </h3>
              <p className="text-[15px] leading-relaxed text-soft">{text}</p>
            </div>
          </Link>
        ))}
      </Reveal>

      <section className="grid gap-4 sm:grid-cols-2">
        {BOOKS.map((b, i) => (
          <Reveal key={b.id} delay={(i % 2) * 0.08}>
            <Link to={`/livros#${b.id}`} className="group relative block overflow-hidden rounded-3xl">
              <img src={b.art} alt={`Ilustração de ${b.title}`} loading="lazy" className="aspect-[4/3] w-full object-cover transition duration-[1.2s] ease-out group-hover:scale-[1.04] sm:aspect-[3/2]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end gap-3 p-5 text-white">
                <img src={b.cover} alt="" className="h-16 w-11 rounded-[4px] object-cover shadow-lg ring-1 ring-white/20" />
                <div className="min-w-0">
                  <p className="font-serif text-2xl leading-tight">{b.title}</p>
                  <p className="text-sm text-white/70">{b.author}</p>
                </div>
              </div>
            </Link>
          </Reveal>
        ))}
      </section>
    </div>
  )
}
