import almas from './content/almas.json'
import ateneu from './content/ateneu.json'
import gh from './content/gh.json'
import visao from './content/visao.json'

export type BookId = 'gh' | 'visao' | 'almas' | 'ateneu'

export type Question = {
  id: string
  book: BookId
  topic: string
  context: string
  page: string
  stem: string
  options: string[]
  answer: number
  explanation: string
}

export type Flashcard = {
  id: string
  book: BookId
  tag: string
  front: string
  back: string
}

export type Book = {
  id: BookId
  title: string
  short: string
  author: string
  year: number
  origin: string
  movement: string
  scope: string
  cover: string
  art: string
  accent: string
  logline: string
  bullets: string[]
  concepts: string[]
  extra?: { label: string; href: string }
}

export const BOOKS: Book[] = [
  {
    id: 'gh',
    title: 'A Paixão Segundo G.H.',
    short: 'G.H.',
    author: 'Clarice Lispector',
    year: 1964,
    origin: 'Brasil',
    movement: 'Romance introspectivo · Modernismo (3ª geração)',
    scope: 'Obra inteira',
    cover: '/img/cover-gh.webp',
    art: '/img/art-gh.webp',
    accent: 'var(--color-gh)',
    logline: 'Uma tarde no quarto da empregada desfaz a identidade organizada de uma escultora.',
    bullets: [
      'G.H., escultora de classe média alta no Rio, decide arrumar o quarto da empregada Janair, que acabara de sair.',
      'Encontra o quarto limpo e um mural a carvão na parede: um homem, uma mulher e um cão — lido por ela como um retrato hostil de si.',
      'Ao abrir o guarda-roupa, esmaga uma barata na porta; diante da massa branca que sai do inseto, vive uma crise que dissolve sua “montagem humana”.',
      'A experiência dura poucas horas, mas ocupa o livro todo: é narrada no dia seguinte, por uma narradora autodiegética que tenta entender o que viveu.',
      'A fala se apoia num “tu” imaginado (a mão que ela segura) e avança por perguntas, paradoxos, metalinguagem e fluxo da consciência.',
      'Os 33 capítulos se encadeiam: a frase que fecha um abre o seguinte. O percurso leva ao neutro, à despersonalização e à deseroização.',
    ],
    concepts: ['Autodiegese', 'Focalização interna', 'Monólogo interior', 'Tempo psicológico', 'Metalinguagem', 'O neutro', 'Deseroização'],
  },
  {
    id: 'visao',
    title: 'A visão das plantas',
    short: 'Visão',
    author: 'Djaimilia Pereira de Almeida',
    year: 2019,
    origin: 'Portugal / Angola',
    movement: 'Ficção contemporânea · ed. Todavia, 2021',
    scope: 'Obra inteira',
    cover: '/img/cover-visao.webp',
    art: '/img/art-visao.webp',
    accent: 'var(--color-visao)',
    logline: 'Um velho pirata e traficante de escravizados volta para casa e passa a cuidar de um jardim.',
    bullets: [
      'O capitão Celestino regressa, velho, à casa da família numa vila portuguesa e transforma o quintal abandonado num jardim exuberante.',
      'A delicadeza com as flores convive com o passado de pirataria, tráfico e assassinatos — como a cal despejada no porão do navio (“antes água que cal”).',
      'Narrador heterodiegético: aproxima-se de Celestino, mas revela o que ele interpreta mal, como a suposta reciprocidade das plantas.',
      'A vila oscila entre medo e fascínio; as crianças querem aventuras e padre Alfredo tenta, sem sucesso, levá-lo à confissão.',
      'Com a velhice vêm cegueira, delírios e aparições (a menina holandesa, a velha mulher negra); o jardim vira “jardineiro do jardineiro”.',
      'Celestino morre “sem uma dúvida na consciência tranquila”; o padre lê o jardim como uma “aleluia”. O julgamento fica com o leitor.',
    ],
    concepts: ['Heterodiegese', 'Analepse', 'Personificação', 'Antítese água/cal', 'Memória colonial', '“Sangue e luz”'],
    extra: { label: 'Mapa mental da obra', href: '/img/mapa-visao.webp' },
  },
  {
    id: 'almas',
    title: 'Almas Mortas',
    short: 'Almas',
    author: 'Nikolai Gógol',
    year: 1842,
    origin: 'Rússia',
    movement: 'Realismo russo · sátira · trad. Isolino Caramalho',
    scope: 'Capítulo I',
    cover: '/img/cover-almas.webp',
    art: '/img/art-almas.webp',
    accent: 'var(--color-almas)',
    logline: 'Um viajante simpático demais chega a uma cidade de província e conquista todo mundo — menos o leitor.',
    bullets: [
      'Tchichikov chega à cidade numa caleche; o narrador o descreve por negações (“nem feio nem bonito, nem gordo nem magro”), evitando defini-lo.',
      'Dois homens do povo, à porta de uma taberna, comentam a roda da carruagem, não o viajante; a hospedaria recebe descrição concreta, exagerada e grotesca.',
      'Ele faz perguntas “sem importância”: nomes e cargos das autoridades, número de servos dos proprietários, epidemias na região.',
      'O jardim descrito pelo narrador desmente a notícia do jornal; Tchichikov elogia caminhos e funcionários com tratamentos elevados.',
      'No sarau, os fraques negros revoluteiam “como moscas”; ele observa gordos e magros e se aproxima de Manilov e Sobakevich depois de saber quantos servos têm.',
      'Fala pouco de si, adapta a conversa a cada interlocutor e é aprovado por todos — até a última frase anunciar algo que abalará essa imagem.',
    ],
    concepts: ['Ironia', 'Narrador intruso', 'Grotesco', 'Contraste', 'Sátira social', 'Servos (“almas”)'],
  },
  {
    id: 'ateneu',
    title: 'O Ateneu',
    short: 'Ateneu',
    author: 'Raul Pompeia',
    year: 1888,
    origin: 'Brasil',
    movement: 'Realismo · impressionismo · romance de memórias',
    scope: 'Capítulo I (degustação)',
    cover: '/img/cover-ateneu.webp',
    art: '/img/art-ateneu.webp',
    accent: 'var(--color-ateneu)',
    logline: '“Vais encontrar o mundo”: a entrada de Sérgio no internato mais famoso do Império.',
    bullets: [
      'Sérgio adulto rememora a entrada no internato, contrapondo o encantamento infantil à avaliação crítica posterior.',
      'A advertência paterna — “Vais encontrar o mundo” — apresenta o colégio como aprendizagem das disputas sociais e da perda de ilusões.',
      'A despedida da família mistura sofrimento, desejo de autonomia e orgulho; a reflexão inicial questiona a idealização dos “felizes tempos”.',
      'O Ateneu constrói reputação por propaganda, festas e prestígio econômico, expondo a educação burguesa do Segundo Reinado.',
      'Aristarco surge autoritário e vaidoso; festas, ginástica e a presença da princesa unem espetáculo, disciplina e hierarquia em prosa impressionista.',
      'Na matrícula, D. Ema e o corte dos cachos marcam a despedida da infância; o capítulo fecha com Aristarco como “homem sanduíche” da educação nacional.',
    ],
    concepts: ['Autodiegese', 'Memória retrospectiva', 'Ironia', 'Impressionismo', 'Crítica institucional', 'Caricatura'],
  },
]

export const BOOK: Record<BookId, Book> = Object.fromEntries(BOOKS.map((b) => [b.id, b])) as Record<BookId, Book>

export const QUESTIONS: Question[] = [gh, visao, almas, ateneu].flatMap((c) => c.questions as Question[])
export const FLASHCARDS: Flashcard[] = [gh, visao, almas, ateneu].flatMap((c) => c.flashcards as Flashcard[])

export const countBy = <T extends { book: BookId }>(items: T[]) =>
  items.reduce<Record<BookId, number>>((acc, it) => ((acc[it.book] += 1), acc), { gh: 0, visao: 0, almas: 0, ateneu: 0 })
