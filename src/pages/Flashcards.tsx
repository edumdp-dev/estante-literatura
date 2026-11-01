import { ArrowLeft, ArrowRight, Check, Library, RotateCcw, Shuffle, Undo2, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BookPicker, BookTag, Field, Segmented } from '../components/ui'
import { BOOK, BOOKS, FLASHCARDS, countBy, type BookId } from '../data/books'
import { shuffle } from '../lib/random'

const STORE = 'flashcards-known'
const CARD_COUNTS = countBy(FLASHCARDS)

function loadKnown(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORE) ?? '[]') as string[])
  } catch {
    return new Set()
  }
}

export default function Flashcards() {
  const [params] = useSearchParams()
  const preset = params.get('livro') as BookId | null
  const [books, setBooks] = useState<BookId[]>(preset && BOOK[preset] ? [preset] : BOOKS.map((b) => b.id))
  const [filter, setFilter] = useState<'all' | 'todo'>('all')
  const [known, setKnown] = useState(loadKnown)
  const [seed, setSeed] = useState(0)
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  useEffect(() => localStorage.setItem(STORE, JSON.stringify([...known])), [known])

  const deck = useMemo(() => {
    const base = FLASHCARDS.filter((c) => books.includes(c.book) && (filter === 'all' || !known.has(c.id)))
    return seed === 0 ? base : shuffle(base)
    // `known` is intentionally excluded: marking a card must not reshuffle the deck mid-session.
  }, [books, filter, seed])

  useEffect(() => {
    setIndex(0)
    setFlipped(false)
  }, [deck])

  const card = deck[Math.min(index, deck.length - 1)]
  const knownInDeck = deck.filter((c) => known.has(c.id)).length

  const go = (delta: number) => {
    setFlipped(false)
    setIndex((i) => Math.max(0, Math.min(deck.length - 1, i + delta)))
  }
  const mark = (isKnown: boolean) => {
    if (!card) return
    setKnown((k) => {
      const n = new Set(k)
      if (isKnown) n.add(card.id)
      else n.delete(card.id)
      return n
    })
    go(1)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ') (e.preventDefault(), setFlipped((f) => !f))
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const toggle = (id: BookId) => setBooks((b) => (b.includes(id) ? b.filter((x) => x !== id) : [...b, id]))
  const accent = card ? BOOK[card.book].accent : 'var(--ink)'

  return (
    <div className="rise mx-auto flex max-w-3xl flex-col gap-8">
      <header className="flex flex-col gap-2">
        <p className="text-sm text-soft">Flashcards</p>
        <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">Vire, lembre, marque</h1>
      </header>

      <Field label="Obras" icon={<Library className="size-4" />}>
        <BookPicker selected={books} onToggle={toggle} multi counts={CARD_COUNTS} unit="cartões" />
      </Field>

      <div className="flex flex-wrap items-center gap-2">
        <Segmented
          label="Filtro"
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: 'Todos' },
            { value: 'todo', label: 'Só os que não sei' },
          ]}
        />
        <button onClick={() => setSeed((s) => s + 1)} className="inline-flex h-9 items-center gap-2 rounded-full border border-line bg-card px-3.5 text-sm text-soft hover:text-ink">
          <Shuffle className="size-4" /> Embaralhar
        </button>
        {known.size > 0 && (
          <button onClick={() => setKnown(new Set())} className="inline-flex h-9 items-center gap-2 rounded-full border border-line bg-card px-3.5 text-sm text-soft hover:text-ink">
            <Undo2 className="size-4" /> Zerar progresso
          </button>
        )}
      </div>

      {!card ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-line p-12 text-center">
          <Check className="size-8 text-emerald-500" />
          <p className="font-serif text-2xl">{books.length === 0 ? 'Escolha pelo menos uma obra.' : 'Você marcou todos como “sei”.'}</p>
          {books.length > 0 && (
            <button onClick={() => setFilter('all')} className="text-sm text-soft underline underline-offset-4 hover:text-ink">
              Revisar todos de novo
            </button>
          )}
        </div>
      ) : (
        <section className="flex flex-col gap-5">
          <div className="flex items-center justify-between text-sm text-soft">
            <span className="tabular-nums">
              {index + 1} de {deck.length}
            </span>
            <span className="tabular-nums">
              {knownInDeck} marcados como “sei”
            </span>
          </div>

          <button
            type="button"
            onClick={() => setFlipped((f) => !f)}
            aria-label={flipped ? 'Mostrar pergunta' : 'Mostrar resposta'}
            className="flip block h-[360px] w-full text-left sm:h-[320px]"
          >
            <div className={`flip-inner relative h-full w-full ${flipped ? 'is-flipped' : ''}`}>
              <div className="flip-face absolute inset-0 flex flex-col overflow-hidden rounded-3xl border border-line bg-card p-7 sm:p-9">
                <span className="absolute inset-x-0 top-0 h-1" style={{ background: accent }} />
                <div className="flex items-center justify-between gap-3">
                  <BookTag id={card.book} />
                  <span className="rounded-full bg-wash px-2.5 py-1 text-xs text-soft">{card.tag}</span>
                </div>
                <p className="my-auto text-balance font-serif text-2xl leading-snug sm:text-[28px]">{card.front}</p>
                <p className="flex items-center gap-1.5 text-xs text-soft">
                  <RotateCcw className="size-3.5" /> Toque ou aperte espaço para virar
                </p>
              </div>
              <div className="flip-face flip-back absolute inset-0 flex flex-col overflow-hidden rounded-3xl p-7 text-white sm:p-9" style={{ background: accent }}>
                <div className="flex items-center justify-between gap-3 text-xs font-medium text-white/80">
                  <span>{BOOK[card.book].title}</span>
                  <span>{card.tag}</span>
                </div>
                <p className="my-auto overflow-y-auto text-[17px] leading-relaxed sm:text-lg">{card.back}</p>
              </div>
            </div>
          </button>

          <div className="flex items-center justify-between gap-3">
            <button aria-label="Anterior" onClick={() => go(-1)} disabled={index === 0} className="inline-flex size-11 items-center justify-center rounded-full border border-line text-soft hover:text-ink disabled:opacity-30">
              <ArrowLeft className="size-5" />
            </button>
            <div className="flex gap-2">
              <button onClick={() => mark(false)} className="inline-flex h-11 items-center gap-2 rounded-full border border-line bg-card px-5 text-sm font-medium hover:bg-wash">
                <X className="size-4 text-red-500" /> Não sei
              </button>
              <button onClick={() => mark(true)} className="inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-medium text-paper hover:opacity-90">
                <Check className="size-4" /> Sei
              </button>
            </div>
            <button aria-label="Próximo" onClick={() => go(1)} disabled={index >= deck.length - 1} className="inline-flex size-11 items-center justify-center rounded-full border border-line text-soft hover:text-ink disabled:opacity-30">
              <ArrowRight className="size-5" />
            </button>
          </div>
        </section>
      )}
    </div>
  )
}
