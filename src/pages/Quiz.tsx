import { ArrowRight, Check, ChevronDown, Clock, Library, RotateCcw, Shuffle, SkipForward, Target, Timer, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ActionButton, LETTERS, QuestionView } from '../components/QuestionView'
import { BookPicker, BookTag, Segmented, Slider, Switch } from '../components/ui'
import { BOOK, BOOKS, QUESTIONS, countBy, type BookId, type Question } from '../data/books'
import { balancedPick, shuffle } from '../lib/random'

type Mode = 'one' | 'multi' | 'random' | 'real'
type TimerKind = 'none' | 'per' | 'total'
type Config = {
  mode: Mode
  books: BookId[]
  count: number
  timer: TimerKind
  perSeconds: number
  totalMinutes: number
  immediate: boolean
  shuffleOptions: boolean
}
type Item = { q: Question; order: number[] }
type Run = { items: Item[]; config: Config; startedAt: number }
type Result = { run: Run; answers: (number | null)[]; finishedAt: number; reason: 'done' | 'time' }

const QUESTION_COUNTS = countBy(QUESTIONS)
const EASE = [0.2, 0.7, 0.2, 1] as const

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.max(0, s) % 60).padStart(2, '0')}`

function poolFor(c: Config) {
  return c.mode === 'one' || c.mode === 'multi' ? QUESTIONS.filter((q) => c.books.includes(q.book)) : QUESTIONS
}

function buildRun(config: Config, source?: Question[]): Run {
  const pool = source ?? poolFor(config)
  const n = source ? pool.length : Math.min(config.count, pool.length)
  const picked = config.mode === 'real' && !source ? balancedPick(pool, (q) => q.book, n) : shuffle(pool).slice(0, n)
  const items = picked.map((q) => ({ q, order: config.shuffleOptions ? shuffle([0, 1, 2, 3, 4]) : [0, 1, 2, 3, 4] }))
  return { items, config, startedAt: Date.now() }
}

export default function Quiz() {
  const [params] = useSearchParams()
  const preset = params.get('livro') as BookId | null
  const [config, setConfig] = useState<Config>(() => ({
    mode: preset && BOOK[preset] ? 'one' : 'multi',
    books: preset && BOOK[preset] ? [preset] : BOOKS.map((b) => b.id),
    count: 10,
    timer: 'none',
    perSeconds: 90,
    totalMinutes: 20,
    immediate: true,
    shuffleOptions: true,
  }))
  const [run, setRun] = useState<Run | null>(null)
  const [result, setResult] = useState<Result | null>(null)

  const start = (c: Config, source?: Question[]) => {
    setResult(null)
    setRun(buildRun(c, source))
  }

  if (result)
    return (
      <Results
        result={result}
        onRetryWrong={(qs) => start(result.run.config, qs)}
        onAgain={() => start(result.run.config)}
        onSetup={() => (setResult(null), setRun(null))}
      />
    )
  if (run)
    return (
      <Runner
        key={run.startedAt}
        run={run}
        onExit={() => setRun(null)}
        onFinish={(answers, reason) => (setRun(null), setResult({ run, answers, reason, finishedAt: Date.now() }))}
      />
    )
  return <Setup config={config} setConfig={setConfig} onStart={() => start(config)} />
}

/* ------------------------------------------------------------------ setup */

const MODES: { value: Mode; label: string; note: string }[] = [
  { value: 'one', label: 'Um livro', note: 'Questões de uma obra só.' },
  { value: 'multi', label: 'Vários', note: 'Sorteio entre as obras marcadas.' },
  { value: 'random', label: 'Aleatório', note: 'Sorteio livre entre as quatro obras.' },
  { value: 'real', label: 'Real', note: 'Como na prova: obras em proporção, gabarito no final.' },
]

function Setup({ config, setConfig, onStart }: { config: Config; setConfig: (c: Config) => void; onStart: () => void }) {
  const set = (patch: Partial<Config>) => setConfig({ ...config, ...patch })
  const pool = poolFor(config)
  const total = Math.min(config.count, pool.length)
  const pickBooks = config.mode === 'one' || config.mode === 'multi'
  const real = config.mode === 'real'

  const toggleBook = (id: BookId) => {
    if (config.mode === 'one') return set({ books: [id] })
    const has = config.books.includes(id)
    set({ books: has ? config.books.filter((b) => b !== id) : [...config.books, id] })
  }
  const setMode = (mode: Mode) => {
    if (mode === 'one') return set({ mode, books: [config.books[0] ?? 'gh'] })
    if (mode === 'real') return set({ mode, immediate: false, timer: 'total', totalMinutes: Math.max(5, Math.round((total * 2) / 5) * 5) })
    set({ mode, immediate: config.mode === 'real' ? true : config.immediate })
  }

  const timeLabel = config.timer === 'none' ? 'Sem limite' : config.timer === 'per' ? `${fmt(config.perSeconds)} por questão` : `${config.totalMinutes} min no total`
  const included = pickBooks ? BOOKS.filter((b) => config.books.includes(b.id)) : BOOKS

  return (
    <div className="rise grid gap-10 lg:grid-cols-[1fr_340px] lg:gap-14">
      <div className="flex min-w-0 flex-col gap-9">
        <header className="flex flex-col gap-1">
          <p className="text-sm text-soft">Quiz</p>
          <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">Monte seu quiz</h1>
        </header>

        <section className="flex flex-col gap-3">
          <Segmented label="Modo" value={config.mode} onChange={setMode} options={MODES.map((m) => ({ value: m.value, label: m.label }))} />
          <p className="text-sm text-soft">{MODES.find((m) => m.value === config.mode)!.note}</p>
        </section>

        <AnimatePresence initial={false}>
          {pickBooks && (
            <motion.section initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="-m-1 overflow-hidden p-1">
              <BookPicker selected={config.books} onToggle={toggleBook} multi={config.mode === 'multi'} counts={QUESTION_COUNTS} unit="questões" />
            </motion.section>
          )}
        </AnimatePresence>

        <div className="grid gap-x-12 gap-y-9 md:grid-cols-2">
          <section className="flex flex-col gap-4">
            <h2 className="flex items-center gap-2 text-sm font-medium">
              <Target className="size-4 text-soft" /> Questões
            </h2>
            <Slider
              label="Quantidade de questões"
              min={5}
              max={Math.max(5, pool.length)}
              step={5}
              value={Math.min(config.count, Math.max(5, pool.length))}
              onChange={(count) => set({ count })}
              format={(v) => `${Math.min(v, pool.length)} de ${pool.length}`}
            />
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="flex items-center gap-2 text-sm font-medium">
              <Timer className="size-4 text-soft" /> Tempo
            </h2>
            <Segmented
              label="Tempo"
              value={config.timer}
              onChange={(timer) => set({ timer })}
              options={[
                { value: 'none', label: 'Livre' },
                { value: 'per', label: 'Por questão' },
                { value: 'total', label: 'Total' },
              ]}
            />
            {config.timer === 'per' && (
              <Slider label="Segundos por questão" min={30} max={300} step={30} value={config.perSeconds} onChange={(perSeconds) => set({ perSeconds })} format={fmt} />
            )}
            {config.timer === 'total' && (
              <Slider label="Minutos no total" min={5} max={120} step={5} value={config.totalMinutes} onChange={(totalMinutes) => set({ totalMinutes })} format={(v) => `${v} min`} />
            )}
          </section>

          <section className="flex flex-col gap-4 md:col-span-2 md:flex-row md:gap-12">
            <div className="flex-1">
              <Switch label="Mostrar gabarito a cada questão" checked={config.immediate} onChange={(immediate) => set({ immediate })} disabled={real} />
            </div>
            <div className="flex-1">
              <Switch label="Embaralhar alternativas" checked={config.shuffleOptions} onChange={(shuffleOptions) => set({ shuffleOptions })} />
            </div>
          </section>
        </div>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="flex flex-col gap-6 rounded-3xl bg-card p-6 ring-1 ring-line">
          <div>
            <motion.p key={total} initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="font-serif text-7xl leading-none tabular-nums">
              {total}
            </motion.p>
            <p className="mt-1 text-soft">questões</p>
          </div>
          <ul className="flex flex-col gap-2.5 text-sm">
            <li className="flex items-center gap-2.5">
              <Library className="size-4 text-soft" />
              <span className="flex -space-x-1.5">
                {included.map((b) => (
                  <img key={b.id} src={b.cover} alt={b.title} title={b.title} className="h-7 w-5 rounded-[3px] object-cover ring-2 ring-card" />
                ))}
              </span>
              <span className="text-soft">{included.length === 4 ? 'Todas as obras' : `${included.length} obra${included.length === 1 ? '' : 's'}`}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Clock className="size-4 text-soft" /> {timeLabel}
            </li>
            <li className="flex items-center gap-2.5">
              <Check className="size-4 text-soft" /> {config.immediate ? 'Gabarito a cada questão' : 'Gabarito no final'}
            </li>
          </ul>
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            disabled={total === 0}
            onClick={onStart}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-ink font-medium text-paper transition hover:opacity-90 disabled:opacity-35"
          >
            {total === 0 ? 'Escolha uma obra' : 'Começar'} <ArrowRight className="size-4" />
          </motion.button>
        </div>
      </aside>
    </div>
  )
}

/* ----------------------------------------------------------------- runner */

function useCountdown(deadline: number | null, onExpire: () => void) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    if (deadline === null) return
    const id = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(id)
  }, [deadline])
  const left = deadline === null ? null : Math.ceil((deadline - now) / 1000)
  useEffect(() => {
    if (left !== null && left <= 0) onExpire()
  }, [left, onExpire])
  return left
}

function Runner({
  run,
  onExit,
  onFinish,
}: {
  run: Run
  onExit: () => void
  onFinish: (answers: (number | null)[], reason: 'done' | 'time') => void
}) {
  const { items, config } = run
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>(() => items.map(() => null))
  const [selected, setSelected] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [qStarted, setQStarted] = useState(Date.now)

  const item = items[index]
  const last = index === items.length - 1

  const advance = useCallback(
    (final: (number | null)[]) => {
      if (last) return onFinish(final, 'done')
      setIndex((i) => i + 1)
      setSelected(null)
      setRevealed(false)
      setQStarted(Date.now())
    },
    [last, onFinish],
  )

  const commit = useCallback(
    (choice: number | null) => {
      const final = answers.map((v, i) => (i === index ? choice : v))
      setAnswers(final)
      if (config.immediate) setRevealed(true)
      else advance(final)
    },
    [advance, answers, config.immediate, index],
  )

  const totalLeft = useCountdown(
    config.timer === 'total' ? run.startedAt + config.totalMinutes * 60_000 : null,
    useCallback(() => onFinish(answers.map((v, i) => (i === index && !revealed ? selected : v)), 'time'), [answers, index, onFinish, revealed, selected]),
  )
  const perLeft = useCountdown(
    config.timer === 'per' && !revealed ? qStarted + config.perSeconds * 1000 : null,
    useCallback(() => commit(selected), [commit, selected]),
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const pos = LETTERS.indexOf(e.key.toUpperCase())
      if (pos >= 0 && !revealed) setSelected((s) => (s === item.order[pos] ? null : item.order[pos]))
      if (e.key === 'Enter') {
        if (revealed) advance(answers)
        else if (selected !== null) commit(selected)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const book = BOOK[item.q.book]
  const left = config.timer === 'total' ? totalLeft : perLeft
  const limit = config.timer === 'total' ? config.totalMinutes * 60 : config.perSeconds
  const urgent = left !== null && left <= Math.min(15, limit * 0.15)
  const done = index + (revealed ? 1 : 0)

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8">
      <div className="flex items-center gap-4">
        <button onClick={onExit} aria-label="Sair do quiz" className="inline-flex size-9 items-center justify-center rounded-full text-soft hover:bg-wash hover:text-ink">
          <X className="size-5" />
        </button>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-wash">
          <motion.div className="h-full rounded-full" animate={{ width: `${(done / items.length) * 100}%`, backgroundColor: book.accent }} transition={{ duration: 0.5, ease: EASE }} />
        </div>
        <span className="text-sm tabular-nums text-soft">
          {index + 1}/{items.length}
        </span>
        {left !== null && (
          <motion.span
            animate={urgent ? { scale: [1, 1.08, 1] } : { scale: 1 }}
            transition={urgent ? { duration: 1, repeat: Infinity } : undefined}
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm tabular-nums ${urgent ? 'bg-red-500/15 text-red-600 dark:text-red-400' : 'bg-wash text-soft'}`}
          >
            <Clock className="size-3.5" /> {fmt(Math.max(0, left))}
          </motion.span>
        )}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={item.q.id} initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -32 }} transition={{ duration: 0.3, ease: EASE }}>
          <QuestionView
            q={item.q}
            order={item.order}
            selected={revealed ? answers[index] : selected}
            revealed={revealed}
            onSelect={setSelected}
            footer={
              <div className="flex justify-end gap-2 pt-2">
                {revealed ? (
                  <ActionButton onClick={() => advance(answers)}>
                    {last ? 'Ver resultado' : 'Próxima'} <ArrowRight className="size-4" />
                  </ActionButton>
                ) : (
                  <>
                    <ActionButton variant="ghost" onClick={() => commit(null)}>
                      <SkipForward className="size-4" /> Pular
                    </ActionButton>
                    <ActionButton onClick={() => commit(selected)} disabled={selected === null}>
                      <Check className="size-4" /> Confirmar
                    </ActionButton>
                  </>
                )}
              </div>
            }
          />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/* ---------------------------------------------------------------- results */

function Stat({ value, label, tone }: { value: string; label: string; tone?: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl bg-card p-5 ring-1 ring-line">
      <span className={`font-serif text-4xl leading-none tabular-nums sm:text-5xl ${tone ?? ''}`}>{value}</span>
      <span className="text-sm text-soft">{label}</span>
    </div>
  )
}

function Results({
  result,
  onRetryWrong,
  onAgain,
  onSetup,
}: {
  result: Result
  onRetryWrong: (qs: Question[]) => void
  onAgain: () => void
  onSetup: () => void
}) {
  const { run, answers } = result
  const [onlyWrong, setOnlyWrong] = useState(false)
  const [open, setOpen] = useState<string | null>(null)
  const rows = run.items.map((it, i) => ({ ...it, n: i + 1, chosen: answers[i], ok: answers[i] === it.q.answer }))
  const right = rows.filter((r) => r.ok).length
  const blank = rows.filter((r) => r.chosen === null).length
  const wrong = rows.filter((r) => !r.ok)
  const pct = Math.round((right / rows.length) * 100)
  const seconds = Math.round((result.finishedAt - run.startedAt) / 1000)

  const perBook = useMemo(
    () =>
      BOOKS.map((b) => {
        const mine = rows.filter((r) => r.q.book === b.id)
        return { b, total: mine.length, ok: mine.filter((r) => r.ok).length }
      }).filter((x) => x.total > 0),
    [rows],
  )

  return (
    <div className="rise flex flex-col gap-10">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-soft">{result.reason === 'time' ? 'Tempo esgotado' : 'Resultado'}</p>
          <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">
            {right} de {rows.length} corretas
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {wrong.length > 0 && (
            <button onClick={() => onRetryWrong(wrong.map((w) => w.q))} className="inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-medium text-paper hover:opacity-90">
              <RotateCcw className="size-4" /> Refazer erradas
            </button>
          )}
          <button onClick={onAgain} className="inline-flex h-11 items-center gap-2 rounded-full border border-line px-5 text-sm hover:bg-wash">
            <Shuffle className="size-4" /> Novo sorteio
          </button>
          <button onClick={onSetup} className="inline-flex h-11 items-center gap-2 rounded-full border border-line px-5 text-sm hover:bg-wash">
            Configurar
          </button>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="relative col-span-2 flex items-center gap-5 rounded-2xl bg-card p-5 ring-1 ring-line lg:col-span-1">
          <svg viewBox="0 0 36 36" className="size-20 -rotate-90">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--wash)" strokeWidth="3.5" />
            {pct > 0 && (
              <motion.circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                stroke="var(--ink)"
                strokeWidth="3.5"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: pct / 100 }}
                transition={{ duration: 1.1, ease: EASE, delay: 0.2 }}
              />
            )}
          </svg>
          <div className="flex flex-col gap-1">
            <span className="font-serif text-5xl leading-none tabular-nums">{pct}%</span>
            <span className="text-sm text-soft">de acerto</span>
          </div>
        </div>
        <Stat value={String(wrong.length - blank)} label="erradas" tone="text-red-600 dark:text-red-400" />
        <Stat value={String(blank)} label="em branco" />
        <Stat value={fmt(Math.round(seconds / rows.length))} label={`por questão · total ${fmt(seconds)}`} />
      </section>

      {perBook.length > 1 && (
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {perBook.map(({ b, total, ok }, i) => (
            <div key={b.id} className="flex flex-col gap-3 rounded-2xl bg-card p-4 ring-1 ring-line">
              <div className="flex items-center gap-3">
                <img src={b.cover} alt="" className="h-10 w-7 rounded-[3px] object-cover" />
                <p className="min-w-0 flex-1 truncate text-sm font-medium">{b.title}</p>
                <span className="text-sm tabular-nums text-soft">
                  {ok}/{total}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-wash">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: b.accent }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(ok / total) * 100}%` }}
                  transition={{ duration: 0.9, delay: 0.3 + i * 0.1, ease: EASE }}
                />
              </div>
            </div>
          ))}
        </section>
      )}

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-serif text-3xl">Gabarito comentado</h2>
          <Segmented
            label="Filtro"
            value={onlyWrong ? 'w' : 'a'}
            onChange={(v) => setOnlyWrong(v === 'w')}
            options={[
              { value: 'a', label: `Todas (${rows.length})` },
              { value: 'w', label: `Erradas (${wrong.length})` },
            ]}
          />
        </div>
        <div className="grid items-start gap-3 lg:grid-cols-2">
          {rows
            .filter((r) => !onlyWrong || !r.ok)
            .map((r) => {
              const isOpen = open === r.q.id
              return (
                <div key={r.q.id} className="overflow-hidden rounded-2xl bg-card ring-1 ring-line">
                  <button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : r.q.id)} className="flex w-full items-start gap-3 p-4 text-left">
                    <span className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-white ${r.ok ? 'bg-emerald-500' : r.chosen === null ? 'bg-soft' : 'bg-red-500'}`}>
                      {r.ok ? <Check className="size-3.5" strokeWidth={3} /> : <X className="size-3.5" strokeWidth={3} />}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className="flex flex-wrap items-center gap-x-2 text-xs text-soft">
                        {r.n} · <BookTag id={r.q.book} />
                      </span>
                      <span className="text-[15px] leading-snug">
                        <b className="font-semibold">{r.q.topic}.</b> {r.q.stem}…
                      </span>
                    </span>
                    <motion.span animate={{ rotate: isOpen ? 180 : 0 }} className="mt-0.5 text-soft">
                      <ChevronDown className="size-5" />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: EASE }}>
                        <div className="flex flex-col gap-3 px-4 pb-5 pl-13 text-[15px] leading-relaxed">
                          <p className="font-serif text-[17px] text-soft">
                            {r.q.context} <span className="font-sans text-xs">({r.q.page})</span>
                          </p>
                          {r.chosen !== null && !r.ok && (
                            <p className="text-red-600 dark:text-red-400">
                              <b>Sua resposta, {LETTERS[r.order.indexOf(r.chosen)]}:</b> {r.q.options[r.chosen]}
                            </p>
                          )}
                          <p className="text-emerald-700 dark:text-emerald-400">
                            <b>Gabarito, {LETTERS[r.order.indexOf(r.q.answer)]}:</b> {r.q.options[r.q.answer]}
                          </p>
                          <p className="text-soft">{r.q.explanation}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
        </div>
      </section>
    </div>
  )
}
