import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Book } from '../data/books'

export function BookCard({ b, large = false }: { b: Book; large?: boolean }) {
  return (
    <Link
      to={`/livros/${b.id}`}
      className={`group relative block overflow-hidden rounded-3xl bg-black ${large ? 'aspect-[4/5] sm:aspect-[5/4]' : 'aspect-[4/3] sm:aspect-[3/2]'}`}
    >
      <img
        src={b.art}
        alt={`Ilustração de ${b.title}`}
        loading="lazy"
        className="absolute inset-0 size-full object-cover transition duration-[1.2s] ease-out group-hover:scale-[1.06] group-hover:opacity-80"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex items-end gap-4 p-5 text-white sm:p-7">
        <img
          src={b.cover}
          alt=""
          className={`shrink-0 rounded-[4px] object-cover shadow-2xl ring-1 ring-white/20 transition duration-500 ease-out group-hover:-translate-y-2 group-hover:-rotate-3 ${large ? 'h-28 w-[75px] sm:h-36 sm:w-24' : 'h-16 w-11'}`}
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-white/60">
            {b.author} · {b.year}
          </p>
          <p className={`font-serif leading-tight ${large ? 'mt-1 text-3xl sm:text-4xl' : 'text-2xl'}`}>{b.title}</p>
          {large && (
            <p className="mt-2 max-h-0 overflow-hidden text-[15px] leading-relaxed text-white/80 opacity-0 transition-all duration-500 group-hover:max-h-24 group-hover:opacity-100">
              {b.logline}
            </p>
          )}
        </div>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/15 backdrop-blur transition duration-300 group-hover:bg-white group-hover:text-black">
          <ArrowUpRight className="size-5 transition duration-300 group-hover:rotate-45" />
        </span>
      </div>
    </Link>
  )
}
