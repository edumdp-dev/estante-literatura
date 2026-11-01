import { Calendar, Layers, ListChecks, Map, MapPin, Quote, ScrollText } from 'lucide-react'
import { Reveal } from '../components/ui'
import { Link } from 'react-router-dom'
import { BOOKS, FLASHCARDS, QUESTIONS, countBy } from '../data/books'

const Q = countBy(QUESTIONS)
const F = countBy(FLASHCARDS)

export default function Books() {
  return (
    <div className="flex flex-col gap-16">
      <header className="rise flex max-w-2xl flex-col gap-2">
        <p className="text-sm text-soft">Livros</p>
        <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">As quatro obras da prova</h1>
      </header>

      {BOOKS.map((b, i) => (
        <section key={b.id} id={b.id} className="scroll-mt-24">
          <Reveal delay={i === 0 ? 0.1 : 0}>
          <div className="relative overflow-hidden rounded-3xl border border-line bg-card">
            <div className="relative h-40 sm:h-56">
              <img src={b.art} alt={`Ilustração gerada para ${b.title}`} loading="lazy" className="absolute inset-0 size-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
            </div>

            <div className="relative -mt-24 grid gap-8 px-5 pb-7 sm:-mt-28 sm:px-8 md:grid-cols-[180px_1fr]">
              <div className="flex items-end gap-5 md:flex-col md:items-stretch md:gap-4">
                <img
                  src={b.cover}
                  alt={`Capa de ${b.title}`}
                  loading="lazy"
                  className="w-28 shrink-0 rounded-lg shadow-[0_18px_40px_-12px_rgba(0,0,0,0.45)] ring-1 ring-black/10 md:w-full"
                />
                <dl className="flex flex-col gap-2 text-sm text-soft">
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4" /> <dd>{b.year}</dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="size-4" /> <dd>{b.origin}</dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <ScrollText className="size-4" /> <dd>{b.scope}</dd>
                  </div>
                </dl>
              </div>

              <div className="flex flex-col gap-5 md:pt-28">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium uppercase tracking-[0.14em]" style={{ color: b.accent }}>
                    {b.movement}
                  </span>
                  <h2 className="mt-2 font-serif text-3xl tracking-tight sm:text-4xl">{b.title}</h2>
                  <p className="text-soft">{b.author}</p>
                </div>

                <p className="flex gap-2 font-serif text-lg italic leading-snug">
                  <Quote className="mt-1 size-4 shrink-0" style={{ color: b.accent }} />
                  {b.logline}
                </p>

                <ul className="flex flex-col gap-2.5">
                  {b.bullets.map((t) => (
                    <li key={t} className="flex gap-3 text-[15px] leading-relaxed">
                      <span className="mt-[9px] size-1.5 shrink-0 rounded-full" style={{ background: b.accent }} />
                      {t}
                    </li>
                  ))}
                </ul>

                <dl className="flex flex-col gap-2 border-t border-line pt-4 sm:flex-row sm:gap-4">
                  <dt className="shrink-0 text-xs font-medium uppercase tracking-[0.14em] text-soft sm:pt-0.5">Conceitos</dt>
                  <dd className="text-sm leading-relaxed">
                    {b.concepts.map((c, j) => (
                      <span key={c}>
                        {j > 0 && <span className="px-2 text-soft/50">/</span>}
                        {c}
                      </span>
                    ))}
                  </dd>
                </dl>

                <div className="flex flex-wrap gap-2 pt-1">
                  <Link to={`/quiz?livro=${b.id}`} className="inline-flex h-10 items-center gap-2 rounded-full bg-ink px-4 text-sm font-medium text-paper hover:opacity-90">
                    <ListChecks className="size-4" /> Quiz · {Q[b.id]} questões
                  </Link>
                  <Link to={`/flashcards?livro=${b.id}`} className="inline-flex h-10 items-center gap-2 rounded-full border border-line px-4 text-sm hover:bg-wash">
                    <Layers className="size-4" /> {F[b.id]} flashcards
                  </Link>
                  {b.extra && (
                    <a href={b.extra.href} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-full border border-line px-4 text-sm hover:bg-wash">
                      <Map className="size-4" /> {b.extra.label}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
          </Reveal>
        </section>
      ))}
    </div>
  )
}
