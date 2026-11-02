import { ArrowRight, ArrowUpRight, BookOpen, Check, Layers, ListChecks, RotateCcw } from 'lucide-react'
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue } from 'motion/react'
import { useEffect, useState, type PointerEvent } from 'react'
import { Link } from 'react-router-dom'
import { BookCard } from '../components/BookCard'
import { ActionButton, QuestionView } from '../components/QuestionView'
import { Reveal } from '../components/ui'
import { BOOKS, QUESTIONS, type Book } from '../data/books'

const EASE = [0.2, 0.7, 0.2, 1] as const

const FAN = [
  { rotate: -12, x: -210, y: 36, depth: 18 },
  { rotate: -4, x: -72, y: 6, depth: 30 },
  { rotate: 4, x: 72, y: 10, depth: 26 },
  { rotate: 12, x: 210, y: 40, depth: 14 },
]

function HeroTitle() {
  const words = ['estou', 'procurando,', 'estou', 'procurando.']
  return (
    <h1 className="font-serif text-[clamp(2.5rem,6vw,4.6rem)] leading-[1] tracking-[-0.025em]">
      <span className="mb-3 flex justify-center gap-2.5 sm:gap-3.5" aria-hidden>
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
            to={`/livros/${b.id}`}
            onPointerEnter={() => setHover(i)}
            onFocus={() => setHover(i)}
            onBlur={() => setHover(null)}
            aria-label={b.title}
            className="block w-[200px] overflow-hidden rounded-[6px] ring-1 ring-black/10 transition-shadow duration-500 lg:w-[204px]"
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
    <div className="flex w-full flex-col items-center gap-4">
      <div
        className="relative h-[230px] w-full max-w-[860px] touch-pan-y sm:h-[360px] lg:h-[380px]"
        onPointerMove={onMove}
        onPointerLeave={() => (setHover(null), rawX.set(0), rawY.set(0))}
      >
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[110%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
          style={{ background: 'conic-gradient(from 0deg, var(--color-gh), var(--color-visao), var(--color-almas), var(--color-ateneu), var(--color-gh))' }}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 0.26, scale: 1, rotate: 360 }}
          transition={{ opacity: { delay: 1.3, duration: 1.2 }, scale: { delay: 1.3, duration: 1.2 }, rotate: { duration: 40, repeat: Infinity, ease: 'linear' } }}
        />
        <div className="absolute inset-0 scale-[0.52] sm:scale-[0.85] lg:scale-100">
          {BOOKS.map((b, i) => (
            <FanCover key={b.id} b={b} i={i} px={px} py={py} hover={hover} setHover={setHover} entered={entered} />
          ))}
        </div>
      </div>
      <div className="flex h-5 items-center text-sm" aria-live="polite">
        {active && (
          <motion.p key={active.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="text-soft">
            <span className="text-ink">{active.title}</span> · {active.author}, {active.year}
          </motion.p>
        )}
      </div>
    </div>
  )
}

function ScrollCue() {
  const reduce = useReducedMotion()
  return (
    <motion.a
      href="#questao"
      aria-label="Rolar para a próxima seção"
      className="-mt-2 flex flex-col items-center gap-1 text-soft hover:text-ink"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2.2, duration: 0.6 }}
      onClick={(e) => (e.preventDefault(), document.getElementById('questao')?.scrollIntoView({ behavior: 'smooth' }))}
    >
      <span className="text-xs">Role para ver mais</span>
      <motion.svg width="22" height="30" viewBox="0 0 22 30" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" animate={reduce ? undefined : { y: [0, 6, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}>
        <motion.path d="M11 2v24" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 2.3, duration: 0.6 }} />
        <motion.path d="M4 19l7 7 7-7" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 2.7, duration: 0.4 }} />
      </motion.svg>
    </motion.a>
  )
}

function SampleQuestion() {
  const q = QUESTIONS.find((x) => x.id === 'gh-04') ?? QUESTIONS[0]
  const [selected, setSelected] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)
  return (
    <QuestionView
      q={q}
      order={[0, 1, 2, 3, 4]}
      selected={selected}
      revealed={revealed}
      onSelect={setSelected}
      footer={
        <div className="flex justify-end gap-2 pt-2">
          {revealed ? (
            <>
              <ActionButton variant="ghost" onClick={() => (setSelected(null), setRevealed(false))}>
                <RotateCcw className="size-4" /> Refazer
              </ActionButton>
              <Link to="/quiz" className="inline-flex h-11 w-40 items-center justify-center gap-2 rounded-full bg-ink text-sm font-medium text-paper transition hover:opacity-90">
                Fazer o quiz <ArrowRight className="size-4" />
              </Link>
            </>
          ) : (
            <ActionButton onClick={() => setRevealed(true)} disabled={selected === null}>
              <Check className="size-4" /> Confirmar
            </ActionButton>
          )}
        </div>
      }
    />
  )
}

const TOOLS = [
  { to: '/livros', icon: BookOpen, title: 'Resumo das obras', text: 'Enredo, narrador, espaço, tempo e conceitos de cada livro, com os materiais da professora.' },
  { to: '/quiz', icon: ListChecks, title: 'Quiz com resolução', text: '100 questões no formato da prova, cada uma com gabarito comentado.' },
  { to: '/flashcards', icon: Layers, title: 'Flashcards', text: 'Conceitos e personagens para revisar até decorar.' },
]

export default function Landing() {
  return (
    <div className="flex flex-col gap-24 sm:gap-32">
      <section className="flex min-h-[calc(100dvh-6rem)] flex-col items-center justify-between gap-5 text-center">
        <div className="flex flex-col items-center gap-5">
          <HeroTitle />
          <motion.p
            className="max-w-xl text-balance text-lg text-soft"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.6, ease: EASE }}
          >
            Estudo para a prova de português: resumo das quatro obras, quiz com resolução comentada e flashcards.
          </motion.p>
        </div>
        <CoverFan />
        <motion.div
          className="flex flex-wrap justify-center gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.9, duration: 0.6, ease: EASE }}
        >
          <Link to="/quiz" className="group inline-flex h-12 items-center gap-2 rounded-full bg-ink px-6 font-medium text-paper transition hover:opacity-90">
            Começar o quiz <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
          </Link>
          <Link to="/livros" className="inline-flex h-12 items-center gap-2 rounded-full px-5 font-medium text-soft transition hover:bg-wash hover:text-ink">
            Ler os resumos
          </Link>
        </motion.div>
        <ScrollCue />
      </section>

      <Reveal className="grid gap-10 md:grid-cols-3 md:gap-12">
        {TOOLS.map(({ to, icon: Icon, title, text }) => (
          <Link key={to} to={to} className="group flex flex-col gap-3">
            <Icon className="size-6 text-soft transition group-hover:text-ink" strokeWidth={1.5} />
            <h3 className="flex items-center gap-1.5 font-serif text-2xl">
              {title}
              <ArrowUpRight className="size-4 text-soft opacity-0 transition group-hover:opacity-100" />
            </h3>
            <p className="leading-relaxed text-soft">{text}</p>
          </Link>
        ))}
      </Reveal>

      <section id="questao" className="grid scroll-mt-24 gap-10 lg:grid-cols-[280px_1fr] lg:gap-16">
        <Reveal className="flex flex-col gap-3 lg:sticky lg:top-28 lg:self-start">
          <h2 className="font-serif text-4xl tracking-tight">Teste uma questão</h2>
          <p className="text-soft">Escolha uma alternativa e confirme para ver o gabarito.</p>
        </Reveal>
        <Reveal delay={0.05}>
          <SampleQuestion />
        </Reveal>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {BOOKS.map((b, i) => (
          <Reveal key={b.id} delay={(i % 2) * 0.08}>
            <BookCard b={b} />
          </Reveal>
        ))}
      </section>
    </div>
  )
}
