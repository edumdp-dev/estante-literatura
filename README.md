# Estante — estudo de literatura

Quiz, flashcards e resumos das obras da prova: *A Paixão Segundo G.H.*, *A visão das plantas*, *Almas Mortas* (cap. I) e *O Ateneu* (cap. I).

https://literatura.duds.dev

## Rodar

```bash
npm install
npm run dev
```

## Conteúdo

Questões e flashcards ficam em `src/data/content/<livro>.json`; capas, ilustrações e resumos em `src/data/books.ts` e `public/img/`.

Formato de uma questão: `topic`, `context` (trecho literal), `page`, `stem`, `options` (5), `answer` (índice 0–4), `explanation`.

## Publicar

```bash
npm run deploy   # build + wrangler deploy (Cloudflare Workers, literatura.duds.dev)
```
