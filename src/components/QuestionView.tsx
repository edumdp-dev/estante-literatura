import { Check, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import type { ReactNode } from 'react'
import { BOOK, type Question } from '../data/books'

export const LETTERS = ['A', 'B', 'C', 'D', 'E']
const SPRING = { type: 'spring', stiffness: 520, damping: 32 } as const

/**
 * Enunciado no formato da atividade (tema. "trecho" (p.) enunciado) + alternativas.
 * `selected` is a pending choice; `revealed` shows the answer key.
 */
export function QuestionView({
  q,
  order,
  selected,
  revealed,
  onSelect,
  footer,
}: {
  q: Question
  order: number[]
  selected: number | null
  revealed: boolean
  onSelect: (orig: number | null) => void
  footer?: ReactNode
}) {
  const book = BOOK[q.book]
  const correctPos = order.indexOf(q.answer)

  return (
    <div className="flex flex-col gap-6">
      <figure className="flex flex-col gap-3">
        <blockquote className="border-l-2 pl-5 font-serif text-[21px] leading-relaxed sm:text-2xl" style={{ borderColor: book.accent }}>
          {q.context}
        </blockquote>
        <figcaption className="flex items-center gap-2 pl-5 text-sm text-soft">
          <img src={book.cover} alt="" className="h-6 w-4 rounded-[2px] object-cover" />
          <span>
            {book.author}, <i>{book.title}</i>, {q.page}
          </span>
        </figcaption>
      </figure>

      <p className="text-lg leading-snug sm:text-xl">
        <b className="font-semibold">{q.topic}.</b> {q.stem}…
      </p>

      <ol className="flex flex-col gap-2.5">
        {order.map((orig, pos) => {
          const isSel = selected === orig
          const isRight = orig === q.answer
          const state = revealed ? (isRight ? 'right' : isSel ? 'wrong' : 'dim') : isSel ? 'sel' : 'idle'
          return (
            <li key={orig}>
              <motion.button
                type="button"
                layout
                disabled={revealed}
                onClick={() => onSelect(isSel ? null : orig)}
                whileTap={revealed ? undefined : { scale: 0.99 }}
                animate={
                  state === 'wrong'
                    ? { x: [0, -7, 7, -4, 4, 0], scale: 1 }
                    : state === 'right'
                      ? { scale: [1, 1.015, 1], x: 0 }
                      : { scale: state === 'sel' ? 1.008 : 1, x: 0 }
                }
                transition={state === 'wrong' || state === 'right' ? { duration: 0.45 } : SPRING}
                className={`relative flex w-full items-start gap-4 overflow-hidden rounded-2xl border p-4 text-left text-base leading-relaxed transition-colors sm:p-5 ${
                  state === 'right'
                    ? 'border-emerald-500/70 bg-emerald-500/10'
                    : state === 'wrong'
                      ? 'border-red-500/70 bg-red-500/10'
                      : state === 'sel'
                        ? 'border-ink bg-card'
                        : state === 'dim'
                          ? 'border-line bg-card opacity-50'
                          : 'border-line bg-card hover:border-soft/50'
                }`}
              >
                <span className="relative mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border border-line text-xs font-semibold">
                  <AnimatePresence>
                    {(state === 'sel' || state === 'right' || state === 'wrong') && (
                      <motion.span
                        key={state}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={SPRING}
                        className={`absolute inset-[-1px] rounded-full ${state === 'right' ? 'bg-emerald-500' : state === 'wrong' ? 'bg-red-500' : 'bg-ink'}`}
                      />
                    )}
                  </AnimatePresence>
                  <span className={`relative ${state === 'sel' ? 'text-paper' : state === 'right' || state === 'wrong' ? 'text-white' : 'text-soft'}`}>
                    {state === 'right' ? <Check className="size-3.5" strokeWidth={3} /> : state === 'wrong' ? <X className="size-3.5" strokeWidth={3} /> : LETTERS[pos]}
                  </span>
                </span>
                <span>{q.options[orig]}</span>
              </motion.button>
            </li>
          )
        })}
      </ol>

      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className={`flex flex-col gap-1.5 border-l-2 pl-5 ${selected === q.answer ? 'border-emerald-500' : 'border-red-500'}`}>
              <p className="text-sm font-medium">
                {selected === q.answer ? 'Correto' : selected === null ? 'Sem resposta' : 'Incorreto'} · gabarito {LETTERS[correctPos]}
              </p>
              <p className="leading-relaxed text-soft">{q.explanation}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {footer}
    </div>
  )
}

export function ActionButton({
  children,
  onClick,
  variant = 'primary',
  disabled,
}: {
  children: ReactNode
  onClick: () => void
  variant?: 'primary' | 'ghost'
  disabled?: boolean
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: 0.96 }}
      className={`inline-flex h-11 w-40 items-center justify-center gap-2 rounded-full text-sm font-medium transition disabled:pointer-events-none disabled:opacity-35 ${
        variant === 'primary' ? 'bg-ink text-paper hover:opacity-90' : 'border border-line bg-card text-soft hover:text-ink'
      }`}
    >
      {children}
    </motion.button>
  )
}
