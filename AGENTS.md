# Sito del makerspace — note per gli agenti

Sito Astro statico. I contenuti sono scritti dai maker via pull request: la
regola di fondo è che **il sito deve rifiutare il contenuto malformato invece di
renderizzarlo male**.

## Regole visive (design system Gorgo Lab)

Token e regole in `src/styles/global.css`. Da rispettare sempre:

- due colori piatti, blu `--gl-blue` e arancio `--gl-orange`. **Nessun gradiente.**
- sfondo carta `--gl-paper`; il nero non esiste, l'inchiostro è `--gl-ink`.
- bordi netti da 2px, angoli piccoli (4px, 8px sulle card), ombra offset dura.
- hover = colore o opacità; **mai `scale()`**. Press = `translate(2px, 2px)` e
  l'ombra collassa.
- font: Archivo Black solo maiuscolo per i titoli (classe `.shout`),
  Space Grotesk per il testo, JetBrains Mono per dati e metadati.
- **niente emoji** nell'interfaccia: si usa `<Icon name="…" />` (Lucide).
  Le emoji restano ammesse solo nel testo informale scritto dai maker.
- l'unica animazione continua del sito è il marquee del coro.

## Invarianti da non rompere

- `src/content.config.ts` è l'unica fonte di verità sul frontmatter. Se un campo
  diventa opzionale lì, controllare che ogni layout gestisca l'assenza.
- Un progetto = una cartella con dentro tutto (`index.md` + immagini + allegati).
  Mai spostare gli asset in `public/`: perderebbero l'ottimizzazione.
- I componenti usabili nei file MDX dei maker stanno in `src/components/mdx.ts`
  e **non possono ricevere path relativi a file**: la risoluzione degli asset
  relativi la fa il layout, che conosce `entry.id`.
- `check-assets.mjs` deve restare severo: la storia di git è per sempre.
- Dentro `.prose` ci va **solo** ciò che il maker scrive nel markdown. I blocchi
  strutturali (galleria, allegati) passano dallo slot `dopo` del ContentLayout:
  le regole tipografiche — margini fra `<li>`, bordi e margini sulle `<img>` —
  sono pensate per il testo e deformano i componenti che finiscono lì dentro.
- `src/content/progetti/modello-pagina-progetto/` è la vetrina di ogni
  formattazione disponibile: aggiungendo un componente o una sintassi, va
  aggiunto anche lì, altrimenti nessuno saprà che esiste.
- Le copertine segnaposto si generano con `scripts/placeholder.mjs`, che disegna
  solo forme piatte in palette. Niente gradienti, niente texture, niente testo.

## Sviluppo

```
astro dev --background      # gestibile con astro dev stop|status|logs
npm run validate            # gli stessi controlli della CI
```

## Documentazione

Astro: https://docs.astro.build

- [Content collections](https://docs.astro.build/en/guides/content-collections/)
- [Immagini](https://docs.astro.build/en/guides/images/)
- [Componenti](https://docs.astro.build/en/basics/astro-components/)
- [Routing](https://docs.astro.build/en/guides/routing/)
