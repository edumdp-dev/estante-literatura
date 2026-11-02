# Estante — estudo de literatura

Quiz, flashcards e resumos do capítulo 1 das obras da prova: *A Paixão Segundo G.H.* (pp. 5–16), *A visão das plantas* (abertura, pp. 8–20), *Almas Mortas* e *O Ateneu*.

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
