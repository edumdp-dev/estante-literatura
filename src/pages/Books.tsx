import { BookCard } from '../components/BookCard'
import { Reveal } from '../components/ui'
import { BOOKS } from '../data/books'

export default function Books() {
  return (
    <div className="flex flex-col gap-8">
      <header className="rise flex flex-col gap-1">
        <p className="text-sm text-soft">Livros</p>
        <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">As quatro obras</h1>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        {BOOKS.map((b, i) => (
          <Reveal key={b.id} delay={i * 0.06}>
            <BookCard b={b} large />
          </Reveal>
        ))}
      </div>
    </div>
  )
}
