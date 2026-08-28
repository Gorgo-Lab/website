---
title: Lampada da banco per il saldatore
summary: Progetto finto, serve solo a provare che l'anteprima delle pull request funzioni. Va cancellato subito dopo.
date: 2026-08-29
authors:
  - Gorgo Lab
tags:
  - elettronica
  - stampa-3d
status: in-corso
cover: ./copertina.jpg
coverAlt: Composizione geometrica arancione e blu, copertina segnaposto
draft: true
---

Questa pagina non è un progetto vero: serve a verificare che il flusso di
pubblicazione funzioni da cima a fondo. Se la stai leggendo su un indirizzo
`pages.dev` che contiene il nome di un ramo, l'anteprima della pull request
funziona; se la stai leggendo sul sito pubblico, qualcosa non va — è marcata
come bozza e in produzione non dovrebbe comparire.

## Cosa sta verificando

- che il push di un ramo faccia partire la build di anteprima su Cloudflare;
- che i quattro controlli della CI girino sulla pull request;
- che `SHOW_DRAFTS` renda visibili le bozze **solo** nell'anteprima;
- che a un secondo commit corrisponda una nuova anteprima.
