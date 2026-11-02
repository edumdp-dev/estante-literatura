import { Check } from 'lucide-react'
import { motion } from 'motion/react'
import { useId, type ReactNode } from 'react'
import { BOOKS, type BookId } from '../data/books'

export function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay, ease: [0.2, 0.7, 0.2, 1] }}
    >
      {children}
    </motion.div>
  )
}

export function Segmented<T extends string | number>({
  value,
  onChange,
  options,
  label,
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: ReactNode; hint?: string }[]
  label: string
}) {
  const group = useId()
  return (
    <div className="max-w-full overflow-x-auto [scrollbar-width:none]">
      <div role="radiogroup" aria-label={label} className="inline-flex gap-0.5 rounded-full border border-line bg-card p-1">
        {options.map((o) => {
          const active = o.value === value
          return (
            <button
              key={String(o.value)}
              type="button"
              role="radio"
              aria-checked={active}
              title={o.hint}
              onClick={() => onChange(o.value)}
              className={`relative inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 text-sm transition-colors ${active ? 'text-paper' : 'text-soft hover:text-ink'}`}
            >
              {active && (
                <motion.span layoutId={`seg-${group}`} className="absolute inset-0 rounded-full bg-ink" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />
              )}
              <span className="relative inline-flex items-center gap-1.5">{o.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function BookPicker({
  selected,
  onToggle,
  multi,
  counts,
  unit,
  compact = false,
}: {
  selected: BookId[]
  onToggle: (id: BookId) => void
  multi: boolean
  counts: Record<BookId, number>
  unit: string
  compact?: boolean
}) {
  return (
    <div role={multi ? 'group' : 'radiogroup'} className={`grid grid-cols-2 gap-2.5 ${compact ? 'md:grid-cols-4 lg:grid-cols-2' : 'md:grid-cols-4'}`}>
      {BOOKS.map((b) => {
        const on = selected.includes(b.id)
        return (
          <button
            key={b.id}
            type="button"
            role={multi ? 'checkbox' : 'radio'}
            aria-checked={on}
            onClick={() => onToggle(b.id)}
            className={`group relative flex items-center gap-3 rounded-xl border bg-card p-2.5 pr-3 text-left transition ${
              on ? 'border-transparent' : 'border-line hover:border-soft/40'
            }`}
            style={on ? { boxShadow: `0 0 0 2px ${b.accent}` } : undefined}
          >
            <img src={b.cover} alt="" className="h-14 w-10 shrink-0 rounded-md object-cover shadow-sm" />
            <span className="min-w-0">
              <span className="line-clamp-2 text-sm font-medium leading-snug">{b.title}</span>
              <span className="block text-xs text-soft">
                {counts[b.id]} {unit}
              </span>
            </span>
            <span
              className={`absolute right-2 top-2 flex size-5 items-center justify-center rounded-full transition ${on ? 'text-white' : 'border border-line text-transparent'}`}
              style={on ? { background: b.accent } : undefined}
            >
              <Check className="size-3" strokeWidth={3} />
            </span>
          </button>
        )
      })}
    </div>
  )
}

export function Field({ label, icon, children }: { label: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="flex items-center gap-2 text-sm font-medium text-soft">
        {icon}
        {label}
      </h3>
      {children}
    </section>
  )
}

export function BookTag({ id }: { id: BookId }) {
  const b = BOOKS.find((x) => x.id === id)!
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium" style={{ color: b.accent }}>
      <span className="size-1.5 rounded-full" style={{ background: b.accent }} />
      {b.title}
    </span>
  )
}

export function Slider({
  value,
  min,
  max,
  step = 1,
  onChange,
  label,
  format,
}: {
  value: number
  min: number
  max: number
  step?: number
  onChange: (v: number) => void
  label: string
  format: (v: number) => string
}) {
  const pct = max === min ? 100 : ((value - min) / (max - min)) * 100
  return (
    <div className="flex items-center gap-4">
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="range flex-1"
        style={{ background: `linear-gradient(to right, var(--ink) ${pct}%, var(--line) ${pct}%)` }}
      />
      <span className="w-20 text-right text-sm font-medium tabular-nums">{format(value)}</span>
    </div>
  )
}

export function Switch({ checked, onChange, label, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <label className={`flex items-center justify-between gap-4 text-[15px] ${disabled ? 'opacity-45' : 'cursor-pointer'}`}>
      {label}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-10 shrink-0 rounded-full transition-colors ${checked ? 'bg-ink' : 'bg-line'}`}
      >
        <motion.span
          className="absolute top-0.5 left-0.5 size-5 rounded-full bg-paper shadow"
          animate={{ x: checked ? 16 : 0 }}
          transition={{ type: 'spring', stiffness: 600, damping: 35 }}
        />
      </button>
    </label>
  )
}
