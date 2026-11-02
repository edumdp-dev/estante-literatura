import { Link, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import BookDetail from './pages/BookDetail'
import Books from './pages/Books'
import Flashcards from './pages/Flashcards'
import Landing from './pages/Landing'
import Quiz from './pages/Quiz'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/livros" element={<Books />} />
        <Route path="/livros/:id" element={<BookDetail />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/flashcards" element={<Flashcards />} />
        <Route
          path="*"
          element={
            <div className="flex flex-col items-start gap-3 py-20">
              <h1 className="font-serif text-4xl">Página não encontrada</h1>
              <Link to="/" className="text-soft underline underline-offset-4 hover:text-ink">
                Voltar ao início
              </Link>
            </div>
          }
        />
      </Routes>
    </Layout>
  )
}
