import {
  ArrowLeft,
  BookMarked,
  CalendarDays,
  Clock3,
  Download,
  Eye,
  FileImage,
  FileText,
  Layers,
  ListChecks,
  MapPin,
  Mic,
  Scissors,
  Theater,
  UserRound,
  type LucideIcon,
} from 'lucide-react'
import { motion } from 'motion/react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Reveal } from '../components/ui'
import { BOOK, BOOKS, FLASHCARDS, QUESTIONS, countBy, type BookId, type FactIcon } from '../data/books'

const ICON: Record<FactIcon, LucideIcon> = {
  year: CalendarDays,
  place: MapPin,
  genre: BookMarked,
  narrator: Mic,
  hero: UserRound,
  setting: Theater,
  time: Clock3,
  scope: Scissors,
}
const KIND_ICON = { pdf: FileText, image: FileImage, text: FileText }
const Q = countBy(QUESTIONS)
const F = countBy(FLASHCARDS)

export default function BookDetail() {
  const { id } = useParams()
  const b = id && id in BOOK ? BOOK[id as BookId] : null
  if (!b) return <Navigate to="/livros" replace />
  const others = BOOKS.filter((x) => x.id !== b.id)

  return (
    <div className="flex flex-col gap-14">
      <Link to="/livros" className="inline-flex w-fit items-center gap-1.5 text-sm text-soft hover:text-ink">
        <ArrowLeft className="size-4" /> Livros
      </Link>

      <section className="grid items-end gap-8 md:grid-cols-[auto_1fr] md:gap-12">
        <motion.img
          key={b.id}
          src={b.cover}
          alt={`Capa de ${b.title}`}
          initial={{ opacity: 0, y: 24, rotate: -4 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 120, damping: 16 }}
          className="w-40 rounded-lg shadow-[0_30px_60px_-24px_rgba(0,0,0,0.55)] ring-1 ring-black/10 sm:w-56"
        />
        <div className="rise flex flex-col gap-4">
          <p className="text-xs font-medium uppercase tracking-[0.14em]" style={{ color: b.accent }}>
            {b.movement}
          </p>
          <h1 className="font-serif text-5xl leading-[1.02] tracking-tight sm:text-6xl">{b.title}</h1>
          <p className="text-lg text-soft">{b.author}</p>
          <p className="max-w-2xl font-serif text-xl italic leading-snug">{b.logline}</p>
          <div className="flex flex-wrap gap-2 pt-2">
            <Link to={`/quiz?livro=${b.id}`} className="inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-medium text-paper hover:opacity-90">
              <ListChecks className="size-4" /> Quiz · {Q[b.id]} questões
            </Link>
            <Link to={`/flashcards?livro=${b.id}`} className="inline-flex h-11 items-center gap-2 rounded-full border border-line px-5 text-sm hover:bg-wash">
              <Layers className="size-4" /> {F[b.id]} flashcards
            </Link>
          </div>
        </div>
      </section>

      <Reveal>
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-line ring-1 ring-line lg:grid-cols-4">
          {b.facts.map(({ icon, label, value }) => {
            const Icon = ICON[icon]
            return (
              <div key={label} className="flex flex-col gap-2 bg-card p-5">
                <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-soft">
                  <Icon className="size-4" strokeWidth={1.75} style={{ color: b.accent }} /> {label}
                </dt>
                <dd className="text-[15px] leading-snug">{value}</dd>
              </div>
            )
          })}
        </dl>
      </Reveal>

      <Reveal className="grid gap-8 lg:grid-cols-[180px_1fr] lg:gap-16">
        <h2 className="font-serif text-3xl tracking-tight">Resumo</h2>
        <ul className="grid gap-x-10 gap-y-5 md:grid-cols-2">
          {b.bullets.map((t, i) => (
            <li key={t} className="flex gap-4 leading-relaxed">
              <span className="font-serif text-xl leading-none tabular-nums" style={{ color: b.accent }}>
                {i + 1}
              </span>
              {t}
            </li>
          ))}
        </ul>
      </Reveal>

      <Reveal className="grid gap-4 lg:grid-cols-[180px_1fr] lg:gap-16">
        <h2 className="font-serif text-3xl tracking-tight">Conceitos</h2>
        <div className="min-w-0">
          <p className="overflow-x-auto whitespace-nowrap pb-1 text-[15px] [scrollbar-width:none]">
            {b.concepts.map((c, j) => (
              <span key={c}>
                {j > 0 && <span className="px-1.5 text-soft/40">/</span>}
                {c}
              </span>
            ))}
          </p>
        </div>
      </Reveal>

      {b.materials.length > 0 && (
        <Reveal className="grid gap-6 lg:grid-cols-[180px_1fr] lg:gap-16">
          <div className="flex flex-col gap-1">
            <h2 className="font-serif text-3xl tracking-tight">Materiais</h2>
            <p className="text-sm text-soft">Enviados pela professora.</p>
          </div>
          <ul className="grid gap-3 md:grid-cols-2">
            {b.materials.map((m) => {
              const Icon = KIND_ICON[m.kind]
              const file = m.href.split('/').pop()!
              return (
                <li key={m.href} className="flex items-center gap-4 rounded-2xl bg-card p-4 ring-1 ring-line">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-wash">
                    <Icon className="size-5" strokeWidth={1.75} style={{ color: b.accent }} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-medium">{m.label}</span>
                    <span className="block text-xs uppercase text-soft">{file.split('.').pop()}</span>
                  </span>
                  <a href={m.href} target="_blank" rel="noreferrer" aria-label={`Visualizar ${m.label}`} title="Visualizar" className="inline-flex size-10 items-center justify-center rounded-full text-soft hover:bg-wash hover:text-ink">
                    <Eye className="size-[18px]" />
                  </a>
                  <a href={m.href} download={file} aria-label={`Baixar ${m.label}`} title="Baixar" className="inline-flex size-10 items-center justify-center rounded-full text-soft hover:bg-wash hover:text-ink">
                    <Download className="size-[18px]" />
                  </a>
                </li>
              )
            })}
          </ul>
        </Reveal>
      )}

      <Reveal className="grid gap-4 border-t border-line pt-10 sm:grid-cols-3">
        {others.map((o) => (
          <Link key={o.id} to={`/livros/${o.id}`} className="group flex items-center gap-4">
            <img src={o.cover} alt="" className="h-20 w-14 rounded-[4px] object-cover shadow-md transition group-hover:-translate-y-1 group-hover:-rotate-2" />
            <span>
              <span className="block font-serif text-xl leading-tight">{o.title}</span>
              <span className="text-sm text-soft">{o.author}</span>
            </span>
          </Link>
        ))}
      </Reveal>
    </div>
  )
}
