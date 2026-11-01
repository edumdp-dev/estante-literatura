import {
  ArrowRight,
  BookCopy,
  Check,
  Clock,
  Dices,
  Eye,
  FileQuestion,
  Hash,
  Library,
  RotateCcw,
  Shuffle,
  Timer,
  Trophy,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useSearchParams } from 'react-router-dom'
import { BookPicker, BookTag, Field, Segmented } from '../components/ui'
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
  feedback: 'now' | 'end'
  shuffleOptions: boolean
}
type Item = { q: Question; order: number[] }
type Run = { items: Item[]; config: Config; startedAt: number }
type Result = { run: Run; answers: (number | null)[]; finishedAt: number; reason: 'done' | 'time' }

const LETTERS = ['A', 'B', 'C', 'D', 'E']
const COUNT_OPTIONS = [5, 10, 15, 20, 30, 0] // 0 = todas
const QUESTION_COUNTS = countBy(QUESTIONS)

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.max(0, s) % 60).padStart(2, '0')}`

function poolFor(c: Config) {
  return c.mode === 'one' || c.mode === 'multi' ? QUESTIONS.filter((q) => c.books.includes(q.book)) : QUESTIONS
}

function buildRun(config: Config, source?: Question[]): Run {
  const pool = source ?? poolFor(config)
  const n = source ? pool.length : config.count === 0 ? pool.length : Math.min(config.count, pool.length)
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
    feedback: 'now',
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
        onRetryWrong={(qs) => start({ ...result.run.config }, qs)}
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

function Setup({ config, setConfig, onStart }: { config: Config; setConfig: (c: Config) => void; onStart: () => void }) {
  const set = (patch: Partial<Config>) => setConfig({ ...config, ...patch })
  const pool = poolFor(config)
  const total = config.count === 0 ? pool.length : Math.min(config.count, pool.length)

  const toggleBook = (id: BookId) => {
    if (config.mode === 'one') return set({ books: [id] })
    const has = config.books.includes(id)
    set({ books: has ? config.books.filter((b) => b !== id) : [...config.books, id] })
  }

  const setMode = (mode: Mode) => {
    if (mode === 'one') return set({ mode, books: [config.books[0] ?? 'gh'] })
    if (mode === 'real') return set({ mode, feedback: 'end', timer: 'total', totalMinutes: Math.max(10, Math.ceil((total * 2) / 5) * 5) })
    set({ mode })
  }

  const modes = [
    { value: 'one' as const, label: <><BookCopy className="hidden size-4 sm:block" /> Um livro</>, hint: 'Questões de uma única obra' },
    { value: 'multi' as const, label: <><Library className="hidden size-4 sm:block" /> Vários</>, hint: 'Escolha as obras' },
    { value: 'random' as const, label: <><Dices className="hidden size-4 sm:block" /> Aleatório</>, hint: 'Sorteio livre entre todas as obras' },
    { value: 'real' as const, label: <><FileQuestion className="hidden size-4 sm:block" /> Real</>, hint: 'Simulado: obras misturadas em proporção, correção só no fim' },
  ]

  const modeNote: Partial<Record<Mode, string>> = {
    random: 'Sorteio livre entre todas as obras.',
    real: 'Como na prova: obras em proporção, cronômetro geral e gabarito no final.',
  }

  return (
    <div className="rise mx-auto flex max-w-3xl flex-col gap-9">
      <header className="flex flex-col gap-2">
        <p className="text-sm text-soft">Quiz</p>
        <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">Monte sua prova</h1>
      </header>

      <Field label="Modo" icon={<Shuffle className="size-4" />}>
        <Segmented label="Modo" value={config.mode} onChange={setMode} options={modes} />
        {modeNote[config.mode] && <p className="text-sm text-soft">{modeNote[config.mode]}</p>}
      </Field>

      {(config.mode === 'one' || config.mode === 'multi') && (
        <Field label={config.mode === 'one' ? 'Obra' : 'Obras'} icon={<Library className="size-4" />}>
          <BookPicker selected={config.books} onToggle={toggleBook} multi={config.mode === 'multi'} counts={QUESTION_COUNTS} unit="questões" />
        </Field>
      )}

      <Field label="Quantidade de questões" icon={<Hash className="size-4" />}>
        <Segmented
          label="Quantidade"
          value={config.count}
          onChange={(count) => set({ count })}
          options={COUNT_OPTIONS.map((n) => ({ value: n, label: n === 0 ? `Todas (${pool.length})` : String(n) }))}
        />
      </Field>

      <Field label="Tempo" icon={<Timer className="size-4" />}>
        <Segmented
          label="Tempo"
          value={config.timer}
          onChange={(timer) => set({ timer })}
          options={[
            { value: 'none', label: 'Sem tempo' },
            { value: 'per', label: 'Por questão' },
            { value: 'total', label: 'Prova inteira' },
          ]}
        />
        {config.timer === 'per' && (
          <Segmented
            label="Segundos por questão"
            value={config.perSeconds}
            onChange={(perSeconds) => set({ perSeconds })}
            options={[30, 60, 90, 120, 180].map((s) => ({ value: s, label: s < 60 ? `${s}s` : `${s / 60} min` }))}
          />
        )}
        {config.timer === 'total' && (
          <Segmented
            label="Minutos no total"
            value={config.totalMinutes}
            onChange={(totalMinutes) => set({ totalMinutes })}
            options={[5, 10, 15, 20, 30, 45, 60].map((m) => ({ value: m, label: `${m} min` }))}
          />
        )}
      </Field>

      <Field label="Correção" icon={<Eye className="size-4" />}>
        <Segmented
          label="Correção"
          value={config.feedback}
          onChange={(feedback) => set({ feedback })}
          options={[
            { value: 'now', label: 'A cada questão' },
            { value: 'end', label: 'Só no final' },
          ]}
        />
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-soft">
          <input
            type="checkbox"
            checked={config.shuffleOptions}
            onChange={(e) => set({ shuffleOptions: e.target.checked })}
            className="size-4 accent-[var(--ink)]"
          />
          Embaralhar a ordem das alternativas
        </label>
      </Field>

      <div className="flex flex-wrap items-center gap-4 border-t border-line pt-6">
        <button
          type="button"
          disabled={total === 0}
          onClick={onStart}
          className="inline-flex h-12 items-center gap-2 rounded-full bg-ink px-6 font-medium text-paper transition hover:opacity-90 disabled:opacity-40"
        >
          Começar {total > 0 && `· ${total} questões`} <ArrowRight className="size-4" />
        </button>
        {total === 0 && <p className="text-sm text-soft">Marque pelo menos uma obra.</p>}
        {config.timer !== 'none' && total > 0 && (
          <p className="flex items-center gap-1.5 text-sm text-soft">
            <Clock className="size-4" />
            {config.timer === 'per' ? `${fmt(config.perSeconds)} por questão` : `${config.totalMinutes} min no total`}
          </p>
        )}
      </div>
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
  const [revealed, setRevealed] = useState(false)
  const [qStarted, setQStarted] = useState(Date.now)

  const item = items[index]
  const chosen = answers[index]
  const immediate = config.feedback === 'now'
  const last = index === items.length - 1

  const next = useCallback(() => {
    if (last) return onFinish(answers, 'done')
    setIndex((i) => i + 1)
    setRevealed(false)
    setQStarted(Date.now())
  }, [answers, last, onFinish])

  const choose = (orig: number) => {
    if (revealed) return
    setAnswers((a) => a.map((v, i) => (i === index ? orig : v)))
    if (immediate) setRevealed(true)
  }

  const totalLeft = useCountdown(
    config.timer === 'total' ? run.startedAt + config.totalMinutes * 60_000 : null,
    useCallback(() => onFinish(answers, 'time'), [answers, onFinish]),
  )
  const perLeft = useCountdown(
    config.timer === 'per' && !revealed ? qStarted + config.perSeconds * 1000 : null,
    useCallback(() => (immediate ? setRevealed(true) : next()), [immediate, next]),
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return
      const k = e.key.toUpperCase()
      const pos = LETTERS.indexOf(k) >= 0 ? LETTERS.indexOf(k) : ['1', '2', '3', '4', '5'].indexOf(k)
      if (pos >= 0) choose(item.order[pos])
      if (e.key === 'Enter' && (revealed || (!immediate && chosen !== null))) next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const book = BOOK[item.q.book]
  const left = config.timer === 'total' ? totalLeft : perLeft
  const limit = config.timer === 'total' ? config.totalMinutes * 60 : config.perSeconds
  const urgent = left !== null && left <= Math.min(15, limit * 0.15)

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex items-center gap-4">
        <button onClick={onExit} className="inline-flex items-center gap-1.5 text-sm text-soft hover:text-ink">
          <X className="size-4" /> Sair
        </button>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-wash">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${((index + (revealed || chosen !== null ? 1 : 0)) / items.length) * 100}%`, background: book.accent }}
          />
        </div>
        <span className="text-sm tabular-nums text-soft">
          {index + 1}/{items.length}
        </span>
        {left !== null && (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm tabular-nums ${urgent ? 'bg-red-500/15 text-red-600 dark:text-red-400' : 'bg-wash text-soft'}`}
          >
            <Clock className="size-3.5" /> {fmt(Math.max(0, left))}
          </span>
        )}
      </div>

      <AnimatePresence mode="wait" initial={false}>
      <motion.article
        key={item.q.id}
        initial={{ opacity: 0, x: 28 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -28 }}
        transition={{ duration: 0.28, ease: [0.2, 0.7, 0.2, 1] }}
        className="flex flex-col gap-6"
      >
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <BookTag id={item.q.book} />
          <span className="text-xs text-soft">·</span>
          <span className="text-xs font-medium uppercase tracking-[0.12em] text-soft">{item.q.topic}</span>
        </div>

        <figure className="relative overflow-hidden rounded-2xl border border-line bg-card">
          <span className="absolute inset-y-0 left-0 w-1" style={{ background: book.accent }} />
          <blockquote className="px-6 pb-4 pt-5 font-serif text-[19px] leading-relaxed sm:px-8 sm:text-[21px]">
            {item.q.context}
          </blockquote>
          <figcaption className="flex items-center gap-2 border-t border-line px-6 py-2.5 text-xs text-soft sm:px-8">
            <img src={book.cover} alt="" className="h-5 w-3.5 rounded-[2px] object-cover" />
            {book.author}, <i>{book.title}</i> · {item.q.page}
          </figcaption>
        </figure>

        <h2 className="text-[17px] font-medium leading-snug sm:text-lg">{item.q.stem}…</h2>

        <ol className="flex flex-col gap-2.5">
          {item.order.map((orig, pos) => {
            const isChosen = chosen === orig
            const isRight = orig === item.q.answer
            let tone = 'border-line bg-card hover:border-soft/50'
            if (revealed && isRight) tone = 'border-emerald-500/70 bg-emerald-500/10'
            else if (revealed && isChosen) tone = 'border-red-500/70 bg-red-500/10'
            else if (isChosen) tone = 'border-ink bg-wash'
            return (
              <li key={orig}>
                <button
                  type="button"
                  disabled={revealed}
                  onClick={() => choose(orig)}
                  className={`flex w-full items-start gap-3.5 rounded-xl border p-4 text-left text-[15px] leading-relaxed transition ${tone}`}
                >
                  <span
                    className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                      revealed && isRight
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : revealed && isChosen
                          ? 'border-red-500 bg-red-500 text-white'
                          : isChosen
                            ? 'border-ink bg-ink text-paper'
                            : 'border-line text-soft'
                    }`}
                  >
                    {revealed && isRight ? <Check className="size-3.5" strokeWidth={3} /> : revealed && isChosen ? <X className="size-3.5" strokeWidth={3} /> : LETTERS[pos]}
                  </span>
                  <span>{item.q.options[orig]}</span>
                </button>
              </li>
            )
          })}
        </ol>

        {revealed && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-wash p-5">
            <p className="mb-1.5 text-sm font-medium">
              {chosen === item.q.answer ? 'Correto.' : chosen === null ? `Tempo esgotado. Resposta: ${LETTERS[item.order.indexOf(item.q.answer)]}.` : `Resposta correta: ${LETTERS[item.order.indexOf(item.q.answer)]}.`}
            </p>
            <p className="text-[15px] leading-relaxed text-soft">
              <span className="font-medium text-ink">Justificação. </span>
              {item.q.explanation}
            </p>
          </motion.div>
        )}

        <div className="flex items-center justify-between gap-3">
          <p className="hidden text-xs text-soft sm:block">Teclado: A–E para responder, Enter para avançar.</p>
          {(revealed || !immediate) && (
            <button
              type="button"
              onClick={next}
              className="ml-auto inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-medium text-paper transition hover:opacity-90 disabled:opacity-40"
            >
              {last ? 'Ver resultado' : chosen === null ? 'Pular' : 'Próxima'} <ArrowRight className="size-4" />
            </button>
          )}
        </div>
      </motion.article>
      </AnimatePresence>
    </div>
  )
}

/* ---------------------------------------------------------------- results */

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
  const rows = run.items.map((it, i) => ({ ...it, chosen: answers[i], ok: answers[i] === it.q.answer }))
  const right = rows.filter((r) => r.ok).length
  const pct = Math.round((right / rows.length) * 100)
  const wrong = rows.filter((r) => !r.ok)
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
    <div className="rise mx-auto flex max-w-3xl flex-col gap-8">
      <header className="flex flex-col gap-6 rounded-3xl border border-line bg-card p-6 sm:flex-row sm:items-center sm:p-8">
        <div className="relative flex size-32 shrink-0 items-center justify-center">
          <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--wash)" strokeWidth="3" />
            {pct > 0 && <motion.circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              stroke="var(--ink)"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: pct / 100 }}
              transition={{ duration: 1.1, ease: [0.2, 0.7, 0.2, 1], delay: 0.2 }}
            />}
          </svg>
          <span className="font-serif text-4xl">{pct}%</span>
        </div>
        <div className="flex flex-col gap-2">
          <p className="flex items-center gap-2 text-sm text-soft">
            <Trophy className="size-4" /> {result.reason === 'time' ? 'Tempo esgotado' : 'Quiz concluído'} · {fmt(seconds)}
          </p>
          <h1 className="font-serif text-3xl tracking-tight sm:text-4xl">
            {right} de {rows.length} corretas
          </h1>
          <div className="mt-2 flex flex-wrap gap-2">
            {wrong.length > 0 && (
              <button onClick={() => onRetryWrong(wrong.map((w) => w.q))} className="inline-flex h-10 items-center gap-2 rounded-full bg-ink px-4 text-sm font-medium text-paper hover:opacity-90">
                <RotateCcw className="size-4" /> Refazer as {wrong.length} erradas
              </button>
            )}
            <button onClick={onAgain} className="inline-flex h-10 items-center gap-2 rounded-full border border-line px-4 text-sm hover:bg-wash">
              <Shuffle className="size-4" /> Novo sorteio
            </button>
            <button onClick={onSetup} className="inline-flex h-10 items-center gap-2 rounded-full border border-line px-4 text-sm hover:bg-wash">
              Configurar
            </button>
          </div>
        </div>
      </header>

      {perBook.length > 1 && (
        <section className="grid gap-3 sm:grid-cols-2">
          {perBook.map(({ b, total, ok }) => (
            <div key={b.id} className="flex items-center gap-3 rounded-2xl border border-line bg-card p-3">
              <img src={b.cover} alt="" className="h-12 w-8 rounded object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{b.title}</p>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-wash">
                  <div className="h-full rounded-full" style={{ width: `${(ok / total) * 100}%`, background: b.accent }} />
                </div>
              </div>
              <span className="text-sm tabular-nums text-soft">
                {ok}/{total}
              </span>
            </div>
          ))}
        </section>
      )}

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl">Gabarito comentado</h2>
          <Segmented
            label="Filtro"
            value={onlyWrong ? 'w' : 'a'}
            onChange={(v) => setOnlyWrong(v === 'w')}
            options={[
              { value: 'a', label: 'Todas' },
              { value: 'w', label: `Erradas (${wrong.length})` },
            ]}
          />
        </div>
        {rows
          .map((r, i) => ({ ...r, n: i + 1 }))
          .filter((r) => !onlyWrong || !r.ok)
          .map((r) => (
            <details key={r.q.id} className="group rounded-2xl border border-line bg-card open:pb-2">
              <summary className="flex cursor-pointer list-none items-start gap-3 p-4">
                <span className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-white ${r.ok ? 'bg-emerald-500' : 'bg-red-500'}`}>
                  {r.ok ? <Check className="size-3.5" strokeWidth={3} /> : <X className="size-3.5" strokeWidth={3} />}
                </span>
                <span className="flex flex-col gap-1">
                  <span className="flex flex-wrap items-center gap-2 text-xs text-soft">
                    Questão {r.n} · <BookTag id={r.q.book} /> · {r.q.topic}
                  </span>
                  <span className="text-[15px] leading-snug">{r.q.stem}…</span>
                </span>
              </summary>
              <div className="flex flex-col gap-3 px-4 pb-3 pl-13 text-[15px] leading-relaxed">
                <p className="font-serif text-[17px] text-soft">
                  {r.q.context} <span className="font-sans text-xs">({r.q.page})</span>
                </p>
                {r.chosen !== null && !r.ok && (
                  <p className="text-red-600 dark:text-red-400">
                    <b>Sua resposta — {LETTERS[r.order.indexOf(r.chosen)]}:</b> {r.q.options[r.chosen]}
                  </p>
                )}
                {r.chosen === null && <p className="text-red-600 dark:text-red-400">Sem resposta.</p>}
                <p className="text-emerald-700 dark:text-emerald-400">
                  <b>Resposta correta — {LETTERS[r.order.indexOf(r.q.answer)]}:</b> {r.q.options[r.q.answer]}
                </p>
                <p className="text-soft">
                  <b className="text-ink">Justificação.</b> {r.q.explanation}
                </p>
              </div>
            </details>
          ))}
      </section>
    </div>
  )
}
